module.exports = function (nit, cron, Self)
{
    return (Self = cron.defineField ("DayOfWeek"))
        .constant ("DAY_NAMES", "SUN|MON|TUE|WED|THU|FRI|SAT")
        .constant ("DAY_NAME_ARRAY", Self.DAY_NAMES.split ("|"))
        .constant ("EXPR_PATTERNS", Self.EXPR_PATTERNS
            .concat (new RegExp (`^(\\d+|${Self.DAY_NAMES})(-(\\d+|${Self.DAY_NAMES}))?(\\/(\\d+))?$`, "i"))
        )
        .assignStatic (
        {
            min: 0,
            max: 6,
            exprPatterns: Self.EXPR_PATTERNS
        })
        .do ("Item", Item =>
        {
            Item
                .onParseValue (function (day)
                {
                    return nit.is.int (day) ? nit.int (day) : Self.DAY_NAME_ARRAY.indexOf (day.toUpperCase ());
                })
            ;
        })
    ;
};
