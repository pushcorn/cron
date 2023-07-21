module.exports = function (nit, cron)
{
    return cron.defineField ("Hour")
        .assignStatic ({ max: 23 })
    ;
};
