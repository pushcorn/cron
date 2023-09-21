module.exports = function (nit, cron)
{
    return cron.defineApi ("RemoveJob")
        .use ("cron.Job")
        .info ("Add a cron job.")
        .endpoint ("DELETE", "/jobs/:id")
        .response ("cron:job-removed", "cron:job-not-found")
        .defineRequest (Request =>
        {
            Request
                .path ("<id>", "integer", "The job ID.")
                    .constraint ("min", 1)
            ;
        })
        .onRun (function (ctx)
        {
            let job = ctx.root.server.getJob (ctx.request.id);

            if (!job)
            {
                ctx.send ("cron:job-not-found");
            }
            else
            {
                ctx.root.server.unschedule (job.id);

                ctx.respond (job);
            }
        })
    ;
};
