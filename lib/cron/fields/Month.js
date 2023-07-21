module.exports = function (nit, cron, Self)
{
    return (Self = cron.defineField ("Month"))
        .constant ("MONTH_NAMES", "JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC")
        .constant ("MONTH_NAME_ARRAY", Self.MONTH_NAMES.split ("|"))
        .constant ("EXPR_PATTERNS", Self.EXPR_PATTERNS
            .concat (new RegExp (`^(\\d+|${Self.MONTH_NAMES})(-(\\d+|${Self.MONTH_NAMES}))?(\\/(\\d+))?$`, "i"))
        )
        .assignStatic (
        {
            min: 1,
            max: 12,
            exprPatterns: Self.EXPR_PATTERNS
        })
        .do ("Item", Item =>
        {
            Item
                .onParseValue (function (month)
                {
                    return nit.int (month) || (Self.MONTH_NAME_ARRAY.indexOf (month.toUpperCase ()) + 1);
                })
            ;
        })
    ;
};
