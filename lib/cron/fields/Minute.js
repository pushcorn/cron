module.exports = function (nit, cron)
{
    return cron.defineField ("Minute")
        .registerItemType ("cron:range")
        .registerItemType ("cron:hash")
        .onGetValueForDate (d => d.getUTCMinutes ())
        .onForward ((d, v) =>
        {
            d.setUTCMinutes (d.getUTCMinutes () + v);
            d.setUTCSeconds (0);
            d.setUTCMilliseconds (0);
        })
    ;
};
