nit.test.Strategy
    .addSetupFilesForPackage ("postgresql")
    .do (() => nit.require ("http.Server").defaults ("stopTimeout", 0))
    .memo ("cron", true, false, () => nit.require ("cron"))
    .memo ("Server", true, false, () => nit.require ("cron.Server"))
    .memo ("Query", true, false, () => nit.require ("postgresql.Query"))
    .memo ("uuid1", () => "11111111-1111-1111-1111-111111111111")
    .memo ("time1", () => new Date (2024, 0, 17, 15, 30))
    .memo ("timezone1", () => "America/Indianapolis")
    .method ("setupTestForApi", function ()
    {
        return this
            .useMockDatabase ()
            .before (s => s.cronServer = nit.new ("cron.Server", { db: s.db }))
            .before (s => s.context.registerService (s.cronServer))
            .before (s => s.context.registerService (s.db))
            .before (s => s.context.server = new nit.new ("http.Server"))
            .before (s => s.cronServer.start ())
            .mock ("db", "disconnect")
            .mock (nit, "timezone", function () { return this.strategy.timezone1; })
            .down (s => s.mocks[0].restore ())
            .down (s => s.cronServer.stop ())
            .down (s => s.db.disconnect ())
            .snapshot ()
        ;
    })
    .method ("setupTestForCommand", function ()
    {
        return this
            .useMockDatabase ()
            .before (s => s.context.registerService (s.db))
            .mock ("db", "disconnect")
            .mock (nit, "timezone", function () { return this.strategy.timezone1; })
            .deinit (s => s.mocks[0].restore ())
            .deinit (s => s.db.disconnect ())
            .snapshot ()
        ;
    })
    .method ("expectingResultJsonToBe", function (json, ...otherProperties)
    {
        let self = this;
        let cls = self.constructor;


        self.expecting ("the result JSON to be %{value}", nit.trim.text (json), s =>
        {
            let pojo = s.result.toPojo ();

            otherProperties.forEach (p => pojo[p] = nit.clone (nit.get (s.result, p), cls.toPojoFilter));

            return nit.toJson (pojo, 2);
        });

        self.expectors[self.expectors.length - 1].validator.sourceLine = self.constructor.getSourceLine (__filename);

        return self;
    })
;
