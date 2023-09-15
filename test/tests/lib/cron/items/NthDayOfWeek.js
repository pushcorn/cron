const cron = nit.require ("cron");


test.object ("cron.items.NthDayOfWeek")
    .should ("throw if the expression is invalid (%{args.0})")
        .given ("a#3")
        .given ("0#")
        .given ("0#n")
        .given ("7#6")
        .given ("6#6")
        .throws ("error.invalid_value")
        .commit ()

    .should ("accept valid expression '%{args.0}'")
        .given ("7#5")
        .given ("3#2")
        .given ("6#5")
        .commit ()
;


test.method ("cron.items.NthDayOfWeek", "getDatesForDayOfWeek")
    .should ("return all dates for the specified day of week")
        .up (s => s.createArgs = "1#5")
        .before (s => s.object.field = nit.new ("cron.fields.DayOfWeek"))
        .given (cron.getDateAsUtc (new Date (2024, 7, 7)))
        .returns ([5, 12, 19, 26])
        .commit ()

    .up (s => s.createArgs = "6#5")
        .before (s => s.object.field = nit.new ("cron.fields.DayOfWeek"))
        .given (cron.getDateAsUtc (new Date (2024, 7, 7)))
        .returns ([3, 10, 17, 24, 31])
        .commit ()

    .up (s => s.createArgs = "6#5")
        .before (s => s.object.field = nit.new ("cron.fields.DayOfWeek"))
        .given (cron.getDateAsUtc (new Date (2025, 2, 1)))
        .returns ([1, 8, 15, 22, 29])
        .commit ()
;


test.method ("cron.items.NthDayOfWeek", "getTargetDate")
    .should ("return the date of n-th day of week for the given month")
        .up (s => s.createArgs = "1#5")
        .before (s => s.object.field = nit.new ("cron.fields.DayOfWeek"))
        .given (cron.getDateAsUtc (new Date (2024, 7, 7)))
        .returns (0)
        .commit ()

    .up (s => s.createArgs = "6#5")
        .before (s => s.object.field = nit.new ("cron.fields.DayOfWeek"))
        .given (cron.getDateAsUtc (new Date (2024, 7, 7)))
        .returns (31)
        .commit ()
;


test.method ("cron.items.NthDayOfWeek", "getStepsToNextOccurrence")
    .should ("return the steps to next occurrence")
        .up (s => s.createArgs = "1#5")
        .before (s => s.object.field = nit.new ("cron.fields.DayOfWeek"))
        .given (cron.getDateAsUtc (new Date (2024, 7, 7)))
        .returns (54)
        .commit ()

    .up (s => s.createArgs = "6#5")
        .before (s => s.object.field = nit.new ("cron.fields.DayOfWeek"))
        .given (cron.getDateAsUtc (new Date (2024, 7, 7)))
        .returns (24)
        .commit ()

    .up (s => s.createArgs = "3#5")
        .before (s => s.object.field = nit.new ("cron.fields.DayOfWeek"))
        .given (cron.getDateAsUtc (new Date (2024, 7, 7)))
        .returns (84)
        .commit ()
;
