module.exports = function (nit, cron)
{
    return cron.defineField ("Month")
        .registerItemType ("cron:range", Range =>
        {
            Range
                .meta (
                {
                    min: 1,
                    max: 12,
                    aliases: nit.index (cron.MONTH_NAME_ARRAY, null, (v, k) => k + 1),
                    patterns: new RegExp (`^(\\d+|${cron.MONTH_NAMES})(-(\\d+|${cron.MONTH_NAMES}))?(\\/(\\d+))?$`, "i")
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
