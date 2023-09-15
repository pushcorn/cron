module.exports = function (nit, cron)
{
    return nit.defineClass ("cron.Item")
        .m ("error.invalid_value", "The %{field.name} value '%{value}' is invalid.")
        .plugin ("hash-code")
        .categorize ("cron.items")
        .defineMeta ("min", "integer", 0)
        .defineMeta ("max", "integer", 59)
        .defineMeta ("patterns...", "RegExp")
        .staticMethod ("supports", function (expr)
        {
            return this.getClassChainProperty ("patterns", true)
                .some (p => expr.match (p))
            ;
        })

        .field ("<expr>", "string")
        .property ("field", "cron.Field?")
        .property ("values...", "integer")

        .onConstruct (function ()
        {
            this.parse ();
        })
        .lifecycleMethod ("isWildcard", null, function ()
        {
            return false;
        })
        .lifecycleMethod ("applicableToMonth", null, function (month)
        {
            return this.values.some (dom => dom <= cron.DAYS_IN_MONTH[month - 1]);
        })
        .lifecycleMethod ("parse", true, function ()
        {
            let self = this;
            let cls = self.constructor;

            if (!cls.supports (self.expr))
            {
                self.throw ("error.invalid_value", { value: self.expr });
            }

            return cls[cls.kParse].call (self);
        })
        .lifecycleMethod ("getStepsToNextOccurrence", true, function (date)
        {
            let self = this;
            let cls = self.constructor;

            date = date || cron.getDateAsUtc ();

            return cls[cls.kGetStepsToNextOccurrence].call (self, date);
        })

        // The getTargetDate (date) method is used by getStepsToTargetDate and it should
        // should return an integer which should not be greater than the last date of
        // the month.
        .lifecycleMethod ("getTargetDate", true)

        .method ("getStepsToTargetDate", function (date)
        {
            let self = this;
            let d = new Date (date);
            let steps = 0;
            let diff;

            while ((diff = self.getTargetDate (d) - d.getUTCDate ()) < 0)
            {
                steps += cron.getLastDateOfMonth (d).getUTCDate () - d.getUTCDate () + 1;

                d.setUTCMonth (d.getUTCMonth () + 1);
                d.setUTCDate (1);
            }

            steps += diff;

            return steps;
        })
        .method ("getStepsToNextValue", function (date)
        {
            let self = this;
            let value = self.field.getValueForDate (date);
            let d = new Date (date);
            let steps = 0;

            while (!self.values.includes (value))
            {
                ++steps;

                self.field.forward (d);
                value = self.field.getValueForDate (d);
            }

            return steps;
        })
    ;
};
