const cron = nit.require ("cron");


test.object ("cron.Item")
    .should ("throw if the expr does not match any patterns")
        .up (s => s.class = nit.defineClass ("cron.items.Test", "cron.Item"))
        .given ("*")
        .throws ("error.invalid_value")
        .commit ()
;


test.method ("cron.Item", "isWildcard")
    .should ("return false by default")
        .up (s => s.class = nit.defineClass ("cron.items.Test", "cron.Item")
            .meta ("patterns", /^\*$/)
            .onParse (function () {})
        )
        .up (s => s.createArgs = "*")
        .returns (false)
        .commit ()
;


test.method ("cron.Item", "applicableToMonth")
    .should ("return false by default")
        .up (s => s.class = nit.defineClass ("cron.items.Test", "cron.Item")
            .meta ("patterns", /^\*$/)
            .onParse (function () {})
        )
        .up (s => s.createArgs = "*")
        .returns (false)
        .commit ()
;


test.method ("cron.Item", "getStepsToNextOccurrence")
    .should ("return use today's date if no date was given")
        .up (s => s.class = nit.lookupClass ("cron.items.Range"))
        .up (s => s.createArgs = "*")
        .before (s => s.object.field = nit.new ("cron.fields.Hour"))
        .returns (0)
        .commit ()
;


test.method ("cron.Item", "getStepsToTargetDate")
    .should ("return the steps to the specified target date")
        .up (s => s.class = nit.lookupClass ("cron.items.LastDayOfMonth"))
        .up (s => s.createArgs = "L-15")
        .given (cron.getDateAsUtc (nit.parseDate ("2023-03-20 13:24:35")))
        .returns (26)
        .commit ()
;


test.method ("cron.Item", "getStepsToNextValue")
    .should ("return the steps to the specified target date")
        .up (s => s.class = nit.lookupClass ("cron.items.Range"))
        .up (s => s.createArgs = "1-5")
        .before (s => s.object.field = nit.new ("cron.fields.DayOfMonth"))
        .given (cron.getDateAsUtc (nit.parseDate ("2023-03-20 13:24:35")), [1, 2, 3, 4, 5])
        .returns (12)
        .commit ()
;
