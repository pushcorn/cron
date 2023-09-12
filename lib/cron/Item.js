module.exports = function (nit, cron)
{
    return nit.defineClass ("cron.Item")
        .m ("error.invalid_value", "The %{field.name} value '%{value}' is invalid.")
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

        .field ("<field>", "cron.Field")
        .field ("<expr>", "string")

        .onConstruct (function ()
        {
            this.parse ();
        })
        .lifecycleMethod ("isWildcard", null, function ()
        {
            return false;
        })
        .lifecycleMethod ("applicableToMonth", null, function ()
        {
            return false;
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

        .lifecycleMethod ("getTargetDate", true) // should return the target date whose value is from 1 to 31.
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
    ;
};
