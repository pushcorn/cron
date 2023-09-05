module.exports = function (nit, cron)
{
    return cron.defineField ("DayOfMonth")
        .constant ("DAYS_IN_MONTH", [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31])
        .registerItemType ("cron:range", Range =>
        {
            Range.meta ({ min: 1, max: 31 });
        })
        .onGetValueForDate (d => d.getDate ())
        .onForward ((d, v) =>
        {
            d.setDate (d.getDate () + v);
            d.setHours (0);
            d.setMinutes (0);
            d.setSeconds (0);
            d.setMilliseconds (0);
        })
    ;
};
