module.exports = function (nit, cron, Self)
{
    return (Self = cron.defineItem ("Hash"))
        .meta ({ patterns: /^H(\(\d+-\d+\))?(\/\d+)?$/ })
        .defineInnerClass ("Constraint", "constraints.Custom", Constraint =>
        {
            Constraint
                .m ("error.less_than_min_value", "The %{owner.field.name} value '%{value}' is less than the minimum value %{owner.constructor.min}.")
                .m ("error.greater_than_max_value", "The %{owner.field.name} value '%{value}' is greater than the maximum value %{owner.constructor.max}.")
                .m ("error.min_value_greater_than_max_value", "The %{owner.field.name}'s from value '%{owner.from}' is greater than the to value '%{owner.to}'.")
                .m ("error.interval_out_of_range", "The %{owner.field.name}'s step value '%{owner.interval}' cannot be greater than '%{owner.from - owner.to + 1}'.")
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

        .field ("hasRange", "boolean")
        .field ("interval", "integer", "The running interval.", 1)
            .constraint ("min", 1)
            .constraint (Self.Constraint.name,
            {
                code: "error.interval_out_of_range",
                condition: "owner.from < owner.to",
                validator: ctx => ctx.value <= ctx.owner.to - ctx.owner.from + 1
            })

        .check (Self.Constraint.name,
        {
            code: "error.min_value_greater_than_max_value",
            validator: ctx => ctx.owner.from < ctx.owner.to
        })
        .memo ("values", function ()
        {
            let self = this;
            let hashCode = self.hashCode
                ^ ~~self.field?.hashCode
                ^ ~~self.field?.entry?.hashCode
            ;

            let { from, to, interval } = self;
            let cnt = to - from + 1;
            let offset = Math.abs (hashCode) % cnt;
            let values = [];

            if (interval == 1)
            {
                values.push (offset + from);
            }
            else
            {
                for (let i = from + offset % interval; i <= to; i += interval)
                {
                    values.push (i);
                }
            }

            return values;
        })
        .memo ("hashKey", function ()
        {
            return [this.expr];
        })
        .onParse (function ()
        {
            let self = this;
            let { expr, constructor: cls } = self;
            let [range, interval] = expr.split ("/");

            if (range != "H")
            {
                let [from, to] = range.slice (2, -1).split ("-");

                self.hasRange = true;
                self.from = from;
                self.to = to;
            }
            else
            {
                self.from = cls.min;
                self.to = cls.max;
            }

            self.interval = interval || self.interval;
            interval = self.interval;
        })
        .onGetStepsToNextOccurrence (function (date)
        {
            return this.getStepsToNextValue (date, this.values);
        })
    ;
};
