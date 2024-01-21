module.exports = function (nit, cron)
{
    return cron.defineApi ("GetStats")
        .describe ("Get the scheduler stats.", "cron:stats-returned")
        .endpoint ("GET", "/cron/stats")
        .onDispatch (ctx => ctx.cronServer.getStats ())
    ;
};
