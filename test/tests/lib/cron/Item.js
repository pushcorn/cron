test.object ("cron.Item")
    .should ("throw if the expr does not match any patterns")
        .up (s => s.class = nit.defineClass ("cron.items.Test", "cron.Item"))
        .given (nit.new ("cron.fields.Hour"), "*")
        .throws ("error.invalid_value")
        .commit ()
;


test.method ("cron.Item", "isWildcard")
    .should ("return false by default")
        .up (s => s.class = nit.defineClass ("cron.items.Test", "cron.Item")
            .meta ("patterns", /^\*$/)
            .onParse (function () {})
        )
        .up (s => s.createArgs = [nit.new ("cron.fields.Hour"), "*"])
        .returns (false)
        .commit ()
;


test.method ("cron.Item", "applicableToMonth")
    .should ("return false by default")
        .up (s => s.class = nit.defineClass ("cron.items.Test", "cron.Item")
            .meta ("patterns", /^\*$/)
            .onParse (function () {})
        )
        .up (s => s.createArgs = [nit.new ("cron.fields.Hour"), "*"])
        .returns (false)
        .commit ()
;


test.method ("cron.Item", "getStepsToNextOccurrence")
    .should ("return use today's date if no date was given")
        .up (s => s.class = nit.lookupClass ("cron.items.Range"))
        .up (s => s.createArgs = [nit.new ("cron.fields.Hour"), "*"])
        .returns (0)
        .commit ()
;
