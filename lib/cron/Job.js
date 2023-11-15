module.exports = function (nit, cron, Self)
{
    let writer = new nit.Object.Property.Writer;


    return (Self = nit.defineClass ("cron.Job"))
        .use ("*child_process.spawn")
        .use ("nit.utils.Humanize")
        .use ("nit.Command")
        .m ("error.unresolvable_expression", "Unable to determine the next occurrence for the expression '%{expr}'.")
        .plugin ("hash-code", "id", "expr", "command", "timezone")
        .plugin ("log-forwarder", "logger", true)
        .staticProperty ("nextId", "integer", 1)
        .constant ("MAX_SEARCH_ITERATIONS", 1000)
        .constant ("FIELD_NAMES", "Second Minute Hour DayOfMonth Month DayOfWeek".split (" ").map (nit.lcFirst))
        .constant ("DESC_FIELD_NAMES", "Month DayOfMonth DayOfWeek Hour Minute Second".split (" ").map (nit.lcFirst))
        .constant ("MACROS",
        {
            "@yearly": "0 0 1 1 *",
            "@annually": "0 0 1 1 *",
            "@monthly": "0 0 1 * *",
            "@weekly": "0 0 * * 0",
            "@daily": "0 0 * * *",
            "@midnight": "0 0 * * *",
            "@hourly": "0 * * * *"
        })

        .defineInnerClass ("Constraint", "constraints.Custom", Constraint =>
        {
            Constraint
                .m ("error.invalid_day_of_month", "One or more days are invalid for the specified months.")
            ;
        })
        .defineInnerClass ("FieldGroup", FieldGroup =>
        {
            FieldGroup
                .field ("<fields...>", "cron.Field")
                .getter ("expr", function ()
                {
                    return this.fields.map (f => f.expr).join ("|");
                })
                .method ("next", function (date)
                {
                    let ds = this.fields.map (f => f.next (new Date (date)));

                    date.setTime (Math.min (...ds));
                })
            ;
        })

        .field ("<id>", "integer", "The job ID.",
        {
            setter: function (v)
            {
                Self.nextId = (v = Math.max (Self.nextId, v)) + 1;

                return v;
            }
        })
        .field ("<expr>", "string", "The cron expression.")
        .field ("<command>", "string", "The command to run.")
        .field ("<timezone>", "string", "The time zone.", () => nit.timezone ())
            .constraint ("timezone")
        .field ("shell", "boolean|string", "Use shell to run the command.", true)
        .field ("env", "object?", "Additional environment variables")
        .field ("nextRun", "string", "The local time of the next run.", { writer })
        .field ("nextRunUtc", "string", "The UTC time of the next run.", { writer })
        .field ("timeUntilNextRun", "integer", "The remaining time till the next run.", { writer })
        .field ("timeUntilNextRunHumanized", "string", "The human readable duration of the remaining time till the next run.", { writer })
        .field ("lastExitCode", "integer", "The exit code of the last run.", -1, { writer }) // -1 means the job has not been run yet.

        .property ("second", "cron.fields.Second?", 0, { backref: "job" })
        .property ("minute", "cron.fields.Minute?", 0, { backref: "job" })
        .property ("hour", "cron.fields.Hour?", 0, { backref: "job" })
        .property ("dayOfMonth", "cron.fields.DayOfMonth?", 1, { backref: "job" })
        .property ("month", "cron.fields.Month?", 1, { backref: "job" })
        .property ("dayOfWeek", "cron.fields.DayOfWeek?", 0, { backref: "job" })
        .property ("lastDate", "nit.Date", { writer })
        .property ("timer", "nit.utils.Timer", { writer })
        .property ("pendingResult", "nit.Deferred", { writer })

        .check (Self.Constraint.name,
        {
            code: "error.invalid_day_of_month",
            validator: ctx =>
                ctx.owner.month.values.some (month =>
                    ctx.owner.dayOfMonth.applicableToMonth (month)
                )
        })
        .staticMethod ("parseExpr", function (expr)
        {
            var parsed = {};

            expr = nit.trim (expr);

            let fvs = (Self.MACROS[expr] || expr).split (/\s+/);

            for (let fn of Self.FIELD_NAMES.slice (-fvs.length))
            {
                let fieldClass = nit.lookupClass ("cron.fields." + nit.ucFirst (fn));

                parsed[fn] = new fieldClass (fvs.shift ());
            }

            return parsed;
        })
        .onConstruct (function (id, expr)
        {
            nit.assign (this, Self.parseExpr (expr));
        })
        .method ("getValuesForDate", function (date)
        {
            return Self.DESC_FIELD_NAMES.map (fn => this[fn].getValueForDate (date));
        })
        .method ("next", function (from)
        {
            let self = this;
            let timezone = self.timezone;

            from = from || self.lastDate || Date.now ();
            from = new nit.Date ({ date: from instanceof nit.Date ? from.date : from, timezone });

            let next = new Date (~~(cron.getDateAsUtc (from) / 1000) * 1000 + 1000);
            let oldValues = self.getValuesForDate (next);
            let newValues;
            let fields = Self.DESC_FIELD_NAMES.map (n => self[n]);
            let iterations = this.constructor.MAX_SEARCH_ITERATIONS;

            if (!self.dayOfMonth.isWildcard && !self.dayOfWeek.isWildcard)
            {
                fields.splice (1, 2, new Self.FieldGroup (self.dayOfMonth, self.dayOfWeek));
            }

            while (!nit.is.equal (oldValues, newValues))
            {
                oldValues = newValues || oldValues;

                for (let f of fields)
                {
                    f.next (next);
                }

                newValues = self.getValuesForDate (next);

                if (!--iterations)
                {
                    self.throw ("error.unresolvable_expression");
                }
            }

            let to = nit.Date (next.toISOString (), timezone);

            self.lastDate = writer.value (to);
            self.nextRun = writer.value (to.toTimestamp ());
            self.nextRunUtc = writer.value (to.toISOString ());
            self.updateInfo (from);

            return to;
        })
        .method ("updateInfo", function (from)
        {
            let self = this;

            self.timeUntilNextRun = writer.value (self.lastDate - (from || Date.now ()));
            self.timeUntilNextRunHumanized = writer.value (Self.Humanize.duration (self.timeUntilNextRun));

            return self;
        })
        .method ("start", function ()
        {
            let self = this;

            self.next ();

            self.timer = writer.value (new nit.utils.Timer (self.timeUntilNextRun, self.run.bind (self)));
            self.timer.start ();

            return self;
        })
        .method ("stop", async function ()
        {
            let self = this;

            self.timer.stop ();

            await self.pendingResult;

            return self;
        })
        .method ("run", async function ()
        {
            let self = this;
            let pendingResult = new nit.Deferred (nit.utils.Timer.MAX_TIMEOUT);

            pendingResult.then (code => self.lastExitCode = writer.value (code));

            try
            {
                if (self.command.startsWith ("nit*"))
                {
                    let args = Self.Command.Input.tokenize (self.command).slice (1);
                    let cmd = nit.lookupCommand (args.shift ());
                    let result = await cmd ().run (...args);

                    if (!nit.is.undef (result))
                    {
                        self.info (result);
                    }

                    pendingResult.resolve (0);
                }
                else
                {
                    let stdoutBuffers = [];
                    let stderrBuffers = [];
                    let child = Self.spawn (self.command,
                    {
                        shell: self.shell,
                        detached: true,
                        env: nit.assign ({}, process.env, self.env)
                    });

                    child.stdout.on ("data", data =>
                    {
                        stdoutBuffers.push (data);
                    });

                    child.stderr.on ("data", data =>
                    {
                        stderrBuffers.push (data);
                    });

                    child.on ("close", code =>
                    {
                        if (stdoutBuffers.length)
                        {
                            self.info (Buffer.concat (stdoutBuffers).toString ());
                        }

                        if (stderrBuffers.length)
                        {
                            self.error (Buffer.concat (stderrBuffers).toString ());
                        }

                        pendingResult.resolve (code);
                    });
                }

                self.pendingResult = writer.value (pendingResult);
            }
            catch (e)
            {
                pendingResult.resolve (-1);

                throw e;
            }
            finally
            {
                self.start ();
            }
        })
    ;
};
