const http = nit.require ("http");

nit.require ("postgresql.mocks.PgPool");


test.command ("cron:server")
    .should ("start the cron server")
        .up (s => s.args = { stopTimeout: 0 })
        .up (s => s.Logger = nit.require ("plugins.Logger"))
        .mock ("Logger.Logger.prototype", "writeLog")
        .after (s => s.object.server.stop ())
        .expectingPropertyToBe ("mocks.0.invocations.length", 3)
        .commit ()
;


test.command ("cron:server")
    .setupTestForCommand ()
    .should ("start the cron server")
        .up (s => s.HttpServer = nit.require ("http.Server"))
        .up (s => s.global = global)

        .before (s =>
        {
            s.db.rewrite ("SELECT UUID_GENERATE_V4 ()", `SELECT '${s.uuid1}' AS uuid_generate_v4`);
            s.db.rewrite ("COMMIT", "-- COMMIT");
        })
        .given ({ port: 0, stopTimeout: 0 })
        .mock ("HttpServer.prototype", "info") // mocks[2]
        .spy ("HttpServer.prototype", "start", function ()
        {
            let { obj: server, strategy: s } = this;

            server.serviceproviders.push (s.db);
        })
        .spy ("db", "insert", async function (table, values) { values.mtime = this.strategy.time1; })
        .spy ("db", "update", async function (table, values) { values.mtime = this.strategy.time1; })
        .mock (Date, "now", function () { return this.strategy.time1 * 1; })
        .after (async (s) =>
        {
            s.port = s.object.server.realPort;
            s.responses = {};
        })
        .after (async (s) =>
        {
            let res = await http.fetchJson (`http://127.0.0.1:${s.port}`);

            s.responses.getApiSpec = nit.trim (nit.toJson (res.spec, "  "));
        })
        .after (async (s) =>
        {
            let res = await http.fetchJson (`http://127.0.0.1:${s.port}/cron/jobs`,
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
            let res = await http.fetchJson (`http://127.0.0.1:${s.port}/cron/jobs`);

            s.responses.jobs = res.jobs;
        })
        .down (s => s.object.server.stop ())
        .expectingPropertyToBe ("mocks.2.invocations.0.args.0", "info.server_started")
        .expectingPropertyToBe ("port", /\d+/)
        .expectingPropertyToBe ("responses.getApiSpec", nit.trim (nit.readFile (nit.path.join (test.TEST_PROJECT_PATH, "resources/api-spec.json"))))
        .expectingPropertyToBe ("responses.addJob.job.timeUntilNextRun", 16200000)
        .expectingPropertyToBe ("responses.jobs.0",
        {
            "command": "nit test:not-found",
            "duration": 0,
            "error": "",
            "exitCode": 0,
            "expr": "0 9-17 * * *",
            "id": "11111111-1111-1111-1111-111111111111",
            "nextRun": "2024-01-18T09:00:00.000+08:00",
            "nextRunUtc": "2024-01-18T01:00:00.000Z",
            "output": "",
            "status": "scheduled",
            "timeUntilNextRun": 16200000,
            "timeUntilNextRunHumanized": "4 hours and 30 minutes",
            "timezone": "Asia/Taipei"
        })
        .commit ()
;
