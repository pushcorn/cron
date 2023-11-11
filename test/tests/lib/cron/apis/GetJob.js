test.api ("cron.apis.GetJob")
    .should ("return error if the job ID is less than 1.")
        .expectingPropertyToBeOfType ("context.response", "http.responses.ValidationFailed")
        .commit ()

    .should ("return error if the job was not found")
        .given ({}, { pathParams: { id: 1 } })
        .before (s => s.context.server = new nit.new ("http.Server"))
        .expectingPropertyToBeOfType ("context.response", "cron.responses.JobNotFound")
        .commit ()

    .should ("return the schedule job")
        .given ({}, { pathParams: { id: 1 } })
        .up (s => s.global = global)
        .mock ("global.Date", "now", function ()
        {
            let { iteration, strategy: s } = this;

            if (iteration == 1)
            {
                s.now = nit.Date ("2023-09-02 14:55", "America/Indianapolis").getTime ();
            }

            return s.now;
        })
        .mock ("context.server", "writeLog")
        .before (s => s.context.server = new nit.new ("http.Server"))
        .before (s => s.Scheduler.get (s.context.server).schedule (nit.new ("cron.Job",
        {
            expr: "0 0 * * *",
            command: "nit test",
            timezone: "America/Indianapolis"
        })))
        .after (s => s.context.server.ready.resolve ())
        .after (s => s.context.server.stop ())
        .after (s => nit.log (s.Scheduler.serviceProviderEntries))
        .after (s => s.Scheduler.get (s.context.server).jobs[0].stop ())
        .expectingPropertyToBeOfType ("context.response", "cron.responses.JobReturned")
        .expectingMethodToReturnValue ("context.response.toPojo", null,
        {
            "job":
            {
                "command": "nit test",
                "expr": "0 0 * * *",
                "id": 1,
                "lastExitCode": -1,
                "nextRun": "2023-09-03T00:00:00.000-04:00",
                "nextRunUtc": "2023-09-03T04:00:00.000Z",
                "shell": true,
                "timeUntilNextRun": 32700000,
                "timeUntilNextRunHumanized": "9 hours and 5 minutes",
                "timezone": "America/Indianapolis"
            }
        })
        .commit ()
;
