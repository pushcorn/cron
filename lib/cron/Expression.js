module.exports = function (nit, Self)
{
    let writer = new nit.Object.Property.Writer;


    return (Self = nit.defineClass ("cron.Expression"))
        .use ("nit.utils.Humanize")
        .m ("error.unresolvable_expression", "Unable to determine the next occurrence for the expression '%{expr}'.")
        .constant ("MAX_SEARCH_ITERATIONS", 1000)
        .constant ("FIELD_NAMES", "Second Minute Hour DayOfMonth Month DayOfWeek".split (" ").map (nit.lcFirst))
        .constant ("DESC_FIELD_NAMES", "Month DayOfMonth DayOfWeek Hour Minute Second".split (" ").map (nit.lcFirst))
        .constant ("DAY_IN_MONTH", [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31])
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

        .field ("second", "cron.fields.Second", "The second field.", 0)
        .field ("minute", "cron.fields.Minute", "The minute field.", 0)
        .field ("hour", "cron.fields.Hour", "The hour field.", 0)
        .field ("dayOfMonth", "cron.fields.DayOfMonth", "The day of month field.", 1)
        .field ("month", "cron.fields.Month", "The month field.", 1)
        .field ("dayOfWeek", "cron.fields.DayOfWeek", "The day of week field.", 0)
        .field ("timezone", "string", "The time zone.", { setter: v => nit.undefIf (nit.trim (v), "") })
            .constraint ("choice", ...Intl.supportedValuesOf ("timeZone"))

        .check (Self.Constraint.name,
        {
            code: "error.invalid_day_of_month",
            validator: ctx => ctx.owner.month.values.some (month => ctx.owner.dayOfMonth.values.some (dom => dom <= Self.DAY_IN_MONTH[month - 1]))
        })

        .property ("lastDate", "Date", { writer })
        .property ("nextTimeout", "integer", { writer })

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

        .staticMethod ("parse", function (expr, timezone)
        {
            expr = nit.trim (expr);

            let fvs = (Self.MACROS[expr] || expr).split (/\s+/);
            let params = { timezone };

            for (let fn of Self.FIELD_NAMES.slice (-fvs.length))
            {
                params[fn] = fvs.shift ();
            }

            return new Self (params);
        })
        .method ("getValuesForDate", function (date)
        {
            return Self.DESC_FIELD_NAMES.map (fn => this[fn].getValueForDate (date));
        })
        .method ("next", function (from)
        {
            let self = this;

            if (nit.is.int (from))
            {
                from = new Date (from);
            }
            else
            if (nit.is.str (from))
            {
                from = nit.parseDate (from);
            }
            else
            if (!(from instanceof Date))
            {
                from = self.lastDate || new Date ();
            }

            let startTime = from * 1;

            from = new Date (~~(from / 1000) * 1000 + 1000);

            let timezone = self.timezone;
            let remoteTime = nit.timestamp (from, timezone);
            let localTime = nit.parseDate (remoteTime);
            let oldValues = self.getValuesForDate (localTime);
            let newValues;
            let fields = Self.DESC_FIELD_NAMES.map (n => self[n]);
            let iterations = Self.MAX_SEARCH_ITERATIONS;

            if (!self.dayOfMonth.isWildcard && !self.dayOfWeek.isWildcard)
            {
                fields.splice (1, 2, new Self.FieldGroup (self.dayOfMonth, self.dayOfWeek));
            }

            while (!nit.is.equal (oldValues, newValues))
            {
                oldValues = newValues || oldValues;

                for (let f of fields)
                {
                    f.next (localTime);
                }

                newValues = self.getValuesForDate (localTime);

                if (!--iterations)
                {
                    self.throw ("error.unresolvable_expression");
                }
            }

            remoteTime = nit.timestamp (localTime);

            from.setTime (nit.parseDate (remoteTime, timezone));

            self.lastDate = writer.value (from);
            self.nextTimeout = writer.value (from - startTime);

            return from;
        })
    ;
};
