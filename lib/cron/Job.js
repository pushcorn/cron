module.exports = function (nit, Self)
{
    return (Self = nit.defineClass ("cron.Job"))
        .use ("cron.models.Job")
        .field ("<id>", "string")
        .field ("<expr>", "string", "The cron expression.")
        .field ("<command>", "string", "The command to run.")
        .field ("[timezone]", "string", "The time zone.")
        .field ("status", "string", "The job status.")
            .constraint ("choice", "scheduled", "queued", "running")
        .field ("error", "string", "The error message.")
        .field ("output", "string", "The command output.")
        .field ("duration", "integer", "The time used for the last run.")
        .field ("exitCode", "integer", "The last command exit code.")
        .field ("nextRun", "string", "The local time of the next run.")
        .field ("nextRunUtc", "date", "The UTC time of the next run.")
        .field ("timeUntilNextRun", "integer", "The remaining time till the next run.")
        .field ("timeUntilNextRunHumanized", "string", "The human readable duration of the remaining time till the next run.")

        .defineCaster (job =>
        {
            if (job instanceof Self.Job)
            {
                return new Self (job.toPojo (),
                {
                    id: job.id.value,
                    timeUntilNextRun: job.timeUntilNextRun,
                    timeUntilNextRunHumanized: job.timeUntilNextRunHumanized
                });
            }

            return job;
        })
    ;
};
