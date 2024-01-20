module.exports = function (nit, cron, Self)
{
    let writer = new nit.Object.Property.Writer;


    return (Self = nit.defineClass ("cron.Expression"))
        .m ("error.unresolvable_expression", "Unable to determine the next occurrence for the expression '%{expr}'.")
        .use ("nit.utils.Humanize")
        .plugin ("hash-code", "expr", "timezone")
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

        .field ("<expr>", "string", "The cron expression.")
        .field ("[timezone]", "string", "The time zone.", () => nit.timezone ())
            .constraint ("timezone")
        .field ("nextRun", "string", "The local time of the next run.", { writer })
        .field ("nextRunUtc", "date", "The UTC time of the next run.", { writer })

        .property ("prevDate", "nit.Date", { writer })
        .property ("nextDate", "nit.Date", { writer })
        .property ("second", "cron.fields.Second?", 0, { backref: "expression" })
        .property ("minute", "cron.fields.Minute?", 0, { backref: "expression" })
        .property ("hour", "cron.fields.Hour?", 0, { backref: "expression" })
        .property ("dayOfMonth", "cron.fields.DayOfMonth?", 1, { backref: "expression" })
        .property ("month", "cron.fields.Month?", 1, { backref: "expression" })
        .property ("dayOfWeek", "cron.fields.DayOfWeek?", 0, { backref: "expression" })

        .getter ("timeUntilNextRun", function ()
        {
            let self = this;

            return self.nextDate - (self.prevDate || Date.now ());
        })
        .getter ("timeUntilNextRunHumanized", function ()
        {
            return Self.Humanize.duration (this.timeUntilNextRun);
        })
        .check (Self.Constraint.name,
        {
            code: "error.invalid_day_of_month",
            validator: ctx =>
                ctx.owner.month.values.some (month =>
                    ctx.owner.dayOfMonth.applicableToMonth (month)
                )
        })
        .onConstruct (function (expr)
        {
            let fvs = (Self.MACROS[expr] || expr).split (/\s+/);

            for (let fn of Self.FIELD_NAMES.slice (-fvs.length))
            {
                let fieldClass = nit.lookupClass ("cron.fields." + nit.ucFirst (fn));

                this[fn] = new fieldClass (fvs.shift ());
            }
        })
        .method ("getValuesForDate", function (date)
        {
            return Self.DESC_FIELD_NAMES.map (fn => this[fn].getValueForDate (date));
        })
        .method ("next", function (from)
        {
            let self = this;
            let timezone = self.timezone;

            from = from || self.nextDate || Date.now ();
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

            self.prevDate = writer.value (from);
            self.nextDate = writer.value (to);
            self.nextRun = writer.value (to.toTimestamp ());
            self.nextRunUtc = writer.value (to.valueOf ());

            return self;
        })
    ;
};
