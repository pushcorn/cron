module.exports = function (nit, cron)
{
    return cron.defineApi ("ListJobs")
        .describe ("List scheduled jobs.", "cron:jobs-returned")
        .endpoint ("GET", "/cron/jobs")
        .onDispatch (async function ({ Job })
        {
            return Job.select (Job.Select ().OrderBy ("nextRunUtc"));
        })
    ;
};
