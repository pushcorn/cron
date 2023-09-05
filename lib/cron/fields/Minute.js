module.exports = function (nit, cron)
{
    return cron.defineField ("Minute")
        .registerItemType ("cron:range")
        .onGetValueForDate (d => d.getMinutes ())
        .onForward ((d, v) =>
        {
            d.setMinutes (d.getMinutes () + v);
            d.setSeconds (0);
            d.setMilliseconds (0);
        })
    ;
};
