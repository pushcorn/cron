module.exports = function (nit, cron)
{
    return cron.defineApi ("ListJobs")
        .info ("List scheduled jobs.")
        .endpoint ("GET", "/jobs")
        .response ("cron:job-list-returned")
        .onRun (function (ctx)
        {
            ctx.respond ({ jobs: ctx.scheduler.jobs.map (j => j.updateInfo ()) });
        })
    ;
};
