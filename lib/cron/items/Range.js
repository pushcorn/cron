module.exports = function (nit, cron, Self)
{
    return (Self = cron.defineItem ("Range"))
        .defineMeta ("aliases", "object") // { ALIAS_IN_UPPERCASE: value, ... }

        .meta ("patterns",
        [
            /^\*$/,
            /^\*(\/(\d+))?$/,
            /^(\d+)(-(\d+))?(\/(\d+))?$/
        ])
        .defineInnerClass ("Constraint", "constraints.Custom", Constraint =>
        {
            Constraint
                .m ("error.greater_than_max_value", "The %{owner.field.name} value '%{value}' is greater than the maximum value %{owner.constructor.max}.")
                .m ("error.min_value_greater_than_max_value", "The %{owner.field.name}'s from value '%{owner.from}' is greater than the to value '%{owner.to}'.")
                .m ("error.interval_out_of_range", "The %{owner.field.name}'s step value '%{owner.interval}' cannot be greater than '%{owner.constructor.max - owner.constructor.min + 1}'.")
            ;
        })
        .field ("from", "integer")
            .constraint (Self.Constraint.name,
            {
                code: "error.greater_than_max_value",
                validator: ctx => ctx.value <= ctx.owner.constructor.max
            })

        .field ("to", "integer")
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
            code: "error.min_value_greater_than_max_value",
            validator: ctx => ctx.owner.from <= ctx.owner.to
        })

        .method ("parseValue", function (str)
        {
            let self = this;
            let cls = self.constructor;

            if (nit.is.int (str))
            {
                return nit.int (str);
            }
            else
            {
                return cls.aliases[nit.trim (str).toUpperCase ()];
            }
        })
        .onIsWildcard (function ()
        {
            let self = this;
            let cls = self.constructor;

            return self.values.length == cls.max - cls.min + 1;
        })
        .onApplicableToMonth (function (month)
        {
            return this.values.some (dom => dom <= cron.DAYS_IN_MONTH[month - 1]);
        })
        .onParse (function ()
        {
            let self = this;
            let { expr, constructor: cls } = self;
            let [range, interval] = expr.split ("/");

            if (range == "*")
            {
                range = `${cls.min}-${cls.max}`;
            }

            range = range.split ("-").map (v => self.parseValue (v));

            if (!nit.is.undef (interval))
            {
                self.interval = interval = nit.int (interval);

                if (range.length < 2)
                {
                    range.push (cls.max);
                }
            }

            self.expr = [range.join ("-"), interval]
                .filter (nit.is.not.undef)
                .join ("/")
            ;

            let [from, to] = range.map (v => self.parseValue (v));

            self.from = from;
            self.to = to = nit.is.undef (to) ? from : to;

            for (let i = from; i <= to; i += self.interval)
            {
                self.values.push (i);
            }
        })
        .onGetStepsToNextOccurrence (function (date)
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
