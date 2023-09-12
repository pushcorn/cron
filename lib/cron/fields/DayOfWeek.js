module.exports = function (nit, cron)
{
    return cron.defineField ("DayOfWeek")
        .registerItemType ("cron:range", Range =>
        {
            Range
                .meta (
                {
                    min: 0,
                    max: 6,
                    aliases: nit.index (cron.DAY_NAME_ARRAY, null, (v, k) => k),
                    patterns: new RegExp (`^(\\d|${cron.DAY_NAMES})(-(\\d|${cron.DAY_NAMES}))?(\\/(\\d+))?$`, "i")
                })
            ;
        })
        .registerItemType ("cron:last-day-of-week")
        .registerItemType ("cron:nth-day-of-week")
        .onGetValueForDate (d => d.getUTCDay ())
        .onForward ((d, v) =>
        {
            d.setUTCDate (d.getUTCDate () + v);
            d.setUTCHours (0);
            d.setUTCMinutes (0);
            d.setUTCSeconds (0);
            d.setUTCMilliseconds (0);
        })
    ;
};
