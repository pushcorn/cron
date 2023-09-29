test.method ("cron.Scheduler", "createServiceProviderEntry", true)
    .should ("configure the scheduler")
        .given (nit.new ("http.Server"))
        .returnsInstanceOf ("cron.Scheduler.ServiceProviderEntry")
        .expectingPropertyToBeOfType ("result.instance.server", "http.Server")
        .commit ()
;


test.method ("cron.Scheduler", "stop")
    .should ("stop the scheduled jobs")
    .before (s => s.object.jobMap[1] =
    {
        stop: () => s.jobStopCalled = true
    })
    .expectingPropertyToBe ("jobStopCalled", true)
    .commit ()
;


test.method ("cron.Scheduler", "schedule")
    .should ("start the job")
    .up (s => s.Job = nit.require ("cron.Job"))
    .up (s => s.jobOne = nit.new ("cron.Job",
    {
        expr: "0 0 * * *",
        command: "nit test"
    }))
    .mock ("Job.prototype", "start", function ()
    {
        return this.obj;
    })
    .before (s => s.args = s.jobOne)
    .after (s => s.object.schedule (s.jobOne))
    .expectingPropertyToBeOfType ("object.jobMap.1", "cron.Job")
    .expectingExprToReturnValue ("object.jobs.length", 1)
    .commit ()
;


test.method ("cron.Scheduler", "unschedule")
    .should ("ignore the invalid job ID")
        .given (3)
        .returns ()
        .commit ()

    .should ("remove a schedule job")
        .up (s => s.jobOne = nit.new ("cron.Job",
        {
            expr: "0 0 * * *",
            command: "nit test"
        }))
        .given (2)
        .before (s => s.object.schedule (s.jobOne))
        .expectingExprToReturnValue ("object.jobs.length", 0)
        .commit ()
;


test.method ("cron.Scheduler", "getJob")
    .should ("ignore the invalid job ID")
        .given (3)
        .returns ()
        .commit ()

    .should ("return a schedule job")
        .up (s => s.jobOne = nit.new ("cron.Job",
        {
            expr: "0 0 * * *",
            command: "nit test"
        }))
        .given (3)
        .before (s => s.object.schedule (s.jobOne))
        .after (s => s.object.unschedule (s.jobOne.id))
        .returnsInstanceOf ("cron.Job")
        .expectingPropertyToBe ("result.id", 3)
        .commit ()
;
