module.exports = function (nit)
{
    return  nit.defineClass ("cron")
        .staticMethod ("getDateAsUtc", function (date)
        {
            let d = date || new Date;

            return new Date (Date.UTC (d.getFullYear (), d.getMonth (), d.getDate (), d.getHours (), d.getMinutes (), d.getSeconds (), d.getMilliseconds ()));
        })
        .staticMethod ("getLastDateOfMonth", function (date)
        {
            let d = new Date (date);

            d.setUTCDate (1);
            d.setUTCMonth (d.getUTCMonth () + 1);
            d.setUTCDate (0);
            d.setUTCHours (0);
            d.setUTCMinutes (0);
            d.setUTCSeconds (0);
            d.setUTCMilliseconds (0);

            return d;
        })
        .require ("nit.Date")
        .require ("cron.Field")
    ;
};
