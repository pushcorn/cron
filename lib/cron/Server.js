module.exports = function (nit, Self)
{
    return (Self = nit.defineClass ("cron.Server", "http.Server"))
        .use ("cron.Runner")
        .field ("[jobs...]", "cron.Job")
        .property ("runnerMap", "object")
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
    ;
};
