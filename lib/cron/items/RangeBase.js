module.exports = function (nit, cron, Self)
{
    return (Self = cron.defineItem ("RangeBase"))
        .defineMeta ("aliases", "object") // { ALIAS_IN_UPPERCASE: value, ... }
        .defineMeta ("valueAliases", "object") // { from: to, ... }

        .staticMemo ("reverseValueAliases", function ()
        {
            let aliases = {};

            for (let k in this.valueAliases)
            {
                aliases[this.valueAliases[k]] = nit.int (k);
            }

            return aliases;
        })
        .defineInnerClass ("Constraint", "constraints.Custom", Constraint =>
        {
            Constraint
                .m ("error.less_than_min_value", "The %{owner.field.name} value '%{value}' is less than the minimum value %{owner.constructor.min}.")
                .m ("error.greater_than_max_value", "The %{owner.field.name} value '%{value}' is greater than the maximum value %{owner.constructor.max}.")
                .m ("error.interval_out_of_range", "The %{owner.field.name}'s step value '%{owner.interval}' cannot be greater than '%{owner.constructor.max - owner.constructor.min + 1}'.")
                .m ("error.from_value_greater_than_to_value", "The %{owner.field.name}'s from value '%{owner.from}' is greater than the to value '%{owner.to}'.")
            ;
        })
        .field ("from", "integer", "The lower bound of the range.", function (prop, owner) { return owner.constructor.min; })
            .constraint (Self.Constraint.name,
            {
                code: "error.less_than_min_value",
                validator: ctx => ctx.value >= ctx.owner.constructor.min
            })
        .field ("to", "integer", "The upper bound of the range.", function (prop, owner) { return owner.constructor.max; })
            .constraint (Self.Constraint.name,
            {
                code: "error.greater_than_max_value",
                validator: ctx => ctx.value <= ctx.owner.constructor.max
            })
        .field ("values...", "integer")
        .field ("interval", "integer", "The running interval.", 1)
            .constraint ("min", 1)
            .constraint (Self.Constraint.name,
            {
                code: "error.interval_out_of_range",
                validator: ctx => ctx.value <= ctx.owner.constructor.max - ctx.owner.constructor.min + 1
            })

        .check (Self.Constraint.name,
        {
            code: "error.from_value_greater_than_to_value",
            validator: ctx =>
            {
                let owner = ctx.owner;
                let { from, to, constructor:cls } = owner;

                if (from > to)
                {
                    to = nit.coalesce (cls.reverseValueAliases[to], to);
                }

                return from <= to;
            }
        })
        .onGetStepsToNextOccurrence (function (date)
        {
            return this.getStepsToNextValue (date);
        })
    ;
};
