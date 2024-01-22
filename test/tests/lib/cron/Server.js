test.method ("cron.Server", "start")
    .useMockDatabase ({ suffix: ".start" })
    .should ("start the cron server")
        .mock ("object", "updateEnqueueTimer")
        .mock (Date, "now", function ()
        {
            return this.strategy.time1.getTime ();
        })
        .up (s => s.createArgs = { db: s.db })
        .spy ("db", "update", async function (table, values)
        {
            values.mtime = this.strategy.time1;
        })
        .spy ("db", "execute", async function (statement)
        {
            let { target: db, strategy: s } = this;

            if (statement instanceof s.Query)
            {
                statement = statement.sql;
            }

            if (statement == nit.trim.text`
                SELECT *
                FROM "cron_jobs"`)
            {
                await db.insert ("cron_jobs",
                {
                    id: s.uuid1,
                    expr: "0 0 * * *",
                    command: "shell echo test",
                    timezone: "UTC",
                    status: "running",
                    mtime: s.time1
                });
            }
        })
        .after (s => s.object.stop ())
        .expectingPropertyToBe ("spies.0.invocations.0.args.1",
        {
            nextRun: "2024-01-18T00:00:00.000",
            status: "scheduled",
            mtime: new Date ("2024-01-17T20:30:00.000Z"),
            nextRunUtc: new Date ("2024-01-18T00:00:00.000Z")
        })
        .commit ()
;


test.method ("cron.Server", "dequeue")
    .should ("dequeue a job from the database")
        .useMockDatabase ({ suffix: ".dequeue" })
        .up (s => s.createArgs = { db: s.db })
        .mock ("object", "updateEnqueueTimer")
        .mock ("object", "runJob")
        .mock ("object", "dequeue", function ()
        {
            let { iteration, target, targetMethod } = this;

            if (iteration != 2)
            {
                return nit.invoke ([target, targetMethod], arguments);
            }
        })
        .mock ("db", "insert", function (table, values)
        {
            let { target, targetMethod, strategy: s } = this;

            values.mtime = s.time1;

            return nit.invoke ([target, targetMethod], [table, values]);
        })
        .mock (Date, "now", function ()
        {
            return this.strategy.time1.getTime ();
        })
        .mock ("db", "disconnect")
        .spy ("db", "update", async function (table, values)
        {
            values.mtime = this.strategy.time1;
        })
        .before (s => s.object.start ())
        .before (s =>
        {
            s.db.rewrite ("SELECT UUID_GENERATE_V4 ()", "SELECT 'aa69a37c-811a-4537-b3da-88b7af70be1c' AS uuid_generate_v4");
            s.db.rewrite ("COMMIT", "-- COMMIT");
        })
        .before (s => s.object.Job.create ("", "0 0 * * *", "shell echo 'test'", s.timezone1, { status: "queued" }))
        .after (s => s.object.taskQueue.waitUntilIdle ())
        .after (s => s.object.stop ())
        .after (s => s.mocks[5].restore ())
        .after (s => s.db.disconnect ())
        .expectingPropertyToBe ("spies.0.invocations.length", 1)
        .expectingPropertyToBe ("mocks.0.invocations.length", 1)
        .expectingPropertyToBe ("mocks.1.invocations.length", 1)
        .expectingPropertyToBe ("mocks.2.invocations.length", 2)
        .commit ()
;


test.method ("cron.Server", "runJob")
    .should ("save the output of the job")
        .useMockDatabase ({ suffix: ".runJob" })
        .up (s => s.createArgs = { db: s.db })
        .mock (nit, "lookupCommand", function ()
        {
            return nit.defineCommand ("test.commands.MyCmd")
                .onRun (function ()
                {
                    return "my-cmd";
                })
            ;
        })
        .mock ("db", "insert", function (table, values)
        {
            let { target, targetMethod, strategy: s } = this;

            values.mtime = s.time1;

            return nit.invoke ([target, targetMethod], [table, values]);
        })
        .mock ("db", "update", function (table, values)
        {
            let { target, targetMethod } = this;

            values.duration = 200;

            return nit.invoke ([target, targetMethod], [table, values]);
        })
        .mock ("object", "updateEnqueueTimer")
        .mock ("db", "disconnect")
        .mock ("TimestampUpdater.prototype", "perform")
        .mock (Date, "now", function ()
        {
            return this.strategy.time1.getTime ();
        })
        .given ("aa69a37c-811a-4537-b3da-88b7af70be1c")
        .before (s => s.object.start ())
        .before (s =>
        {
            s.db.rewrite ("SELECT UUID_GENERATE_V4 ()", "SELECT 'aa69a37c-811a-4537-b3da-88b7af70be1c' AS uuid_generate_v4");
        })
        .before (s => s.object.Job.create ("", "0 0 * * *", "shell echo 'test'", s.timezone1, { status: "queued" }))
        .after (s => s.object.taskQueue.waitUntilIdle ())
        .after (s => s.object.stop ())
        .after (s => s.mocks[4].restore ())
        .after (s => s.db.disconnect ())
        .expectingPropertyToContain ("mocks.2.invocations.0.args.1",
        {
            status: "scheduled",
            output: "my-cmd"
        })
        .expectingPropertyToBe ("mocks.3.invocations.length", 2)
        .commit ()
;


test.method ("cron.Server", "updateEnqueueTimer")
    .should ("set up the timer for the next scheduled job")
        .useMockDatabase ({ suffix: ".updateEnqueueTimer" })
        .up (s => s.createArgs = { db: s.db })
        .mock ("db", "insert", function (table, values)
        {
            let { target, targetMethod, strategy: s } = this;

            values.mtime = s.time1;

            return nit.invoke ([target, targetMethod], [table, values]);
        })
        .mock ("object", "enqueueScheduledJobs")
        .mock ("class.Task.prototype", "sleep", () => true)
        .mock ("db", "disconnect")
        .mock ("TimestampUpdater.prototype", "perform")
        .mock (Date, "now", function ()
        {
            return this.strategy.time1.getTime ();
        })
        .mock ("object", "info")
        .given ("aa69a37c-811a-4537-b3da-88b7af70be1c")
        .before (s => s.object.start ())
        .before (s =>
        {
            s.db.rewrite ("SELECT UUID_GENERATE_V4 ()", "SELECT 'aa69a37c-811a-4537-b3da-88b7af70be1c' AS uuid_generate_v4");
        })
        .before (s => s.object.Job.create ("", "0 0 * * *", "shell echo 'test'", s.timezone1))
        .after (s => s.object.taskQueue.waitUntilIdle ())
        .after (s => s.object.stop ())
        .after (s => s.mocks[3].restore ())
        .after (s => s.db.disconnect ())
        .expectingPropertyToBe ("mocks.1.invocations.length", 1)
        .expectingPropertyToBe ("mocks.2.invocations.0.args.0", 30600000)
        .expectingPropertyToBe ("mocks.6.invocations.0.args.0", "info.next_job_scheduled")
        .commit ()
;


test.method ("cron.Server", "enqueueScheduledJobs")
    .should ("update scheduled jobs to queued")
        .useMockDatabase ({ suffix: ".enqueueScheduledJobs" })
        .up (s => s.createArgs = { db: s.db })
        .mock ("db", "insert", function (table, values)
        {
            let { target, targetMethod, strategy: s } = this;

            values.mtime = s.time1;

            return nit.invoke ([target, targetMethod], [table, values]);
        })
        .mock ("object", "dequeue")
        .mock ("db", "disconnect")
        .mock (Date, "now", function ()
        {
            return this.strategy.time1.getTime ();
        })
        .given ("aa69a37c-811a-4537-b3da-88b7af70be1c")
        .before (s => s.object.start ())
        .before (s =>
        {
            s.db.rewrite ("SELECT UUID_GENERATE_V4 ()", "SELECT 'aa69a37c-811a-4537-b3da-88b7af70be1c' AS uuid_generate_v4");
        })
        .before (s => s.object.Job.create ("", "0 0 * * *", "shell echo 'test'", s.timezone1))
        .after (s => s.object.taskQueue.waitUntilIdle ())
        .after (s => s.object.stop ())
        .after (s => s.mocks[2].restore ())
        .after (s => s.db.disconnect ())
        .expectingPropertyToBe ("mocks.1.invocations.length", 1)
        .commit ()
;
