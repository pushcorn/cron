module.exports = function (nit, cron)
{
    return cron.defineField ("Second")
        .registerItemType ("cron:range")
        .onGetValueForDate (d => d.getSeconds ())
        .onForward ((d, v) =>
        {
            d.setSeconds (d.getSeconds () + v);
            d.setMilliseconds (0);
        })
    ;
};
