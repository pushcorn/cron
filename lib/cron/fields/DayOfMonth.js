module.exports = function (nit, cron)
{
    return cron.defineField ("DayOfMonth")
        .constant ("DAYS_IN_MONTH", [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31])
        .assignStatic ({ min: 1, max: 31 })
    ;
};
