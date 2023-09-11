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
        .onGetValueForDate (d => d.getUTCMonth () + 1)
        .onForward ((d, v) =>
        {
            d.setUTCMonth (d.getUTCMonth () + v);
            d.setUTCDate (1);
            d.setUTCHours (0);
            d.setUTCMinutes (0);
            d.setUTCSeconds (0);
            d.setUTCMilliseconds (0);
        })
    ;
};
