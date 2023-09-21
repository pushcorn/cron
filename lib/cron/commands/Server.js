module.exports = function (nit, cron, Self)
{
    return (Self = nit.defineCommand ("cron.commands.Server"))
        .describe ("Run the cron server.")
        .constant ("DEFAULT_DESCRIPTOR",
        {
            name: "cron.Server",
            services:
            [
            {
                name: "http:api-server",
                includePatterns: "cron.*"
            }
            ,
            {
                name: "http:auto-restart"
            }
            ]
        })
        .defineInput (Input =>
        {
            Input
                .option ("port", "integer?", "The listening port.")
                .option ("address", "string?", "The listening host name or IP.")
                .option ("name", "string?", "The server name.", "nit cron server")
                .option ("version", "string?", "The server version", () => require (nit.path.join (__dirname, "../../../package.json")).version)
                .option ("stopTimeout", "integer?", "The time (ms) to wait before the server ends all connections when it's stopped.")
            ;
        })
        .property ("server", "cron.Server")
        .onRun (async function ({ input })
        {
            let descriptor = nit.new ("http.Server.Descriptor", nit.assign ({ options: input.toPojo () }, Self.DEFAULT_DESCRIPTOR));
            let server = this.server = descriptor.build ();

            await server.start ();
        })
    ;
};
