test.api ("cron.apis.ListJobs")
    .should ("list scheduled jobs")
    .before (s => s.context.server = new nit.new ("cron.Server"))
    .before (s => s.context.server.jobMap[9] = nit.new ("cron.Job", 9, "0 0 * * *", "nit test"))
    .before (s => s.context.server.jobMap[10] = nit.new ("cron.Job", 1, "0 0 * * *", "nit test"))
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
        "nextRun": "",
        "nextRunUtc": "",
        "shell": true,
        "timeUntilNextRun": 0,
        "timeUntilNextRunHumanized": "",
        "timezone": nit.timezone ()
    })
    .commit ()
;
