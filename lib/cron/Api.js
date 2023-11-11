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
                    let server = this.root.server;

                    return Self.Scheduler.get (server, null, function (scheduler)
                    {
                        server.once ("stop", () => scheduler.stop ());
                    });
                })
            ;
        })
    ;
};
