const cron = nit.require ("cron");


test.object ("cron.items.Hash")
    .should ("throw if the expression is invalid (%{args.0})")
        .given ("MOM")
        .given ("H/10(0-29)")
        .given ("H(0-)/10")
        .given ("H(0)/10")
        .throws ("error.invalid_value")
        .commit ()

    .should ("accept valid expression '%{args.0}'")
        .up (s => s.class = nit.defineClass ("TestHash", "cron.items.Hash")
            .meta ({ min: 1, max: 28 })
        )
        .given ("H")
        .expectingResultJsonToBe (`
        {
          "expr": "H",
          "from": 1,
          "to": 28,
          "hasRange": false,
          "interval": 1
        }
        `)
        .expectingPropertyToBe ("result.values", [2])
        .expectingPropertyToBe ("result.hashCode", 2028396861)
        .commit ()

    .reset ()
        .up (s => s.class = nit.defineClass ("TestHash", "cron.items.Hash")
            .meta ({ min: 1, max: 28 })
        )
        .given ("H")
        .after (s => s.result.field = nit.new ("cron.fields.DayOfMonth"))
        .expectingResultJsonToBe (`
        {
          "expr": "H",
          "from": 1,
          "to": 28,
          "hasRange": false,
          "interval": 1
        }
        `)
        .expectingPropertyToBe ("result.values", [23])
        .expectingPropertyToBe ("result.hashCode", 2028396861)
        .commit ()

    .should ("accept valid expression '%{args.0}'")
        .up (s => s.class = nit.defineClass ("TestHash", "cron.items.Hash")
            .meta ({ min: 1, max: 28 })
        )
        .given ("H")
        .after (s => s.result.field = nit.new ("cron.fields.DayOfMonth"))
        .after (s => s.result.field.entry = nit.new ("cron.Entry", "@hourly", "America/Indianapolis", "test-command"))
        .expectingResultJsonToBe (`
        {
          "expr": "H",
          "from": 1,
          "to": 28,
          "hasRange": false,
          "interval": 1
        }
        `)
        .expectingPropertyToBe ("result.values", [23])
        .expectingPropertyToBe ("result.hashCode", 2028396861)
        .commit ()

    .reset ()
        .up (s => s.class = nit.defineClass ("TestHash", "cron.items.Hash")
            .meta ({ min: 1, max: 28 })
        )
        .given ("H/3")
        .after (s => s.result.field = nit.new ("cron.fields.DayOfMonth"))
        .expectingResultJsonToBe (`
        {
          "expr": "H/3",
          "from": 1,
          "to": 28,
          "hasRange": false,
          "interval": 3
        }
        `)
        .expectingPropertyToBe ("result.values", [3, 6, 9, 12, 15, 18, 21, 24, 27])
        .expectingPropertyToBe ("result.hashCode", 677996259)
        .commit ()

    .reset ()
        .up (s => s.class = nit.defineClass ("TestHash", "cron.items.Hash")
            .meta ({ min: 1, max: 28 })
        )
        .given ("H(1-28)/10")
        .after (s => s.result.field = nit.new ("cron.fields.DayOfMonth"))
        .expectingResultJsonToBe (`
        {
          "expr": "H(1-28)/10",
          "from": 1,
          "to": 28,
          "hasRange": true,
          "interval": 10
        }
        `)
        .expectingPropertyToBe ("result.values", [1, 11, 21])
        .expectingPropertyToBe ("result.hashCode", 229853467)
        .commit ()

    .reset ()
        .up (s => s.class = nit.defineClass ("TestHash", "cron.items.Hash")
            .meta ({ min: 0, max: 23 })
        )
        .given ("H(9-16)/2")
        .after (s => s.result.field = nit.new ("cron.fields.Hour"))
        .expectingResultJsonToBe (`
        {
          "expr": "H(9-16)/2",
          "from": 9,
          "to": 16,
          "hasRange": true,
          "interval": 2
        }
        `)
        .expectingPropertyToBe ("result.values", [10, 12, 14, 16])
        .expectingPropertyToBe ("result.hashCode", 135805629)
        .expectingMethodToReturnValue ("result.getStepsToNextOccurrence", cron.getDateAsUtc (new Date (2023, 6, 4, 19)), 15)
        .commit ()

    .reset ()
        .up (s => s.class = nit.defineClass ("TestHash", "cron.items.Hash")
            .meta ({ min: 1, max: 31 })
        )
        .given ("H/3")
        .after (s => s.result.field = nit.new ("cron.fields.DayOfMonth"))
        .expectingResultJsonToBe (`
        {
          "expr": "H/3",
          "from": 1,
          "to": 31,
          "hasRange": false,
          "interval": 3
        }
        `)
        .expectingPropertyToBe ("result.values", [2, 5, 8, 11, 14, 17, 20, 23, 26, 29])
        .expectingPropertyToBe ("result.hashCode", -190642437)
        .expectingMethodToReturnValue ("result.getStepsToNextOccurrence", cron.getDateAsUtc (new Date (2024, 1, 27)), 2)
        .commit ()

    .reset ()
        .up (s => s.class = nit.defineClass ("TestHash", "cron.items.Hash")
            .meta ({ min: 1, max: 31 })
        )
        .given ("H/3")
        .after (s => s.result.field = nit.new ("cron.fields.DayOfMonth", "1-3"))
        .expectingResultJsonToBe (`
        {
          "expr": "H/3",
          "from": 1,
          "to": 31,
          "hasRange": false,
          "interval": 3
        }
        `)
        .expectingPropertyToBe ("result.values", [3, 6, 9, 12, 15, 18, 21, 24, 27, 30])
        .expectingPropertyToBe ("result.hashCode", -190642437)
        .expectingMethodToReturnValue ("result.getStepsToNextOccurrence", cron.getDateAsUtc (new Date (2023, 1, 28)), 3)
        .commit ()

    .should ("accept the range of aliases")
        .up (s => s.class = nit.require ("cron.fields.Month").supportedItemTypes[1])
        .given ("H(feb-oct)")
        .after (s => s.result.field = nit.new ("cron.fields.Month"))
        .expectingResultJsonToBe (`
        {
          "expr": "H(feb-oct)",
          "from": 2,
          "to": 10,
          "hasRange": true,
          "interval": 1
        }
        `)
        .expectingPropertyToBe ("result.values", [5])
        .expectingPropertyToBe ("result.hashCode", 1088692125)
        .expectingMethodToReturnValue ("result.getStepsToNextOccurrence", cron.getDateAsUtc (new Date (2023, 1, 28)), 3)
        .commit ()

    .should ("accept the range of aliases with interval")
        .up (s => s.class = nit.require ("cron.fields.Month").supportedItemTypes[1])
        .given ("H(feb-oct)/3")
        .after (s => s.result.field = nit.new ("cron.fields.Month"))
        .expectingResultJsonToBe (`
        {
          "expr": "H(feb-oct)/3",
          "from": 2,
          "to": 10,
          "hasRange": true,
          "interval": 3
        }
        `)
        .expectingPropertyToBe ("result.values", [3, 6, 9])
        .expectingPropertyToBe ("result.hashCode", -693545413)
        .expectingMethodToReturnValue ("result.getStepsToNextOccurrence", cron.getDateAsUtc (new Date (2023, 1, 28)), 1)
        .commit ()

    .should ("accept the value alias")
        .up (s => s.class = nit.require ("cron.fields.DayOfWeek").supportedItemTypes[1])
        .given ("H(5-7)")
        .after (s => s.result.field = nit.new ("cron.fields.DayOfWeek"))
        .expectingResultJsonToBe (`
        {
          "expr": "H(5-7)",
          "from": 5,
          "to": 0,
          "hasRange": true,
          "interval": 1
        }
        `)
        .expectingPropertyToBe ("result.values", [0])
        .expectingPropertyToBe ("result.hashCode", -71004372)
        .expectingMethodToReturnValue ("result.getStepsToNextOccurrence", cron.getDateAsUtc (new Date (2023, 1, 28)), 5)
        .commit ()

    .should ("accept the value alias with interval")
        .up (s => s.class = nit.require ("cron.fields.DayOfWeek").supportedItemTypes[1])
        .given ("H(3-7)/2")
        .after (s => s.result.field = nit.new ("cron.fields.DayOfWeek"))
        .expectingResultJsonToBe (`
        {
          "expr": "H(3-7)/2",
          "from": 3,
          "to": 0,
          "hasRange": true,
          "interval": 2
        }
        `)
        .expectingPropertyToBe ("result.values", [3, 5, 0])
        .expectingPropertyToBe ("result.hashCode", 56520912)
        .expectingMethodToReturnValue ("result.getStepsToNextOccurrence", cron.getDateAsUtc (new Date (2023, 1, 28)), 1)
        .commit ()
;


test.method ("cron.items.Hash", "applicableToMonth")
    .should ("return the true if some values are within the range of the given month")
        .up (s => s.class = nit.lookupClass ("cron.fields.DayOfMonth").supportedItemTypes[1])
        .up (s => s.createArgs = "H(1-10)")
        .given (2)
        .returns (true)
        .commit ()

    .should ("return the false if NO values are within the range of the given month")
        .up (s => s.class = nit.lookupClass ("cron.fields.DayOfMonth").supportedItemTypes[1])
        .up (s => s.createArgs = "H(30-31)")
        .given (2)
        .returns (false)
        .commit ()
;

