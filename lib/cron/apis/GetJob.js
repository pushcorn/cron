module.exports = function (nit, cron)
{
    return cron.defineApi ("GetJob")
        .describe ("Get the details of a scheduled job.", "cron:job-returned", "cron:job-not-found")
        .endpoint ("GET", "/cron/jobs/:id")
        .defineRequest (Request =>
        {
            Request.path ("<id>", "string", "The job ID.");
        })
        .onDispatch (async function (ctx)
        {
            let { request: { id }, Job } = ctx;

            return (await nit.invoke.safe (() => Job.get (id)))
                || this.throw ("error.job_not_found")
            ;
        })
    ;
};
