const cron = nit.require ("cron");


test.object ("cron.items.LastDayOfWeek")
    .should ("throw if the expression is invalid")
        .given (nit.new ("cron.fields.DayOfWeek"), "MOM")
        .throws ("error.invalid_value")
        .commit ()

    .should ("accept value in dddL format")
        .given (nit.new ("cron.fields.DayOfWeek"), "TueL")
        .expectingPropertyToBe ("result.day", 2)
        .commit ()
;


test.method ("cron.items.LastDayOfWeek", "getTargetDate")
    .should ("return the date of the last n day of the week")
        .up (s => s.createArgs = [nit.new ("cron.fields.DayOfWeek"), "3L"])
        .given (cron.getDateAsUtc (new Date (2023, 6, 4)))
        .returns (26)
        .commit ()

    .up (s => s.createArgs = [nit.new ("cron.fields.DayOfWeek"), "3L"])
        .given (cron.getDateAsUtc (new Date (2023, 7, 4)))
        .returns (30)
        .commit ()
;


test.method ("cron.items.LastDayOfWeek", "getStepsToNextOccurrence")
    .should ("return the steps to next occurrence")
        .up (s => s.createArgs = [nit.new ("cron.fields.DayOfWeek"), "3L"])
        .given (cron.getDateAsUtc (new Date (2023, 6, 4)))
        .returns (22)
        .commit ()

    .up (s => s.createArgs = [nit.new ("cron.fields.DayOfWeek"), "3L"])
        .given (cron.getDateAsUtc (new Date (2023, 6, 27)))
        .returns (34)
        .commit ()
;
