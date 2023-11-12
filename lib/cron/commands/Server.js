module.exports = function (nit, cron, Self)
{
    return (Self = nit.defineCommand ("cron.commands.Server"))
        .use ("cron.Scheduler")
        .describe ("Run the cron server.")
        .constant ("DEFAULT_DESCRIPTOR",
        {
            plugins: ["cron:scheduler", "http:auto-restart"],
            services:
            [
            {
                name: "http:api-server",
                includePatterns: "cron.*"
            }
            ]
        })
        .defineInnerClass ("Job", Job =>
        {
            Job
                .field ("<expr>", "string", "The cron expression.")
                .field ("<command>", "string", "The command to run.")
                .field ("[timezone]", "string?", "The time zone.")
                    .constraint ("timezone")
                .field ("shell", "boolean|string", "Use shell to run the command.", true)
                .field ("env", "object?", "Additional environment variables")
            ;
        })
        .defineInput (Input =>
        {
            Input
                .option ("port", "integer?", "The listening port.")
                .option ("address", "string?", "The listening host name or IP.")
                .option ("name", "string?", "The server name.", "nit cron server")
                .option ("version", "string?", "The server version", () => require (nit.path.join (__dirname, "../../../package.json")).version)
                .option ("stopTimeout", "integer?", "The time (ms) to wait before the server ends all connections when it's stopped.")
                .option ("jobs...", Self.Job.name, "The jobs to run.")
                .option ("descriptor", "http.Server.Descriptor", "The server descriptor.")
            ;
        })
        .property ("server", "http.Server")
        .onRun (async function ({ input })
        {
            let descriptor = input.descriptor || nit.new ("http.Server.Descriptor", Self.DEFAULT_DESCRIPTOR);

            descriptor.options = nit.assign.defined (descriptor.options, nit.omit (input.toPojo (), "descriptor", "jobs"));

            let server = this.server = descriptor.build ();

            await server.start ();

            input.jobs.forEach (job => Self.Scheduler.get (server).schedule (nit.new ("cron.Job", job.toPojo ())));
        })
    ;
};
