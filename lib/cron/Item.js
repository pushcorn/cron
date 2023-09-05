module.exports = function (nit)
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
        .lifecycleMethod ("parse", true)
        .lifecycleMethod ("getStepsToNextOccurrence", true, function (date)
        {
            let self = this;
            let cls = self.constructor;

            date = date || new Date;

            return cls[cls.kGetStepsToNextOccurrence].call (self, date);
        })
    ;
};
