module.exports = function (nit, cron, Self)
{
    return (Self = cron.defineItem ("Hash", "cron.items.RangeBase"))
        .meta ({ patterns: /^H(\(\d+-\d+\))?(\/\d+)?$/ })
        .field ("hasRange", "boolean")
        .field ("interval", "integer", "The running interval.", 1)
            .constraint ("min", 1)
            .constraint (Self.Constraint.name,
            {
                code: "error.interval_out_of_range",
                message: "The %{owner.field.name}'s step value '%{owner.interval}' cannot be greater than '%{owner.from - owner.to + 1}'.",
                condition: "owner.from < owner.to",
                validator: ctx => ctx.value <= ctx.owner.to - ctx.owner.from + 1
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
    ;
};
