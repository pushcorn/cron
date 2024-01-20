module.exports = function (nit)
{
    return nit.defineClass ("cron.serverplugins.Server", "http.ServerPlugin")
        .field ("channel", "string?", "The channel to listen to.")
        .field ("concurrency", "integer?", "The max number of running jobs.")
        .field ("db", "postgresql.Database?", "The database connection.")
        .property ("server", "cron.Server")
        .onPreInit (function (server)
        {
            let opts = this.toPojo (true);

            opts.db = opts.db || server.lookupServiceProvider ("postgresql.Database")?.create ();

            this.server = nit.new ("cron.Server", opts);

            server.serviceproviders.push (this.server);
        })
        .onPreStart (function ()
        {
            return this.server.start ();
        })
        .onPreStop (function ()
        {
            return this.server.stop (true);
        })
    ;
};