module.exports = function (nit)
{
    return nit.defineClass ("cron.Scheduler")
        .plugin ("service-provider")
        .property ("jobMap", "object")
        .property ("owner", "any")
        .onCreateServiceProviderEntry (function ({ instance, scope })
        {
            instance.owner = scope;
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
            let { jobMap, owner } = this;

            if (!(job.id in jobMap))
            {
                job.logger = owner;
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
