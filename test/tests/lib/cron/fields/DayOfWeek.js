const cron = nit.require ("cron");


test.object ("cron.fields.DayOfWeek")
    .should ("be able to parse %{args.0}")
        .given ("*")
        .expectingResultJsonToBe (`
        {
          "expr": "*",
          "items": [
            {
              "expr": "0-6",
              "from": 0,
              "to": 6,
              "values": [
                0,
                1,
                2,
                3,
                4,
                5,
                6
              ],
              "interval": 1
            }
          ]
        }
        `, "items")
        .commit ()

    .given ("H/2")
        .expectingResultJsonToBe (`
        {
          "expr": "H/2",
          "items": [
            {
              "expr": "H/2",
              "from": 0,
              "to": 6,
              "hasRange": false,
              "interval": 2
            }
          ]
        }
        `, "items")
        .expectingPropertyToBe ("result.items.0.values", [0, 2, 4, 6])
        .commit ()

    .given ("1-3/5,4/4,5-7")
        .expectingResultJsonToBe (`
        {
          "expr": "1-3/5,4/4,5-7",
          "items": [
            {
              "expr": "1-3/5",
              "from": 1,
              "to": 3,
              "values": [
                1
              ],
              "interval": 5
            },
            {
              "expr": "4-6/4",
              "from": 4,
              "to": 6,
              "values": [
                4
              ],
              "interval": 4
            },
            {
              "expr": "5-0",
              "from": 5,
              "to": 0,
              "values": [
                5,
                6,
                0
              ],
              "interval": 1
            }
          ]
        }
        `, "items")
        .commit ()

    .given ("mon,wed,fri-sun")
        .expectingResultJsonToBe (`
        {
          "expr": "mon,wed,fri-sun",
          "items": [
            {
              "expr": "1",
              "from": 1,
              "to": 1,
              "values": [
                1
              ],
              "interval": 1
            },
            {
              "expr": "3",
              "from": 3,
              "to": 3,
              "values": [
                3
              ],
              "interval": 1
            },
            {
              "expr": "5-0",
              "from": 5,
              "to": 0,
              "values": [
                5,
                6,
                0
              ],
              "interval": 1
            }
          ]
        }
        `, "items")
        .commit ()

    .given ("mon-Wed/1,Thu/2")
        .expectingResultJsonToBe (`
        {
          "expr": "mon-Wed/1,Thu/2",
          "items": [
            {
              "expr": "1-3/1",
              "from": 1,
              "to": 3,
              "values": [
                1,
                2,
                3
              ],
              "interval": 1
            },
            {
              "expr": "4-6/2",
              "from": 4,
              "to": 6,
              "values": [
                4,
                6
              ],
              "interval": 2
            }
          ]
        }
        `, "items")
        .commit ()

    .given ("sun-wed,fri/2,tue-thu")
        .expectingResultJsonToBe (`
        {
          "expr": "sun-wed,fri/2,tue-thu",
          "items": [
            {
              "expr": "0-3",
              "from": 0,
              "to": 3,
              "values": [
                0,
                1,
                2,
                3
              ],
              "interval": 1
            },
            {
              "expr": "5-6/2",
              "from": 5,
              "to": 6,
              "values": [
                5
              ],
              "interval": 2
            },
            {
              "expr": "2-4",
              "from": 2,
              "to": 4,
              "values": [
                2,
                3,
                4
              ],
              "interval": 1
            }
          ]
        }
        `, "items")
        .commit ()
;


test.object ("cron.fields.DayOfWeek")
    .should ("throw value %{result} if the expression is %{args.0}")
        .given ("ab")
        .given ("**")
        .given ("/")
        .given ("2/3#")
        .given ("5-")
        .given ("mon-fri/10")
        .throws ("error.invalid_expr")
        .commit ()

    .given ("100")
        .throws ("error.greater_than_max_value")
        .commit ()

    .given ("6-2")
        .throws ("error.from_value_greater_than_to_value")
        .commit ()
;


test.method ("cron.fields.DayOfWeek", "getValueForDate")
    .should ("return the week day value from a date")
        .given (cron.getDateAsUtc (nit.parseDate ("2023-03-05", "America/Indianapolis")))
        .returns (0)
        .commit ()
;


test.method ("cron.fields.DayOfWeek", "forward")
    .should ("increment the dates by the given value")
        .given (cron.getDateAsUtc (nit.parseDate ("2023-03-05 13:24:35")), 10)
        .returns ()
        .expectingMethodToReturnValue ("args.0.getUTCFullYear", null, 2023)
        .expectingMethodToReturnValue ("args.0.getUTCMonth", null, 2)
        .expectingMethodToReturnValue ("args.0.getUTCDate", null, 15)
        .expectingMethodToReturnValue ("args.0.getUTCHours", null, 0)
        .expectingMethodToReturnValue ("args.0.getUTCMinutes", null, 0)
        .expectingMethodToReturnValue ("args.0.getUTCSeconds", null, 0)
        .expectingMethodToReturnValue ("args.0.getUTCMilliseconds", null, 0)
        .commit ()
;
