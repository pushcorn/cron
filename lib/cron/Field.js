module.exports = function (nit, cron)
{
    const writer = new nit.Object.Property.Writer;


    return nit.defineClass ("cron.Field")
        .m ("error.invalid_expr", "The %{name} expression '%{expr}' is invalid.")
        .plugin ("hash-code")
        .categorize ("cron.fields")
        .staticProperty ("supportedItemTypes...", "function",
        {
            constraints: nit.new ("constraints.Subclass", "cron.Item")
        })
        .staticMethod ("registerItemType", function (type, builder)
        {
            let self = this;
            let cls = nit.is.func (type)
                ? type
                : nit.lookupComponent (type, "items", "cron.Item")
            ;

            cls = cls.defineSubclass (cls.name, true);

            builder?.call (self, cls);

            self.supportedItemTypes.push (cls);

            return self;
        })
        .staticMethod ("supports", function (expr)
        {
            return this.getClassChainProperty ("supportedItemTypes", true)
                .find (t => t.supports (expr))
            ;
        })

        .field ("<expr>", "string", "The field expression.", "*")
        .property("items...", "cron.Item", { writer, backref: "field" })
        .property ("expression", "cron.Expression")

        .memo ("name", function ()
        {
            return nit.kababCase (this.constructor.simpleName)
                .replace (/-/g, " ")
                .toLowerCase ()
            ;
        })
        .memo ("values", function ()
        {
            return nit.arrayUnique (nit.array (this.items.map (i => i.values), true))
                .filter (nit.is.not.undef)
                .sort (nit.sort.COMPARATORS.integer)
            ;
        })
        .memo ("isWildcard", function ()
        {
            return this.items.some (i => i.isWildcard ());
        })
        .onConstruct (function ()
        {
            this.parse ();
        })
        .lifecycleMethod ("getValueForDate", true, function (date)
        {
            let self = this;
            let cls = self.constructor;

            date = date || cron.getDateAsUtc ();

            return cls[cls.kGetValueForDate].call (self, date);
        })
        .lifecycleMethod ("forward", true, function (date, steps)
        {
            let self = this;
            let cls = self.constructor;

            cls[cls.kForward].call (self, date, steps || 1);
        })
        .method ("getStepsToNextOccurrence", function (date)
        {
            return this.items.map (i => i.getStepsToNextOccurrence (date))
                .filter (nit.is.not.undef)
                .sort (nit.sort.COMPARATORS.integer)
                .shift ()
            ;
        })
        .method ("parse", function ()
        {
            let self = this;
            let cls = self.constructor;

            self.items = writer.value (self.expr.split (",").map (expr =>
            {
                let itemType = cls.supports (expr);

                if (!itemType)
                {
                    self.throw ("error.invalid_expr", { expr });
                }

                return new itemType (expr);
            }));

            return self;
        })
        .method ("next", function (date)
        {
            let steps = this.getStepsToNextOccurrence (date);

            if (steps)
            {
                this.forward (date, steps);
            }

            return date;
        })
    ;
};
