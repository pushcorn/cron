const cron = nit.require ("cron");


test.object ("cron.items.LastDayOfMonth")
    .should ("throw if the expression is invalid (%{args.0})")
        .given ("MOM")
        .given ("LA")
        .throws ("error.invalid_value")
        .commit ()

    .should ("throw if the offset is greater than 30")
        .given ("L-31")
        .throws ("error.greater_than_max")
        .commit ()

    .should ("accept valid expression '%{args.0}'")
        .given ("L")
        .given ("L-5")
        .commit ()
;


test.method ("cron.items.LastDayOfMonth", "getTargetDate")
    .should ("return the date of the last n day of the week")
        .up (s => s.createArgs = "L")
        .before (s => s.object.field = nit.new ("cron.fields.DayOfMonth"))
        .given (cron.getDateAsUtc (new Date (2023, 6, 4)))
        .returns (31)
        .commit ()

    .up (s => s.createArgs = "L-5")
        .before (s => s.object.field = nit.new ("cron.fields.DayOfMonth"))
        .given (cron.getDateAsUtc (new Date (2023, 6, 4)))
        .returns (26)
        .commit ()

    .up (s => s.createArgs = "L-30")
        .before (s => s.object.field = nit.new ("cron.fields.DayOfMonth"))
        .given (cron.getDateAsUtc (new Date (2023, 6, 4)))
        .returns (1)
        .commit ()
;


test.method ("cron.items.LastDayOfMonth", "getStepsToNextOccurrence")
    .should ("return the steps to next occurrence")
        .up (s => s.createArgs = "L")
        .before (s => s.object.field = nit.new ("cron.fields.DayOfMonth"))
        .given (cron.getDateAsUtc (new Date (2023, 6, 4)))
        .returns (27)
        .commit ()

    .up (s => s.createArgs = "L-5")
        .before (s => s.object.field = nit.new ("cron.fields.DayOfMonth"))
        .given (cron.getDateAsUtc (new Date (2023, 6, 4)))
        .returns (22)
        .commit ()

    .up (s => s.createArgs = "L-30")
        .before (s => s.object.field = nit.new ("cron.fields.DayOfMonth"))
        .given (cron.getDateAsUtc (new Date (2023, 6, 4)))
        .returns (28)
        .commit ()

    .up (s => s.createArgs = "L-29")
        .before (s => s.object.field = nit.new ("cron.fields.DayOfMonth"))
        .given (cron.getDateAsUtc (new Date (2023, 6, 4)))
        .returns (29)
        .commit ()

    .up (s => s.createArgs = "L-28")
        .before (s => s.object.field = nit.new ("cron.fields.DayOfMonth"))
        .given (cron.getDateAsUtc (new Date (2023, 8, 4)))
        .returns (29)
        .commit ()
;


test.method ("cron.items.LastDayOfMonth", "applicableToMonth")
    .should ("return the true if some values are within the range of the given month")
        .up (s => s.class = nit.lookupClass ("cron.fields.DayOfMonth").supportedItemTypes[2])
        .up (s => s.createArgs = "L-30")
        .given (3)
        .returns (true)
        .commit ()

    .should ("return the false if NO values are within the range of the given month")
        .up (s => s.class = nit.lookupClass ("cron.fields.DayOfMonth").supportedItemTypes[2])
        .up (s => s.createArgs = "L-30")
        .given (2)
        .returns (false)
        .commit ()
;
