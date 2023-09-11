module.exports = function (nit, Self)
{
    return (Self = nit.defineClass ("cron"))
        .constant ("DAY_NAMES", "SUN|MON|TUE|WED|THU|FRI|SAT")
        .constant ("DAY_NAME_ARRAY", Self.DAY_NAMES.split ("|"))
        .constant ("DAYS_IN_MONTH", [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31])
        .constant ("MONTH_NAMES", "JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC")
        .constant ("MONTH_NAME_ARRAY", Self.MONTH_NAMES.split ("|"))
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
