test.api ("cron.apis.ListJobs")
    .should ("list scheduled jobs")
    .up (s => s.Date = Date)
    .mock ("Date", "now", nit.Date ("2023-09-18 15:35", "America/Indianapolis").getTime ())
    .before (s => s.context.server = new nit.new ("cron.Server"))
    .before (s => s.context.server.jobMap[9] = nit.new ("cron.Job", 9, "0 0 * * *", "nit test", "America/Indianapolis"))
    .before (s => s.context.server.jobMap[10] = nit.new ("cron.Job", 1, "0 0 * * *", "nit test", "America/Indianapolis"))
    .before (s => s.context.server.jobMap[9].next (nit.Date ("2023-09-18 15:00", "America/Indianapolis")))
    .before (s => s.context.server.jobMap[10].next (nit.Date ("2023-09-18 15:00", "America/Indianapolis")))
    .expectingPropertyToBeOfType ("context.response", "cron.responses.JobListReturned")
    .expectingPropertyToBe ("context.response.jobs.length", 2)
    .expectingPropertyToBe ("context.response.jobs.0.id", 9)
    .expectingPropertyToBe ("context.response.jobs.1.id", 10)
    .expectingMethodToReturnValue ("context.response.jobs.0.toPojo", null,
    {
        "command": "nit test",
        "expr": "0 0 * * *",
        "id": 9,
        "lastExitCode": -1,
        "nextRun": "2023-09-19T00:00:00.000-04:00",
        "nextRunUtc": "2023-09-19T04:00:00.000Z",
        "shell": true,
        "timeUntilNextRun": 30300000,
        "timeUntilNextRunHumanized": "8 hours and 25 minutes",
        "timezone":
        {
            "name": "America/Indianapolis"
        }
    })
    .commit ()
;
