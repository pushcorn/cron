const cron = nit.require ("cron");


test.object ("cron.items.WeekdayOfMonth")
    .should ("throw if the expression is invalid (%{args.0})")
        .given ("LA")
        .given ("W")
        .throws ("error.invalid_value")
        .commit ()

    .should ("throw if the offset is greater than 31")
        .given ("32W")
        .throws ("error.greater_than_max")
        .commit ()

    .should ("throw if the offset is less than 1")
        .given ("0W")
        .throws ("error.less_than_min")
        .commit ()

    .should ("accept valid expression '%{args.0}'")
        .given ("LW")
        .given ("15W")
        .commit ()
;


test.method ("cron.items.WeekdayOfMonth", "applicableToMonth")
    .should ("return true if the item is applicable to the given month")
        .up (s => s.createArgs = "LW")
        .before (s => s.object.field = nit.new ("cron.fields.DayOfMonth"))
        .given (2)
        .returns (true)
        .commit ()

    .should ("return false if the item is NOT applicable to the given month")
        .up (s => s.createArgs = "31W")
        .before (s => s.object.field = nit.new ("cron.fields.DayOfMonth"))
        .given (2)
        .returns (false)
        .commit ()
;


test.method ("cron.items.WeekdayOfMonth", "getTargetDate")
    .should ("return the nearest weekday of the given date")
        .up (s => s.createArgs = "LW")
        .before (s => s.object.field = nit.new ("cron.fields.DayOfMonth"))
        .given (cron.getDateAsUtc (new Date (2024, 1, 2)))
        .returns (29)
        .commit ()

    .up (s => s.createArgs = "LW")
        .before (s => s.object.field = nit.new ("cron.fields.DayOfMonth"))
        .given (cron.getDateAsUtc (new Date (2024, 2, 2)))
        .returns (29)
        .commit ()

    .up (s => s.createArgs = "3W")
        .before (s => s.object.field = nit.new ("cron.fields.DayOfMonth"))
        .given (cron.getDateAsUtc (new Date (2024, 2, 6)))
        .returns (4)
        .commit ()

    .up (s => s.createArgs = "2W")
        .before (s => s.object.field = nit.new ("cron.fields.DayOfMonth"))
        .given (cron.getDateAsUtc (new Date (2024, 2, 6)))
        .returns (1)
        .commit ()

    .up (s => s.createArgs = "1W")
        .before (s => s.object.field = nit.new ("cron.fields.DayOfMonth"))
        .given (cron.getDateAsUtc (new Date (2024, 5, 6)))
        .returns (3)
        .commit ()
;


test.method ("cron.items.WeekdayOfMonth", "getStepsToNextOccurrence")
    .should ("return the steps to next occurrence")
        .up (s => s.createArgs = "LW")
        .before (s => s.object.field = nit.new ("cron.fields.DayOfMonth"))
        .given (cron.getDateAsUtc (new Date (2024, 1, 2)))
        .returns (27)
        .commit ()

    .up (s => s.createArgs = "LW")
        .before (s => s.object.field = nit.new ("cron.fields.DayOfMonth"))
        .given (cron.getDateAsUtc (new Date (2024, 2, 2)))
        .returns (27)
        .commit ()

    .up (s => s.createArgs = "3W")
        .before (s => s.object.field = nit.new ("cron.fields.DayOfMonth"))
        .given (cron.getDateAsUtc (new Date (2024, 2, 6)))
        .returns (28)
        .commit ()

    .up (s => s.createArgs = "2W")
        .before (s => s.object.field = nit.new ("cron.fields.DayOfMonth"))
        .given (cron.getDateAsUtc (new Date (2024, 2, 6)))
        .returns (27)
        .commit ()

    .up (s => s.createArgs = "1W")
        .before (s => s.object.field = nit.new ("cron.fields.DayOfMonth"))
        .given (cron.getDateAsUtc (new Date (2024, 5, 6)))
        .returns (25)
        .commit ()
;
