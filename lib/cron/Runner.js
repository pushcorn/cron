module.exports = function (nit, Self)
{
    const writer = new nit.Object.Property.Writer;


    return (Self = nit.defineClass ("cron.Runner"))
        .use ("nit.utils.Humanize")
        .use ("*child_process.spawn")
        .constant ("MAX_TIMEOUT", 2147483647)
        .field ("<job>", "cron.Job", "The job to run.")
        .property ("timer", "integer", { writer })
        .property ("runOnTimeout", "boolean", { writer })
        .property ("completion", "nit.Deferred", { writer })

        .method ("start", function ()
        {
            let self = this;
            let job = self.job;
            let now = Date.now ();
            let nextDate = job.entry.next (now);
            let timeout = nextDate - now;

            job.nextRun = nextDate.toTimestamp ();
            job.nextRunUtc = nextDate.toISOString ();
            job.timeUntilNextRun = timeout;
            job.timeUntilNextRunHumanized = Self.Humanize.duration (timeout);

            self.runOnTimeout = writer.value (timeout <= Self.MAX_TIMEOUT);
            self.timer = writer.value (setTimeout (self.run.bind (self), timeout = Math.min (timeout, Self.MAX_TIMEOUT)));

            return self;
        })
        .method ("stop", async function ()
        {
            let self = this;

            clearTimeout (self.timer);

            await self.completion;

            return self;
        })
        .method ("run", async function ()
        {
            let self = this;

            if (self.runOnTimeout)
            {
                self.spawn ();
            }

            return self.start ();
        })
        .method ("spawn", async function ()
        {
            let self = this;
            let deferred = new nit.Deferred (Self.MAX_TIMEOUT);
            let job = self.job;
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
            job.lastExitCode = await deferred;
        })
    ;
};
