test.api ("cron.apis.AddJob")
    .should ("add and schedule the job")
        .given (
        {
            data:
            {
                expr: "0 0 * * *",
                command: "nit test"
            }
        })
        .mock ("Scheduler.prototype", "schedule")
        .expectingPropertyToBeOfType ("mocks.0.invocations.0.args.0", "cron.Job")
        .expectingPropertyToBeOfType ("context.response", "cron.responses.JobCreated")
        .commit ()

    .should ("send the ValidationFailed response if the timezone is invalid")
        .given (
        {
            data:
            {
                expr: "0 0 * * *",
                command: "nit test",
                timezone: "abcd"
            }
        })
        .expectingPropertyToBeOfType ("context.response", "http.responses.ValidationFailed")
        .expectingPropertyToBe ("context.response.violations.0.code", "error.invalid_timezone")
        .commit ()
;
