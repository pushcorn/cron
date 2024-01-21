test.api ("cron.apis.ListJobs")
    .setupTestForApi ()
    .should ("list scheduled jobs")
        .mock (Date, "now", function () { return this.strategy.time1 * 1; })
        .spy ("db", "insert", async function (table, values) { values.mtime = this.strategy.time1; })
        .before (s => s.db.rewrite ("SELECT UUID_GENERATE_V4 ()", `SELECT '${s.uuid1}' AS uuid_generate_v4`))
        .before (s => s.object.on ("preDispatch", (api, ctx) => ctx.Job.create ("", "0 0 * * *", "nit test", "America/Indianapolis")))
        .expectingPropertyToBeOfType ("context.response", "cron.responses.JobsReturned")
        .expectingPropertyToBe ("context.response.jobs.length", 1)
        .expectingMethodToReturnValue ("context.response.jobs.0.toPojo", null,
        {
            "command": "nit test",
            "duration": 0,
            "error": "",
            "exitCode": 0,
            "expr": "0 0 * * *",
            "id": "11111111-1111-1111-1111-111111111111",
            "nextRun": "2024-01-18T00:00:00.000-05:00",
            "nextRunUtc": new Date ("2023-09-03T04:00:00.000Z"),
            "output": "",
            "status": "scheduled",
            "timeUntilNextRun": 30600000,
            "timeUntilNextRunHumanized": "8 hours and 30 minutes",
            "timezone": "America/Indianapolis"
        })
        .commit ()
;
