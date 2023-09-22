module.exports = function (nit, Self)
{
    const writer = new nit.Object.Property.Writer;


    return (Self = nit.defineClass ("cron.Runner"))
        .use ("nit.utils.Humanize")
        .use ("*child_process.spawn")
        .field ("<job>", "cron.Job", "The job to run.")
        .property ("timer", "nit.utils.Timer", { writer })
        .property ("completion", "nit.Deferred", { writer })

        .method ("start", function ()
        {
            let self = this;

            self.job.next ();

            self.timer = writer.value (new nit.utils.Timer (self.job.timeUntilNextRun, self.run.bind (self)));
            self.timer.start ();

            return self;
        })
        .method ("stop", async function ()
        {
            let self = this;

            self.timer.stop ();

            await self.completion;

            return self;
        })
        .method ("run", async function ()
        {
            let self = this;
            let job = self.job;
            let deferred = new nit.Deferred (nit.utils.Timer.MAX_TIMEOUT);

            deferred.then (code => job.lastExitCode = code);

            try
            {
                let child = Self.spawn (job.command,
                {
                    shell: job.shell,
                    stdio: "inherit",
                    detached: true,
                    env: nit.assign ({}, process.env, job.env)
                });

                child.on ("close", code =>
                {
                    deferred.resolve (code);
                });

                self.completion = writer.value (deferred);
            }
            catch (e)
            {
                deferred.resolve (-1);

                throw e;
            }
            finally
            {
                self.start ();
            }
        })
    ;
};
