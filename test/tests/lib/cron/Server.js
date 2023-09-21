test.method ("cron.Server", "start")
    .should ("schedule the jobs given to the constructor")
    .up (s => s.createArgs =
    {
        jobs:
        [
        {
            expr: "0 0 * * *",
            command: "nit test"
        }
        ]
    })
    .mock ("object", "writeLog")
    .mock ("object", "schedule")
    .expectingPropertyToBe ("mocks.1.invocations.length", 1)
    .expectingPropertyToBe ("mocks.1.invocations.0.args.0.expr", "0 0 * * *")
    .commit ()
;


test.method ("cron.Server", "stop")
    .should ("stop the scheduled runners")
    .mock ("object", "writeLog")
    .before (s => s.object.ready.resolve ())
    .before (s => s.object.runnerMap[1] =
    {
        stop: () => s.runnerStopCalled = true
    })
    .expectingPropertyToBe ("runnerStopCalled", true)
    .commit ()
;


test.method ("cron.Server", "schedule")
    .should ("create and start the job runner")
    .up (s => s.Runner = nit.require ("cron.Runner"))
    .up (s => s.jobOne = nit.new ("cron.Job",
    {
        expr: "0 0 * * *",
        command: "nit test"
    }))
    .mock ("Runner.prototype", "start", function ()
    {
        return this.obj;
    })
    .before (s => s.args = s.jobOne)
    .after (s => s.object.schedule (s.jobOne))
    .expectingPropertyToBeOfType ("object.runnerMap.2", "cron.Runner")
    .expectingExprToReturnValue ("nit.keys (object.runnerMap).length", 1)
    .commit ()
;
