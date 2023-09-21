module.exports = function (nit, Self)
{
    return (Self = nit.defineClass ("cron.Job"))
        .use ("cron.Entry")
        .staticProperty ("nextId", "integer", 1)
        .field ("<id>", "integer", "The job ID.",
        {
            setter: function (v)
            {
                Self.nextId = (v = Math.max (Self.nextId, v)) + 1;

                return v;
            }
        })
        .field ("<expr>", "string", "The cron expression.")
        .field ("<command>", "string", "The command to run.")
        .field ("[timezone]", "string+", "The timezone in which the job should be run.")
        .field ("shell", "any", "Use shell to run the command.", true)
            .constraint ("type", "boolean", "string")
        .field ("env", "object?", "Additional environment variables")
        .field ("nextRun", "string", "The local time of the next run.")
        .field ("nextRunUtc", "string", "The UTC time of the next run.")
        .field ("timeUntilNextRun", "integer", "The remaining time till the next run.")
        .field ("timeUntilNextRunHumanized", "string", "The human readable duration of the remaining time till the next run.")
        .field ("lastExitCode", "integer", "The exit code of the last run.")
        .memo ("entry", function ()
        {
            return new Self.Entry (this.toPojo ());
        })
    ;
};
