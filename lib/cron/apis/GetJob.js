module.exports = function (nit, cron)
{
    return cron.defineApi ("GetJob")
        .info ("Get the scheduled job.")
        .endpoint ("GET", "/jobs/:id")
        .response ("cron:job-returned", "cron:job-not-found")
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
                ctx.respond (job.updateInfo ());
            }
        })
    ;
};
