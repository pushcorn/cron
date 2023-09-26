const http = nit.require ("http");


test.command ("cron.commands.Server")
    .should ("start the cron server")
        .up (s => s.Server = nit.require ("cron.Server"))
        .up (s => s.Job = nit.require ("cron.Job"))
        .up (s => s.global = global)
        .given ({ port: 0, stopTimeout: 0 })
        .mock ("Server.prototype", "writeLog")
        .mock ("global.Date", "now", function ()
        {
            let { iteration, strategy: s } = this;

            if (iteration == 1)
            {
                s.now = nit.Date ("2023-09-18 14:55", "America/Indianapolis").getTime ();
            }
            else
            if (iteration == 9)
            {
                s.now = nit.Date ("2023-09-18 15:00", "America/Indianapolis").getTime ();
            }

            return s.now;
        })
        .mock ("global", "setTimeout", function (cb, timeout)
        {
            let { targetMethod: setTimeout, strategy: s } = this;

            if (cb.name == "run")
            {
                s.now += timeout;

                return setTimeout (cb, 1);
            }
            else
            {
                return setTimeout (cb, timeout);
            }
        })
        .mock ("Job", "spawn", function (command, opts)
        {
            let { targetMethod, strategy: s } = this;

            opts.stdio = "pipe";

            let child = targetMethod (command, opts);

            child.stdout.on ("data", data =>
            {
                s.spawnOutput = data.toString ();
            });

            return child;
        })
        .after (async (s) =>
        {
            s.server = await s.object.server.ready;
            s.port = s.server.realPort;
            s.responses = {};
        })
        .after (async (s) =>
        {
            let res = await http.fetchJson (`http://127.0.0.1:${s.port}`);

            s.responses.getApiSpec = nit.trim (nit.toJson (res.spec, "  "));
        })
        .after (async (s) =>
        {
            let res = await http.fetchJson (`http://127.0.0.1:${s.port}/jobs`,
            {
                method: "POST",
                body:
                {
                    expr: "0 9-17 * * *",
                    command: "nit test:not-found",
                    timezone: "Asia/Taipei"
                }
            });

            s.responses.addJob = res;

            await s.server.jobMap[1].stop ();
        })
        .after (async (s) =>
        {
            let res = await http.fetchJson (`http://127.0.0.1:${s.port}/jobs`);

            s.responses.jobs = res.jobs;
        })
        .deinit (async (s) =>
        {
            await s.server?.stop ();
        })
        .expectingPropertyToBe ("mocks.0.invocations.0.args.0", /cron.*started/)
        .expectingPropertyToBe ("port", /\d+/)
        .expectingPropertyToBe ("responses.getApiSpec", nit.trim (nit.readFile (nit.path.join (test.TEST_PROJECT_PATH, "resources/api-spec.json"))))
        .expectingPropertyToBe ("responses.addJob.job.timeUntilNextRun", 21900000)
        .expectingPropertyToBe ("spawnOutput", "[ERROR] The command 'test:not-found' was not found.\n")
        .expectingPropertyToBe ("responses.jobs.0",
        {
            "command": "nit test:not-found",
            "expr": "0 9-17 * * *",
            "id": 1,
            "lastExitCode": 1,
            "nextRun": "2023-09-19T10:00:00.000+08:00",
            "nextRunUtc": "2023-09-19T02:00:00.000Z",
            "shell": true,
            "timeUntilNextRun": 25200000,
            "timeUntilNextRunHumanized": "7 hours",
            "timezone":
            {
                "name": "Asia/Taipei"
            }
        })
        .commit ()
;


test.command ("cron.commands.Server")
    .should ("start the specified jobs")
        .up (s => s.Server = nit.require ("cron.Server"))
        .up (s => s.global = global)
        .given (
        {
            port: 0,
            stopTimeout: 0,
            jobs:
            {
                expr: "0 2 * * *",
                command: "command-not-found"
            }
        })
        .mock ("Server.prototype", "writeLog")
        .mock ("Server.prototype", "schedule")
        .deinit (async (s) =>
        {
            await s.object.server?.stop ();
        })
        .expectingPropertyToBe ("mocks.1.invocations.length", 1)
        .expectingPropertyToBeOfType ("mocks.1.invocations.0.args.0", "cron.Job")
        .commit ()
;
