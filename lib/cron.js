module.exports = function (nit)
{
    return  nit.defineClass ("cron")
        .staticMethod ("getLastDateOfMonth", function (date)
        {
            let d = new Date (date);

            d.setDate (1);
            d.setMonth (d.getMonth () + 1);
            d.setDate (0);
            d.setHours (0);
            d.setMinutes (0);
            d.setSeconds (0);
            d.setMilliseconds (0);

            return d;
        })
        .require ("cron.Field")
    ;
};
