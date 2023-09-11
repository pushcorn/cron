const cron = nit.require ("cron");


test.object ("cron.items.LastDayOfMonth")
    .should ("throw if the expression is invalid (%{args.1})")
        .given (nit.new ("cron.fields.DayOfMonth"), "MOM")
        .given (nit.new ("cron.fields.DayOfMonth"), "LA")
        .throws ("error.invalid_value")
        .commit ()

    .should ("throw if the offset is greater than 30")
        .given (nit.new ("cron.fields.DayOfMonth"), "L-31")
        .throws ("error.greater_than_max")
        .commit ()

    .should ("accept valid expression '%{args.1}'")
        .given (nit.new ("cron.fields.DayOfMonth"), "L")
        .given (nit.new ("cron.fields.DayOfMonth"), "L-5")
        .commit ()
;


test.method ("cron.items.LastDayOfMonth", "getTargetDate")
    .should ("return the date of the last n day of the week")
        .up (s => s.createArgs = [nit.new ("cron.fields.DayOfMonth"), "L"])
        .given (cron.getDateAsUtc (new Date (2023, 6, 4)))
        .returns (31)
        .commit ()

    .up (s => s.createArgs = [nit.new ("cron.fields.DayOfMonth"), "L-5"])
        .given (cron.getDateAsUtc (new Date (2023, 6, 4)))
        .returns (26)
        .commit ()

    .up (s => s.createArgs = [nit.new ("cron.fields.DayOfMonth"), "L-30"])
        .given (cron.getDateAsUtc (new Date (2023, 6, 4)))
        .returns (1)
        .commit ()
;


test.method ("cron.items.LastDayOfMonth", "getStepsToNextOccurrence")
    .should ("return the steps to next occurrence")
        .up (s => s.createArgs = [nit.new ("cron.fields.DayOfMonth"), "L"])
        .given (cron.getDateAsUtc (new Date (2023, 6, 4)))
        .returns (27)
        .commit ()

    .up (s => s.createArgs = [nit.new ("cron.fields.DayOfMonth"), "L-5"])
        .given (cron.getDateAsUtc (new Date (2023, 6, 4)))
        .returns (22)
        .commit ()

    .up (s => s.createArgs = [nit.new ("cron.fields.DayOfMonth"), "L-30"])
        .given (cron.getDateAsUtc (new Date (2023, 6, 4)))
        .returns (28)
        .commit ()

    .up (s => s.createArgs = [nit.new ("cron.fields.DayOfMonth"), "L-29"])
        .given (cron.getDateAsUtc (new Date (2023, 6, 4)))
        .returns (29)
        .commit ()

    .up (s => s.createArgs = [nit.new ("cron.fields.DayOfMonth"), "L-28"])
        .given (cron.getDateAsUtc (new Date (2023, 8, 4)))
        .returns (29)
        .commit ()
;
