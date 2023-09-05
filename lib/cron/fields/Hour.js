module.exports = function (nit, cron)
{
    return cron.defineField ("Hour")
        .registerItemType ("cron:range", Range =>
        {
            Range.meta ({ max: 23 });
        })
        .onGetValueForDate (d => d.getHours ())
        .onGetRealValueForDate (function (v, d)
        {
            d = new Date (d);
            d.setHours (v);

            return d.getHours ();
        })
        .onForward ((d, v) =>
        {
            d.setHours (d.getHours () + v);
            d.setMinutes (0);
            d.setSeconds (0);
            d.setMilliseconds (0);
        })
    ;
};
