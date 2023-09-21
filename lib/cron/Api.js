module.exports = function (nit)
{
    return nit.defineClass ("cron.Api", "http.Api")
        .categorize ("cron.apis")
    ;
};
