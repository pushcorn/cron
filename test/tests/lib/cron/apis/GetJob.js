test.api ("cron.apis.GetJob")
    .useMockDatabase ()
        .before (s => s.cronServer = nit.new ("cron.Server", { db: s.db }))
        .before (s => s.context.registerService (s.cronServer))
        .before (s => s.context.registerService (s.db))
        .before (s => s.db.jo = 55)
        .before (s => s.db.client.jo = 56)
        .before (s => s.context.server = new nit.new ("http.Server"))
        .before (s => s.cronServer.start ())
        .mock ("db", "disconnect")
        .mock ("db", "save")
        .down (s => s.mocks[0].restore ())
        .down (s => s.cronServer.stop ())
        .down (s => s.db.disconnect ())
        .snapshot ()

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

    .should ("return the schedule job")
        .up (s => s.endpoint = "GET cron/jobs/" + s.uuid1)
        .mock (Date, "now", () => nit.Date ("2023-09-02 14:55", "America/Indianapolis").getTime ())
        .spy ("db", "insert", async function (table, values) { values.mtime = this.strategy.time1; })
        .before (s => s.db.rewrite ("SELECT UUID_GENERATE_V4 ()", `SELECT '${s.uuid1}' AS uuid_generate_v4`))
        .before (s => s.object.on ("preDispatch", (api, ctx) => ctx.Job.create ("", "0 0 * * *", "nit test", "America/Indianapolis")))
        .down (s => s.mocks[1].restore ())
        .expectingPropertyToBeOfType ("context.response", "cron.responses.JobReturned")
        .expectingMethodToReturnValue ("context.response.toPojo", null,
        {
            "job":
            {
                "command": "nit test",
                "duration": 0,
                "error": "",
                "exitCode": 0,
                "expr": "0 0 * * *",
                "id": "11111111-1111-1111-1111-111111111111",
                "nextRun": "2023-09-03T00:00:00.000-04:00",
                "nextRunUtc": new Date ("2023-09-03T04:00:00.000Z"),
                "output": "",
                "status": "scheduled",
                "timeUntilNextRun": 32700000,
                "timeUntilNextRunHumanized": "9 hours and 5 minutes",
                "timezone": "America/Indianapolis"
            }
        })
        .commit ()
;
