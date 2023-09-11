module.exports = function (nit, cron)
{
    return cron.defineField ("Second")
        .registerItemType ("cron:range")
        .onGetValueForDate (d => d.getUTCSeconds ())
        .onForward ((d, v) =>
        {
            d.setUTCSeconds (d.getUTCSeconds () + v);
            d.setUTCMilliseconds (0);
        })
    ;
};
