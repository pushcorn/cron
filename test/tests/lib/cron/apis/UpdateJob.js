test.api ("cron.apis.UpdateJob")
    .setupTestForApi ()
    .should ("return JobNotFound if the ID is invalid UUID")
        .up (s => s.endpoint = "GET cron/jobs/1234")
        .before (s => s.mock (nit.log, "e"))
        .expectingPropertyToBeOfType ("context.response", "cron.responses.JobNotFound")
        .expectingPropertyToBe ("mocks.0.invocations.length", 1)
        .commit ()

    .should ("return JobNotFound if the ID is not found")
        .up (s => s.endpoint = "GET cron/jobs/" + s.uuid1)
        .expectingPropertyToBeOfType ("context.response", "cron.responses.JobNotFound")
        .commit ()

    .should ("update a scheduled job")
        .up (s => s.endpoint = "PUT cron/jobs/" + s.uuid1)
        .mock (Date, "now", function () { return this.strategy.time1 * 1; })
        .spy ("db", "insert", async function (table, values) { values.mtime = this.strategy.time1; })
        .spy ("db", "update", async function (table, values) { values.mtime = this.strategy.time1; })
        .before (s =>
        {
            s.db.rewrite ("SELECT UUID_GENERATE_V4 ()", `SELECT '${s.uuid1}' AS uuid_generate_v4`);
            s.db.rewrite ("COMMIT", "-- COMMIT");
        })
        .before (s => s.object.on ("preDispatch", (api, ctx) => ctx.Job.create ("", "0 0 * * *", "nit test", "America/Indianapolis")))
        .given ({ data: { command: "shell nit test", expr: "0 1 * * *" } })
        .expectingPropertyToBeOfType ("context.response", "cron.responses.JobUpdated")
        .expectingMethodToReturnValue ("context.response.toPojo", null,
        {
            "job":
            {
                "command": "shell nit test",
                "duration": 0,
                "error": "",
                "exitCode": 0,
                "expr": "0 1 * * *",
                "id": "11111111-1111-1111-1111-111111111111",
                "nextRun": "2024-01-18T01:00:00.000-05:00",
                "nextRunUtc": new Date ("2023-09-03T04:00:00.000Z"),
                "output": "",
                "status": "scheduled",
                "timeUntilNextRun": 34200000,
                "timeUntilNextRunHumanized": "9 hours and 30 minutes",
                "timezone": "America/Indianapolis"
            }
        })
        .commit ()
;
