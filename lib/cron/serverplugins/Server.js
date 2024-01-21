module.exports = function (nit)
{
    return nit.defineClass ("cron.serverplugins.Server", "http.ServerPlugin")
        .field ("channel", "string?", "The channel to listen to.")
        .field ("concurrency", "integer?", "The max number of running jobs.")
        .field ("db", "postgresql.Database?", "The database connection.")
        .property ("cronServer", "cron.Server")
        .onPreInit (function (server)
        {
            let opts = this.toPojo (true);

            opts.db = opts.db || server.lookupServiceProvider ("postgresql.Database")?.create ();

            this.cronServer = nit.new ("cron.Server", opts);

            server.serviceproviders.push (this.cronServer);
        })
        .onPreStart (function ()
        {
            return this.cronServer.start ();
        })
        .onPreStop (function ()
        {
            return this.cronServer.stop (true);
        })
    ;
};
