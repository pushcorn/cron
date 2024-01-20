module.exports = function (nit, Self)
{
    return (Self = nit.defineClass ("cron.Server"))
        .k ("initJobTable")
        .m ("info.next_job_scheduled", "The next job '%{command}' is scheduled at %{time}. (Time left: %{timeLeft})")
        .use ("nit.utils.Humanize")
        .use ("postgresql.queries.Select")
        .plugin ("postgresql:queue-server", "cron.models.Job")
        .configureComponentMethod ("start", Method =>
        {
            Method
                .after (Self.kCreateJobTable, Self.kInitJobTable, async function ({ Job })
                {
                    for (let job of await Job.select ())
                    {
                        await job.update ({ status: "scheduled" });
                    }
                })
            ;
        })
        .do ("DequeueTask", DequeueTask =>
        {
            DequeueTask
                .onBuildQuery (query => query
                    .WhereExpr ("\"nextRunUtc\" < TIMEZONE ('UTC', NOW ())")
                    .OrderBy ("nextRunUtc")
                )
                .onUpdateJob (async (job) =>
                {
                    job.nextRunUtc = Date.now ();
                    job.next ();

                    await job.update ({ status: "running" });
                })
            ;
        })
        .do ("RunJobTask", RunJobTask =>
        {
            RunJobTask
                .onSaveResult (async function ({ cmdCtx, job, server, duration })
                {
                    await job.update (
                    {
                        duration,
                        output: nit.serialize (cmdCtx.output),
                        error: cmdCtx.error?.stack,
                        exitCode: cmdCtx.exitCode,
                        status: "scheduled"
                    });

                    server.updateEnqueueTimer ();
                })
            ;
        })
        .do ("UpdateEnqueueTimerTask", UpdateEnqueueTimerTask =>
        {
            UpdateEnqueueTimerTask
                .onGetDelay (async function ({ Job, server })
                {
                    let job = await Job.find (Self.Select ()
                        .Where ("status", "scheduled")
                        .OrderBy ("nextRunUtc")
                    );

                    if (job)
                    {
                        let delay = Math.max (100, job.nextRunUtc - Date.now ());

                        server.info ("info.next_job_scheduled", { command: job.command, time: nit.Date (job.nextRunUtc, job.timezone).toString (), timeLeft: Self.Humanize.duration (delay, 3) });

                        return delay;
                    }
                })
            ;
        })
        .do ("EnqueueScheduledJobsTask", EnqueueScheduledJobsTask =>
        {
            EnqueueScheduledJobsTask
                .onBuildQuery (query => query
                    .Where ("status", "scheduled")
                    .WhereExpr ("\"nextRunUtc\" < TIMEZONE ('UTC', NOW ())")
                )
            ;
        })
    ;
};
