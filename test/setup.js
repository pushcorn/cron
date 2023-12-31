nit.require ("http.Server").defaults ("stopTimeout", 0);


nit.test.Strategy
    .memo ("Scheduler", () => nit.require ("cron.Scheduler"))
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
