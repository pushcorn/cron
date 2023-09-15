test.object ("cron.items.Range")
    .should ("throw if the expression is invalid")
        .given ("MOM")
        .throws ("error.invalid_value")
        .commit ()

    .should ("throw if the from value is greater than to value")
        .given ("10-5")
        .throws ("error.from_value_greater_than_to_value")
        .commit ()

    .should ("be able to parse expression with an interval")
        .given ("*/2")
        .expectingPropertyToBe ("result.interval", 2)
        .commit ()

    .should ("set the upper range value to the max if not given when the interval is specified")
        .up (s => s.class = nit.lookupClass ("cron.fields.Hour").supportedItemTypes[0])
        .given ("5/2")
        .expectingPropertyToBe ("result.interval", 2)
        .expectingPropertyToBe ("result.from", 5)
        .expectingPropertyToBe ("result.to", 23)
        .commit ()

    .should ("populate reverseValueAliases if valueAliases is specified")
        .up (s => s.class = nit.lookupClass ("cron.fields.DayOfWeek").supportedItemTypes[0])
        .given ("THU")
        .expectingPropertyToBe ("result.constructor.reverseValueAliases", { 0: 7 })
        .commit ()
;


test.method ("cron.items.Range", "parseValue")
    .should ("return the value of a valid alias")
        .up (s => s.class = nit.lookupClass ("cron.fields.Month").supportedItemTypes[0])
        .up (s => s.createArgs = 1)
        .given ("Feb")
        .returns (2)
        .commit ()

    .should ("return the value of a valid value alias")
        .up (s => s.class = nit.lookupClass ("cron.fields.DayOfWeek").supportedItemTypes[0])
        .up (s => s.createArgs = "*")
        .given (7)
        .returns (0)
        .commit ()
;


test.method ("cron.items.Range", "applicableToMonth")
    .should ("return the true if some values are within the range of the given month")
        .up (s => s.class = nit.lookupClass ("cron.fields.DayOfMonth").supportedItemTypes[0])
        .up (s => s.createArgs = "1-10")
        .given (2)
        .returns (true)
        .commit ()

    .should ("return the false if NO values are within the range of the given month")
        .up (s => s.class = nit.lookupClass ("cron.fields.DayOfMonth").supportedItemTypes[0])
        .up (s => s.createArgs = "30-31")
        .given (2)
        .returns (false)
        .commit ()
;


test.method ("cron.items.Range", "isWildcard")
    .should ("return true if the expression is a wildcard")
        .up (s => s.createArgs = "*")
        .returns (true)
        .commit ()

    .should ("return false if the expression is NOT a wildcard")
        .up (s => s.createArgs = "1")
        .returns (false)
        .commit ()
;


test.method ("cron.items.Range", "getStepsToNextOccurrence")
    .should ("returns the steps to the next occurrence")
        .up (s => s.createArgs = 10)
        .before (s => s.object.field = nit.new ("cron.fields.Hour"))
        .given (new Date)
        .mock ("object.field", "getValueForDate", function ()
        {
            this.counter = ~~this.counter + 1;

            return this.counter + 2;
        })
        .returns (7)
        .commit ()
;


