module.exports = function (nit, cron, Self)
{
    return (Self = cron.defineApi ("AddJob"))
        .use ("cron.Job")
        .info ("Add a cron job.")
        .endpoint ("POST", "/jobs")
        .response ("cron:job-created")
        .defineRequest (Request =>
        {
            Request
                .form ("<expr>", "string", "The cron expression.")
                .form ("<command>", "string", "The command to run.")
                .form ("[timezone]", "nit.Date.Timezone", "The timezone in which the job should be run.")
            ;
        })
        .onRun (function (ctx)
        {
            let job = new Self.Job (ctx.request.toPojo ());

            ctx.root.server.schedule (job);
            ctx.respond (job);
        })
    ;
};
