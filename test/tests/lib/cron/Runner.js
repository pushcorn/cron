const Runner = nit.require ("cron.Runner");


test.method ("cron.Runner", "start")
    .should ("start the runner")
        .up (s => s.createArgs = nit.new ("cron.Job",
        {
            expr: "0 0 * * *",
            command: "nit test"
        }))
        .before (() =>
        {
            test.mock (Date, "now", nit.Date ("2023-09-18 14:55", "America/Indianapolis").getTime ());
        })
        .returnsInstanceOf ("cron.Runner")
        .expectingPropertyToBe ("result.job.timeUntilNextRunHumanized", "9 hours and 5 minutes")
        .expectingExprToReturnValue ("result.timer > 0", true)
        .expectingMethodToReturnValueOfType ("result.stop", null, "cron.Runner")
        .commit ()
;


test.method ("cron.Runner", "run")
    .should ("run the scheduled job")
        .up (s => s.createArgs = nit.new ("cron.Job",
        {
            expr: "0 0 1 * *",
            command: "nit test:not-found"
        }))
        .before (async (s) =>
        {
            test.mock (Date, "now", nit.Date ("2023-09-02 14:55", "America/Indianapolis").getTime ());

            let timeoutMock = test.mock (global, "setTimeout", function (cb, timeout)
            {
                s.runCb = cb;
                s["runTimeout" + timeoutMock.iteration] = timeout;

            }, 3);

            let runner = s.object;

            await runner.start ();

            s.runOnTimeout1 = runner.runOnTimeout;
            s.timeUntilNextRunHumanized1 = runner.job.timeUntilNextRunHumanized;

            test.mock (Date, "now", nit.Date ("2023-09-02 14:55", "America/Indianapolis").getTime () + Runner.MAX_TIMEOUT);
        })
        .after (async (s) =>
        {
            let runner = s.object;

            s.runOnTimeout2 = runner.runOnTimeout;
            s.timeUntilNextRunHumanized2 = runner.job.timeUntilNextRunHumanized;

            await s.runCb ();
        })
        .mock ("object", "spawn")
        .returnsInstanceOf ("cron.Runner")
        .expectingPropertyToBe ("runTimeout1", Runner.MAX_TIMEOUT)
        .expectingPropertyToBe ("runTimeout2", 304416353)
        .expectingPropertyToBe ("runOnTimeout1", false)
        .expectingPropertyToBe ("runOnTimeout2", true)
        .expectingPropertyToBe ("timeUntilNextRunHumanized1", "4 weeks, 9 hours and 5 minutes")
        .expectingPropertyToBe ("timeUntilNextRunHumanized2", "3 days, 12 hours, 33 minutes, 36 seconds and 353 milliseconds")
        .expectingPropertyToBe ("mocks.0.invocations.length", 1)
        .commit ()
;


test.method ("cron.Runner", "spawn")
    .should ("spawn a child process for the job command")
        .up (s => s.createArgs = nit.new ("cron.Job",
        {
            expr: "0 0 * * *",
            command: "nit test:not-found",
            env:
            {
                NIT_DEBUG: "cron.*"
            }
        }))
        .mock ("class", "spawn", function ()
        {
            return {
                on: (event, listener) =>
                {
                    listener (9);
                }
            };
        })
        .expectingPropertyToBe ("mocks.0.invocations.0.args.0", "nit test:not-found")
        .expectingPropertyToContain ("mocks.0.invocations.0.args.1",
        {
            shell: true,
            stdio: "inherit",
            detached: true,
            env:
            {
                NIT_DEBUG: "cron.*"
            }
        })
        .expectingPropertyToBe ("object.job.lastExitCode", 9)
        .commit ()
;
