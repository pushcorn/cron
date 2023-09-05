nit.test.Strategy
    .memo ("Humanize", () => nit.require ("nit.utils.Humanize"))
    .method ("expectingResultJsonToBe", function (json)
    {
        const self = this;

        self.expecting ("the result JSON to be %{value}", nit.trim.text (json), s => nit.toJson (s.result.toPojo (), 2));

        self.expectors[self.expectors.length - 1].validator.sourceLine = self.constructor.getSourceLine (__filename);

        return self;
    })
;
