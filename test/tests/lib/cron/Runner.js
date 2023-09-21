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
        .expectingPropertyToBeOfType ("result.timer", "nit.utils.Timer")
        .expectingMethodToReturnValueOfType ("result.stop", null, "cron.Runner")
        .commit ()

    .should ("invoke run when the timer fires")
        .up (s => s.global = global)
        .up (s => (s.lock = new nit.Deferred) && null)
        .up (s => s.createArgs = nit.new ("cron.Job",
        {
            expr: "0 0 1 * *",
            command: "nit test:not-found"
        }))
        .mock ("global.Date", "now", function ()
        {
            let { iteration, strategy: s } = this;

            if (iteration == 1)
            {
                s.now = nit.Date ("2023-09-02 14:55", "America/Indianapolis").getTime ();
            }

            return s.now;
        })
        .mock ("global", "setTimeout", function (cb, timeout)
        {
            let { targetMethod: setTimeout, strategy: s } = this;

            s.now += timeout;

            setTimeout (function ()
            {
                cb (); // eslint-disable-line callback-return

                if (timeout < 2147483647)
                {
                    s.lock.resolve ();
                }

            }, 1);
        })
        .mock ("object", "run")
        .after (s => s.lock)
        .returnsInstanceOf ("cron.Runner")
        .expectingPropertyToBe ("mocks.1.invocations.length", 2)
        .expectingPropertyToBe ("mocks.1.invocations.0.args.1", 2147483647)
        .expectingPropertyToBe ("mocks.1.invocations.1.args.1", 304416353)
        .expectingPropertyToBe ("mocks.2.invocations.length", 1)
        .commit ()
;


test.method ("cron.Runner", "run")
    .should ("run the job command")
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
        .after (s => s.object.stop ())
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

    .should ("catch the exception and set job's lastExitCode to -1")
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
                on: () =>
                {
                    throw new Error ("ERR!");
                }
            };
        })
        .after (s => s.object.stop ())
        .throws ("ERR!")
        .expectingPropertyToBe ("mocks.0.invocations.0.args.0", "nit test:not-found")
        .expectingPropertyToBe ("object.job.lastExitCode", -1)
        .commit ()
;
