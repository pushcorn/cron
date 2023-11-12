module.exports = function (nit, Self)
{
    return (Self = nit.defineClass ("cron.Api", "http.Api"))
        .use ("cron.Scheduler")
        .categorize ("cron.apis")
        .do ("Context", Context =>
        {
            Context
                .getter ("scheduler", function ()
                {
                    return Self.Scheduler.get (this.server);
                })
            ;
        })
    ;
};
