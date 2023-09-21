module.exports = function (nit, Self)
{
    return (Self = nit.defineClass ("cron.Server", "http.Server"))
        .use ("cron.Runner")
        .field ("[jobs...]", "cron.Job")
        .property ("runnerMap", "object")
        .onConstruct (function ()
        {
            this.stack = nit.stack;
        })
        .onStart (function ()
        {
            this.jobs.splice (0).map (job => this.schedule (job));
        })
        .onStop (async function ()
        {
            await Promise.all (nit.values (this.runnerMap)
                .map (r => r.stop ())
            );
        })
        .method ("schedule", function (job)
        {
            let self = this;
            let runner = self.runnerMap[job.id];

            if (!runner)
            {
                self.jobs.push (job);

                runner = new Self.Runner (job);
                self.runnerMap[job.id] = runner.start ();
            }
        })
        .method ("unschedule", function (id)
        {
            let self = this;
            let job = self.getJob (id);

            if (job)
            {
                nit.arrayRemove (self.jobs, job);

                self.runnerMap[job.id].stop ();

                delete self.runnerMap[job.id];

                return job;
            }
        })
        .method ("getJob", function (id)
        {
            return this.runnerMap[id]?.job;
        })
    ;
};
