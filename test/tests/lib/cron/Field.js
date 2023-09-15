const cron = nit.require ("cron");


test.method ("cron.Field", "registerItemType", true)
    .should ("register a supported item type")
        .given ("cron:range")
        .commit ()

    .should ("accept an item class")
        .given (nit.lookupClass ("cron.items.Range"))
        .commit ()
;


test.method ("cron.Field", "supports", true)
    .should ("return the item class that can parse the given expression")
        .up (s => s.class = nit.require ("cron.fields.Hour"))
        .given ("H(1-3)")
        .returnsInstanceOf ("cron.items.Hash", true)
        .commit ()

    .should ("return null if the expression cannot be parsed")
        .up (s => s.class = nit.require ("cron.fields.Hour"))
        .given ("H#")
        .returns ()
        .commit ()
;


test.object ("cron.Field")
    .should ("throw if the given expresion is not supported")
        .up (s => s.class = nit.require ("cron.fields.DayOfWeek"))
        .given ("a#2")
        .throws ("error.invalid_expr")
        .commit ()
;


test.object ("cron.Field", true, "name")
    .should ("return the human readable name in lower case")
        .up (s => s.class = nit.require ("cron.fields.DayOfWeek"))
        .returns ("day of week")
        .commit ()
;


test.object ("cron.Field", true, "values")
    .should ("return the the possible values from the items")
        .up (s => s.class = nit.require ("cron.fields.DayOfWeek"))
        .returns ([0, 1, 2, 3, 4, 5, 6])
        .commit ()
;


test.object ("cron.Field", true, "isWildcard")
    .should ("return true if the wildcard expression was specified")
        .up (s => s.class = nit.require ("cron.fields.DayOfWeek"))
        .up (s => s.createArgs = "*")
        .returns (true)
        .commit ()

    .should ("return false if the wildcard expression WAS NOT specified")
        .up (s => s.class = nit.require ("cron.fields.DayOfWeek"))
        .given ("1-3")
        .returns (false)
        .commit ()
;


test.method ("cron.Field", "getValueForDate")
    .should ("return the field value of the given date")
        .up (s => s.class = nit.require ("cron.fields.DayOfWeek"))
        .given (cron.getDateAsUtc (new Date (2023, 6, 4)))
        .returns (2)
        .commit ()

    .should ("use the current date if custom date was not given")
        .up (s => s.class = nit.require ("cron.fields.DayOfWeek"))
        .given ()
        .returns (cron.getDateAsUtc ().getDay ())
        .commit ()
;


test.method ("cron.Field", "getStepsToNextOccurrence")
    .should ("return the steps required to get to the next occurrence")
        .up (s => s.class = nit.require ("cron.fields.DayOfWeek"))
        .up (s => s.createArgs = "5-6")
        .given (cron.getDateAsUtc (new Date (2023, 6, 4)))
        .returns (3)
        .commit ()
;


test.method ("cron.Field", "forward")
    .should ("increase the field value by the given steps")
        .up (s => s.class = nit.require ("cron.fields.DayOfMonth"))
        .given (cron.getDateAsUtc (new Date (2023, 6, 4)), 30)
        .returns ()
        .expectingPropertyToBe ("args.0", cron.getDateAsUtc (new Date (2023, 7, 3)))
        .commit ()
;


test.method ("cron.Field", "next")
    .should ("update the given date to the next occurrence")
        .up (s => s.class = nit.require ("cron.fields.DayOfMonth"))
        .up (s => s.createArgs = "20-30")
        .given (cron.getDateAsUtc (new Date (2023, 6, 4)))
        .returns (cron.getDateAsUtc (new Date (2023, 6, 20)))
        .commit ()

    .reset ()
        .up (s => s.class = nit.require ("cron.fields.DayOfMonth"))
        .up (s => s.createArgs = "*")
        .given (cron.getDateAsUtc (new Date (2023, 6, 4)))
        .returns (cron.getDateAsUtc (new Date (2023, 6, 4)))
        .commit ()
;
