test.method ("cron.Item", "isWildcard")
    .should ("return false by default")
        .up (s => s.class = nit.lookupClass ("cron.items.LastDayOfWeek"))
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
