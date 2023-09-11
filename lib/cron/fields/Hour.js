module.exports = function (nit, cron)
{
    return cron.defineField ("Hour")
        .registerItemType ("cron:range", Range =>
        {
            Range.meta ({ max: 23 });
        })
        .onGetValueForDate (d => d.getUTCHours ())
        .onForward ((d, v) =>
        {
            d.setUTCHours (d.getUTCHours () + v);
            d.setUTCMinutes (0);
            d.setUTCSeconds (0);
            d.setUTCMilliseconds (0);
        })
    ;
};
