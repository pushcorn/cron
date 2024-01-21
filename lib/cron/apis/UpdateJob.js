module.exports = function (nit, cron)
{
    return cron.defineApi ("UpdateJob")
        .describe ("Update a cron job.", "cron:job-updated", "cron:job-not-found")
        .endpoint ("PUT", "/cron/jobs/:id")
        .apiplugin ("postgresql:transactional")
        .defineRequest (Request =>
        {
            Request
                .path ("<id>", "string", "The job ID.")
                .form ("expr", "string?", "The cron expression.")
                    .constraint ("cron:expression")
                .form ("command", "string?", "The command to run.")
                .form ("timezone", "string?", "The time zone.")
                    .constraint ("timezone")
            ;
        })
        .onDispatch (async function (ctx)
        {
            let { request, db, cronServer, Job } = ctx;
            let job = await nit.invoke.safe (() => Job.get (request.id));

            if (job)
            {
                await job.update (nit.omit (request, "id"));
                await db.notify (cronServer.channel);

                return job;
            }
            else
            {
                this.throw ("error.job_not_found");
            }
        })
    ;
};
