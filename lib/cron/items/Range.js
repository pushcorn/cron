module.exports = function (nit, cron)
{
    return cron.defineItem ("Range", "cron.items.RangeBase")
        .meta ("patterns",
        [
            /^[*?]$/,
            /^\*(\/(\d+))?$/,
            /^(\d+)(-(\d+))?(\/(\d+))?$/
        ])
        .onIsWildcard (function ()
        {
            let self = this;
            let cls = self.constructor;

            return self.values.length == cls.max - cls.min + 1;
        })
        .onParse (function ()
        {
            let self = this;
            let { expr, constructor: cls } = self;
            let [range, interval] = expr.split ("/");

            if (range == "*" || range == "?")
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

            to = nit.coalesce (to, from);

            self.from = from;
            self.to = to;

            if (from > to)
            {
                to = nit.coalesce (cls.reverseValueAliases[to], to);
            }

            for (let i = from; i <= to; i += self.interval)
            {
                self.values.push (nit.coalesce (cls.valueAliases[i], i));
            }
        })
    ;
};
