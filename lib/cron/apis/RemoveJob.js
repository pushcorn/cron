module.exports = function (nit, cron)
{
    return cron.defineApi ("RemoveJob")
        .m ("info.job_removed", "The job \"%{command}\" (id = %{id}) has been removed.")
        .use ("cron.Job")
        .info ("Remove a cron job.")
        .endpoint ("DELETE", "/jobs/:id")
        .response ("cron:job-removed", "cron:job-not-found")
        .defineRequest (Request =>
        {
            Request
                .path ("<id>", "integer", "The job ID to be removed.")
                    .constraint ("min", 1)
            ;
        })
        .onRun (function (ctx)
        {
            let job = ctx.scheduler.getJob (ctx.request.id);

            if (!job)
            {
                ctx.send ("cron:job-not-found");
            }
            else
            {
                ctx.scheduler.unschedule (job.id);

                ctx.respond (job);

                this.info ("info.job_removed", job);
            }
        })
    ;
};
