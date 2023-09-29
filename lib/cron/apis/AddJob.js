module.exports = function (nit, cron, Self)
{
    return (Self = cron.defineApi ("AddJob"))
        .m ("info.job_created", "The job \"%{command}\" (id = %{id}) has been scheduled with \"%{expr}\" at timezone %{timezone.name}.")
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
        .onRun (async function (ctx)
        {
            let job = new Self.Job (ctx.request.toPojo ());

            ctx.scheduler.schedule (job);
            ctx.respond (job);

            this.info ("info.job_created", job);
        })
    ;
};
