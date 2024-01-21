test.api ("cron.apis.GetStats")
    .setupTestForApi ()
    .should ("return the stats of the server")
        .expectingPropertyToBeOfType ("context.response", "cron.responses.StatsReturned")
        .expectingMethodToReturnValue ("context.response.toPojo", null,
        {
            "stats":
            {
                "pool": undefined,
                "queued": 0,
                "running": 0,
                "scheduled": 0,
                "taskQueue":
                {
                    "pending": 0,
                    "queued": 0
                }
            }
        })
        .commit ()
;
