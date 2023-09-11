module.exports = function (nit, cron)
{
    return cron.defineField ("DayOfMonth")
        .constant ("DAYS_IN_MONTH", [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31])
        .registerItemType ("cron:range", Range =>
        {
            Range.meta ({ min: 1, max: 31 });
        })
        .registerItemType ("cron:last-day-of-month")
        .onGetValueForDate (d => d.getUTCDate ())
        .onForward ((d, v) =>
        {
            d.setUTCDate (d.getUTCDate () + v);
            d.setUTCHours (0);
            d.setUTCMinutes (0);
            d.setUTCSeconds (0);
            d.setUTCMilliseconds (0);
        })
        .method ("applicableToMonth", function (month)
        {
            return this.items.some (item => item.applicableToMonth (month));
        })
    ;
};
