test.object ("cron.fields.DayOfWeek")
    .should ("be able to parse %{args.0}")
        .given ("*")
        .expectingResultJsonToBe (`
        {
          "expr": "*",
          "items": [
            {
              "field": null,
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
        `)
        .commit ()

    .given ("1-3/5,4/4")
        .expectingResultJsonToBe (`
        {
          "expr": "1-3/5,4/4",
          "items": [
            {
              "field": null,
              "expr": "1-3/5",
              "from": 1,
              "to": 3,
              "values": [
                1
              ],
              "interval": 5
            },
            {
              "field": null,
              "expr": "4-6/4",
              "from": 4,
              "to": 6,
              "values": [
                4
              ],
              "interval": 4
            }
          ]
        }
        `)
        .expectingPropertyToBe ("result.values", [1, 4])
        .commit ()

    .given ("mon,wed,fri")
        .expectingResultJsonToBe (`
        {
          "expr": "mon,wed,fri",
          "items": [
            {
              "field": null,
              "expr": "1",
              "from": 1,
              "to": 1,
              "values": [
                1
              ],
              "interval": 1
            },
            {
              "field": null,
              "expr": "3",
              "from": 3,
              "to": 3,
              "values": [
                3
              ],
              "interval": 1
            },
            {
              "field": null,
              "expr": "5",
              "from": 5,
              "to": 5,
              "values": [
                5
              ],
              "interval": 1
            }
          ]
        }
        `)
        .expectingPropertyToBe ("result.values", [1, 3, 5])
        .commit ()

    .given ("mon-Wed/1,Thu/2")
        .expectingResultJsonToBe (`
        {
          "expr": "mon-Wed/1,Thu/2",
          "items": [
            {
              "field": null,
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
              "field": null,
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
        `)
        .expectingPropertyToBe ("result.values", [1, 2, 3, 4, 6])
        .commit ()

    .given ("sun-wed,fri/2,tue-thu")
        .expectingResultJsonToBe (`
        {
          "expr": "sun-wed,fri/2,tue-thu",
          "items": [
            {
              "field": null,
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
              "field": null,
              "expr": "5-6/2",
              "from": 5,
              "to": 6,
              "values": [
                5
              ],
              "interval": 2
            },
            {
              "field": null,
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
        `)
        .expectingPropertyToBe ("result.values", [0, 1, 2, 3, 4, 5])
        .commit ()
;


test.object ("cron.fields.DayOfWeek")
    .should ("throw value %{result} if the expression is %{args.0}")
        .given ("ab")
        .given ("**")
        .given ("/")
        .given ("2/3#")
        .given ("5-")
        .throws ("error.invalid_expr")
        .commit ()

    .given ("100")
        .throws ("error.greater_than_max_value")
        .commit ()

    .given ("6-2")
        .throws ("error.min_value_greater_than_max_value")
        .commit ()

    .given ("mon-fri/10")
        .throws ("error.interval_out_of_range")
        .commit ()
;


test.method ("cron.fields.DayOfWeek", "getValueForDate")
    .should ("return the week day value from a date")
        .given (nit.parseDate ("2023-03-05"))
        .returns (0)
        .commit ()
;


test.method ("cron.fields.DayOfWeek", "forward")
    .should ("increment the dates by the given value")
        .given (nit.parseDate ("2023-03-05 13:24:35"), 10)
        .returns ()
        .expectingMethodToReturnValue ("args.0.getFullYear", null, 2023)
        .expectingMethodToReturnValue ("args.0.getMonth", null, 2)
        .expectingMethodToReturnValue ("args.0.getDate", null, 15)
        .expectingMethodToReturnValue ("args.0.getHours", null, 0)
        .expectingMethodToReturnValue ("args.0.getMinutes", null, 0)
        .expectingMethodToReturnValue ("args.0.getSeconds", null, 0)
        .expectingMethodToReturnValue ("args.0.getMilliseconds", null, 0)
        .commit ()
;
