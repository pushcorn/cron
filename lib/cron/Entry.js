module.exports = function (nit, cron, Self)
{
    let writer = new nit.Object.Property.Writer;


    return (Self = nit.defineClass ("cron.Entry"))
        .plugin ("hash-code")
        .m ("error.unresolvable_expression", "Unable to determine the next occurrence for the expression '%{expr}'.")
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

        .field ("[expr]", "string", "The cron expression.", "0 0 0 1 1 0")
        .field ("[timezone]", "string+", "The time zone.", nit.timezone ())
            .constraint ("choice", { choices: nit.Date.TIMEZONES })
        .field ("[command]", "string", "The command to run.")

        .property ("second", "cron.fields.Second?", 0, { backref: "entry" })
        .property ("minute", "cron.fields.Minute?", 0, { backref: "entry" })
        .property ("hour", "cron.fields.Hour?", 0, { backref: "entry" })
        .property ("dayOfMonth", "cron.fields.DayOfMonth?", 1, { backref: "entry" })
        .property ("month", "cron.fields.Month?", 1, { backref: "entry" })
        .property ("dayOfWeek", "cron.fields.DayOfWeek?", 0, { backref: "entry" })

        .check (Self.Constraint.name,
        {
            code: "error.invalid_day_of_month",
            validator: ctx =>
                ctx.owner.month.values.some (month =>
                    ctx.owner.dayOfMonth.applicableToMonth (month)
                )
        })

        .property ("lastDate", "Date", { writer })
        .property ("nextTimeout", "integer", { writer })

        .onConstruct (function (expr)
        {
            expr = nit.trim (expr);

            let fvs = (Self.MACROS[expr] || expr).split (/\s+/);

            for (let fn of Self.FIELD_NAMES.slice (-fvs.length))
            {
                this[fn] = fvs.shift ();
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

            from = from || self.lastDate;
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

            self.lastDate = writer.value (to.date);
            self.nextTimeout = writer.value (to - from);

            return to;
        })
    ;
};
