module.exports = function (nit)
{
    return nit.defineClass ("cron.Response", "http.Response")
        .categorize ("cron.responses")
    ;
};
