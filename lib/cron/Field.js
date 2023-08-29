module.exports = function (nit, cron, Self)
{
    return (Self = nit.defineClass ("cron.Field"))
        .categorize ("cron.fields")
        .constant ("EXPR_PATTERNS", [/^\*$/, /^(\d+)(-(\d+))?(\/(\d+))?$/])
        .defineMeta ("min", "integer", 0)
        .defineMeta ("max", "integer", 59)
        .defineMeta ("exprPatterns...", "RegExp", Self.EXPR_PATTERNS)

        .field ("<expr>", "string", "The field expression.", "*")
        .field ("items...", "cron.Field.Item")

        .memo ("values", function ()
        {
            return nit.arrayUnique (nit.array (this.items.map (i => i.values), true))
                .sort (nit.sort.COMPARATORS.integer)
            ;
        })
        .defineInnerClass ("Item", Item =>
        {
            Item
                .defineInnerClass ("Constraint", "constraints.Custom", Constraint =>
                {
                    Constraint
                        .m ("error.invalid_expr", "The %{owner.fieldName} expression '%{value}' is invalid.")
                        .m ("error.greater_than_max_value", "The %{owner.fieldName} value '%{value}' is greater than the maximum value %{owner.fieldClass.max}.")
                        .m ("error.min_value_greater_than_max_value", "The %{owner.fieldName}'s from value '%{owner.from}' is greater than the to value '%{owner.to}'.")
                        .m ("error.interval_out_of_range", "The %{owner.fieldName}'s step value '%{owner.interval}' cannot be greater than '%{owner.fieldClass.max - owner.fieldClass.min + 1}'.")
                    ;
                })
                .field ("<expr>", "string")
                    .constraint (Item.Constraint.name,
                    {
                        code: "error.invalid_expr",
                        validator: ctx => ctx.owner.fieldClass.exprPatterns.some (p => ctx.value.match (p))
                    })

                .field ("from", "integer")
                    .constraint (Item.Constraint.name,
                    {
                        code: "error.greater_than_max_value",
                        validator: ctx => ctx.value <= ctx.owner.fieldClass.max
                    })

                .field ("to", "integer")
                    .constraint (Item.Constraint.name,
                    {
                        code: "error.greater_than_max_value",
                        validator: ctx => ctx.value <= ctx.owner.fieldClass.max
                    })

                .field ("values...", "integer")
                .field ("interval", "integer", "The running interval.", 1)
                    .constraint ("min", 1)
                    .constraint (Item.Constraint.name,
                    {
                        code: "error.interval_out_of_range",
                        validator: ctx => ctx.value <= ctx.owner.fieldClass.max - ctx.owner.fieldClass.min + 1
                    })

                .getter ("fieldClass", function () { return this.constructor.outerClass; })
                .getter ("fieldName", function () { return nit.kababCase (this.fieldClass.simpleName).replace (/-/g, " ").toLowerCase (); })

                .check (Item.Constraint.name,
                {
                    code: "error.min_value_greater_than_max_value",
                    validator: ctx => ctx.owner.from <= ctx.owner.to
                })
                .onConstruct (function ()
                {
                    this.parse ();
                })
                .lifecycleMethod ("parseValue", null, function (str)
                {
                    return nit.int (str);
                })
                .method ("parse", function ()
                {
                    let self = this;
                    let { expr } = self;
                    let [range, interval] = expr.split ("/");

                    range = range.split ("-").map (v => self.parseValue (v));

                    if (!nit.is.undef (interval))
                    {
                        self.interval = interval = nit.int (interval);

                        if (range.length < 2)
                        {
                            range.push (self.fieldClass.max);
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
            ;
        })
        .onDefineSubclass (function (subclass)
        {
            let cls = this;

            subclass.defineInnerClass ("Item", cls.Item.name);
        })
        .onConstruct (function ()
        {
            this.parse ();
        })
        .method ("parse", function ()
        {
            let self = this;
            let cls = self.constructor;
            let { expr } = self;

            if (expr == "*")
            {
                self.expr = expr = `${cls.min}-${cls.max}`;
            }

            self.items = expr.split (",").map (it => new cls.Item (it));

            return self;
        })
    ;
};
