module.exports = function (nit, Self)
{
    return (Self = nit.defineClass ("cron.serverplugins.Scheduler", "http.ServerPlugin"))
        .use ("cron.Scheduler")
        .onPreInit (function (server)
        {
            let scheduler = Self.Scheduler.get (server);

            server.once ("stop", () => scheduler.stop ());
        })
    ;
};
