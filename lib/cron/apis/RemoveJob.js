module.exports = function (nit, cron)
{
    return cron.defineApi ("RemoveJob")
        .describe ("Unschedule a cron job.", "cron:job-removed", "cron:job-not-found")
        .endpoint ("DELETE", "/cron/jobs/:id")
        .apiplugin ("postgresql:transactional")
        .defineRequest (Request =>
        {
            Request.path ("<id>", "string", "The job ID.");
        })
        .onDispatch (async function (ctx)
        {
            let { request: { id }, db, cronServer, Job } = ctx;
            let job = await nit.invoke.safe (() => Job.get (id));

            if (job)
            {
                await job.delete ();
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
