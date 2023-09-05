module.exports = function (nit, cron, Self)
{
    return (Self = cron.defineField ("Month"))
        .constant ("MONTH_NAMES", "JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC")
        .constant ("MONTH_NAME_ARRAY", Self.MONTH_NAMES.split ("|"))
        .registerItemType ("cron:range", Range =>
        {
            Range
                .meta (
                {
                    min: 1,
                    max: 12,
                    aliases: nit.index (Self.MONTH_NAME_ARRAY, null, (v, k) => k + 1),
                    patterns: new RegExp (`^(\\d+|${Self.MONTH_NAMES})(-(\\d+|${Self.MONTH_NAMES}))?(\\/(\\d+))?$`, "i")
                })
            ;
        })
        .onGetValueForDate (d => d.getMonth () + 1)
        .onForward ((d, v) =>
        {
            d.setMonth (d.getMonth () + v);
            d.setDate (1);
            d.setHours (0);
            d.setMinutes (0);
            d.setSeconds (0);
            d.setMilliseconds (0);
        })
    ;
};
