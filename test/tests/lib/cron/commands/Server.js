const http = nit.require ("http");


test.command ("cron.commands.Server")
    .should ("start the cron server")
        .up (s => s.Server = nit.require ("cron.Server"))
        .up (s => s.Runner = nit.require ("cron.Runner"))
        .mock ("Server.prototype", "writeLog")
        .given (
        {
            port: 0,
            stopTimeout: 0
        })
        .after (async (s) =>
        {
            await nit.sleep (20);

            s.server = s.object.server;
            s.port = s.server.realPort;
            s.responses = {};
        })
        .after (async (s) =>
        {
            let res = await http.fetchJson (`http://127.0.0.1:${s.port}`);

            s.apiNames = res.spec.apis.map (a => a.name);
        })
        .after (async (s) =>
        {
            let mock = s.timerMock = test.mock (global, "setTimeout", function (cb)
            {
                mock.cb = cb;

                return 1;
            });

            let dateMock = test.mock (Date, "now", function ()
            {
                if (dateMock.iteration == 1)
                {
                    return nit.Date ("2023-09-18 14:55", "America/Indianapolis").getTime ();
                }
                else
                if (dateMock.iteration == 2)
                {
                    return dateMock.originalMethod ();
                }
                else
                {
                    return nit.Date ("2023-09-18 21:00:00", "America/Indianapolis").getTime ();
                }
            }, 3);

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
        })
        .after (async (s) =>
        {
            let mock = s.spawnMock = test.mock (s.Runner, "spawn", function (command, opts)
            {
                opts.stdio = "pipe";

                let child = mock.originalMethod (command, opts);

                child.stdout.on ("data", data =>
                {
                    mock.output = data.toString ();
                });

                return child;
            });

            s.timerMock.cb ();

            await s.server.runnerMap[1].completion;
        })
        .after (async (s) =>
        {
            let res = await http.fetchJson (`http://127.0.0.1:${s.port}/jobs`);

            s.responses.jobs = res.jobs;
        })
        .deinit (async (s) =>
        {
            await nit.sleep (10);
            await s.server?.stop ();
        })
        .expectingPropertyToBe ("mocks.0.invocations.0.args.0", /cron.*started/)
        .expectingPropertyToBe ("port", /\d+/)
        .expectingPropertyToBe ("apiNames",
        [
            "AddJob",
            "GetApiSpec",
            "ListJobs"
        ])
        .expectingPropertyToBe ("responses.addJob.job.timeUntilNextRun", 21900000)
        .expectingPropertyToBe ("spawnMock.output", "[ERROR] The command 'test:not-found' was not found.\n")
        .expectingPropertyToBe ("responses.jobs.0",
        {
            "command": "nit test:not-found",
            "expr": "0 9-17 * * *",
            "id": 1,
            "lastExitCode": 1,
            "nextRun": "2023-09-19T10:00:00.000+08:00",
            "nextRunUtc": "2023-09-19T02:00:00.000Z",
            "shell": true,
            "timeUntilNextRun": 3600000,
            "timeUntilNextRunHumanized": "1 hour",
            "timezone": "Asia/Taipei"
        })
        .commit ()
;
