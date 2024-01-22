test.object ("cron.models.Job", true, "timeUntilNextRun")
    .should ("return the time to next run")
        .up (s => s.now = s.cron.getDateAsUtc (new Date (2024, 1, 12, 17, 20)) * 1)
        .up (s => s.args =
        {
            expr: "0 0 * * *",
            command: "shell echo test",
            timezone: "UTC",
            nextRunUtc: s.now
        })
        .up (s => s.Date = Date)
        .mock ("Date", "now", function ()
        {
            return this.strategy.now;
        })
        .before (s => s.class.validate (s.instance))
        .returns (24000000)
        .expectingPropertyToBe ("instance.timeUntilNextRunHumanized", "6 hours and 40 minutes")
        .expectingPropertyToBeOfType ("class.table", "postgresql.Table")
        .expectingPropertyToBe ("class.table.indexes.length", 1)
        .commit ()
;


test.method ("cron.models.Job", "update")
    .should ("update the nextRun fields")
        .useMockPgClient ()
        .up (s => s.now = s.cron.getDateAsUtc (new Date (2024, 1, 12, 17, 20)) * 1)
        .up (s => s.createArgs =
        {
            id: "11111111-1111-1111-1111-111111111111",
            expr: "0 0 * * *",
            command: "shell echo test",
            timezone: "UTC",
            nextRunUtc: s.now
        })
        .up (s => s.Date = Date)
        .mock ("Date", "now", function ()
        {
            return this.strategy.now;
        })
        .spy ("db", "update", function (table, changes)
        {
            changes.mtime = new Date (this.strategy.now);
        })
        .before (s => s.db.client.result =
        {
            rows:
            [
            {
                id: "11111111-1111-1111-1111-111111111111",
                expr: "0 0 * * *",
                command: "shell echo test",
                timezone: "UTC"
            }
            ]
        })
        .before (s => s.class.db = s.db)
        .given ({ status: "running" })
        .returnsResultOfExpr ("object")
        .expectingPropertyToBe ("db.client.statement", nit.trim.text`
            UPDATE "cron_jobs"
            SET "status" = 'running', "nextRun" = '2024-02-13T00:00:00.000', "mtime" = '2024-02-12T17:20:00.000Z', "nextRunUtc" = '2024-02-13T00:00:00.000Z'
            WHERE "id" = '11111111-1111-1111-1111-111111111111'
        `)
        .commit ()
;
