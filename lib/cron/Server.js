module.exports = function (nit)
{
    return nit.defineClass ("cron.Server", "http.Server")
        .property ("jobMap", "object")
        .getter ("jobs", function ()
        {
            return nit.values (this.jobMap);
        })
        .onStop (async function ()
        {
            await Promise.all (this.jobs.map (job => job.stop ()));
        })
        .method ("schedule", function (job)
        {
            let { jobMap } = this;

            if (!(job.id in jobMap))
            {
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
