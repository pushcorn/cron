module.exports = function (nit)
{
    return nit.defineClass ("cron.Scheduler")
        .plugin ("service-provider")
        .property ("jobMap", "object")
        .property ("server", "http.Server?")
        .onCreateServiceProviderEntry (function ({ instance: scheduler, scope: server })
        {
            scheduler.server = server;
            server.on ("stop", () => scheduler.stop ());
        })
        .getter ("jobs", function ()
        {
            return nit.values (this.jobMap);
        })
        .method ("stop", async function ()
        {
            await Promise.all (this.jobs.map (job => job.stop ()));
        })
        .method ("schedule", function (job)
        {
            let { jobMap, server } = this;

            if (!(job.id in jobMap))
            {
                job.logger = server;
                jobMap[job.id] = job.start ();
            }
        })
        .method ("unschedule", function (id)
        {
            let { jobMap } = this;
            let job = jobMap[id];

            if (job)
            {
                job.stop ();

                delete jobMap[id];

                return job;
            }
        })
        .method ("getJob", function (id)
        {
            return this.jobMap[id];
        })
    ;
};
