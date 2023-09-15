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
        .after (s => s.result.field.entry = nit.new ("cron.Entry", "@hourly", "", "test-command"))
        .expectingResultJsonToBe (`
        {
          "expr": "H",
          "from": 1,
          "to": 28,
          "hasRange": false,
          "interval": 1
        }
        `)
        .expectingPropertyToBe ("result.values", [9])
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
;
