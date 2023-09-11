module.exports = function (nit, cron, Self)
{
    return (Self = cron.defineField ("DayOfWeek"))
        .constant ("DAY_NAMES", "SUN|MON|TUE|WED|THU|FRI|SAT")
        .constant ("DAY_NAME_ARRAY", Self.DAY_NAMES.split ("|"))
        .registerItemType ("cron:range", Range =>
        {
            Range
                .meta (
                {
                    min: 0,
                    max: 6,
                    aliases: nit.index (Self.DAY_NAME_ARRAY, null, (v, k) => k),
                    patterns: new RegExp (`^(\\d+|${Self.DAY_NAMES})(-(\\d+|${Self.DAY_NAMES}))?(\\/(\\d+))?$`, "i")
                })
            ;
        })
        .registerItemType ("cron:last-day-of-week")
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
