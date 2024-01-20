const POSTGRESQL_TEST_DIR = nit.path.join (nit.HOME, "packages/postgresql/test");

nit.require ("http.Server").defaults ("stopTimeout", 0);
nit.test.Strategy.Project.resetDirs ();
nit.ASSET_PATHS.push (POSTGRESQL_TEST_DIR);
["setup.js", "setup.local.js"].forEach (f => nit.require (nit.path.join (POSTGRESQL_TEST_DIR, f)));


nit.test.Strategy
    .memo ("cron", true, false, () => nit.require ("cron"))
    .memo ("Server", true, false, () => nit.require ("cron.Server"))
    .memo ("Query", true, false, () => nit.require ("postgresql.Query"))
    .memo ("uuid1", () => "11111111-1111-1111-1111-111111111111")
    .memo ("time1", () => new Date (2024, 0, 17, 15, 30))
    .memo ("timezone1", () => "America/Indianapolis")
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
