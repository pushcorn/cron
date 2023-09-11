test.object ("cron.items.Range")
    .should ("throw if the expression is invalid")
        .given (nit.new ("cron.fields.DayOfWeek"), "MOM")
        .throws ("error.invalid_value")
        .commit ()

    .should ("be able to parse expression with an interval")
        .given (nit.new ("cron.fields.Hour"), "*/2")
        .expectingPropertyToBe ("result.interval", 2)
        .commit ()

    .should ("set the upper range value to the max if not given when the interval is specified")
        .up (s => s.class = nit.lookupClass ("cron.fields.Hour").supportedItemTypes[0])
        .given (nit.new ("cron.fields.Hour"), "5/2")
        .expectingPropertyToBe ("result.interval", 2)
        .expectingPropertyToBe ("result.from", 5)
        .expectingPropertyToBe ("result.to", 23)
        .commit ()
;


test.method ("cron.items.Range", "parseValue")
    .should ("return the value of a valid alias")
        .up (s => s.class = nit.lookupClass ("cron.fields.Month").supportedItemTypes[0])
        .up (s => s.createArgs = [nit.new ("cron.fields.Month"), 1])
        .given ("Feb")
        .returns (2)
        .commit ()
;


test.method ("cron.items.Range", "isWildcard")
    .should ("return true if the expression is a wildcard")
        .up (s => s.createArgs = [nit.new ("cron.fields.Month"), "*"])
        .returns (true)
        .commit ()

    .should ("return false if the expression is NOT a wildcard")
        .up (s => s.createArgs = [nit.new ("cron.fields.Month"), "1"])
        .returns (false)
        .commit ()
;


test.method ("cron.items.Range", "getStepsToNextOccurrence")
    .should ("returns the steps to the next occurrence")
        .up (s => s.createArgs = [nit.new ("cron.fields.Hour"), "10"])
        .given (new Date)
        .mock ("object.field", "getValueForDate", function ()
        {
            this.counter = ~~this.counter + 1;

            return this.counter + 2;
        })
        .returns (7)
        .commit ()
;


