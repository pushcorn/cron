module.exports = function (nit, cron)
{
    return cron.defineApi ("ScheduleJob")
        .describe ("Schedule a cron job.", "cron:job-scheduled")
        .endpoint ("POST", "/cron/jobs")
        .apiplugin ("postgresql:transactional")
        .defineRequest (Request =>
        {
            Request
                .form ("<expr>", "string", "The cron expression.")
                    .constraint ("cron:expression")
                .form ("<command>", "string", "The command to run.")
                .form ("[timezone]", "string", "The time zone.", () => nit.timezone ())
                    .constraint ("timezone")
            ;
        })
        .onDispatch (async function (ctx)
        {
            let { request: { expr, command, timezone }, cronServer, db, Job } = ctx;
            let job = await Job.create ("", expr, command, timezone);

            await db.notify (cronServer.channel);

            return job;
        })
    ;
};
