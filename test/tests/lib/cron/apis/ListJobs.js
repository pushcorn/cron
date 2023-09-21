test.api ("cron.apis.ListJobs")
    .should ("list scheduled jobs")
    .before (s => s.context.server = new nit.new ("cron.Server"))
    .before (s => s.context.server.jobs.push (nit.new ("cron.Job", 1, "0 0 * * *", "nit test")))
    .expectingPropertyToBeOfType ("context.response", "cron.responses.JobListReturned")
    .expectingPropertyToBe ("context.response.jobs.length", 1)
    .commit ()
;
