const cron = nit.require ("cron");


test.object ("cron.fields.Month")
    .should ("be able to parse %{args.0}")
        .given ("*")
        .expectingResultJsonToBe (`
        {
          "expr": "*",
          "items": [
            {
              "expr": "1-12",
              "from": 1,
              "to": 12,
              "values": [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10,
                11,
                12
              ],
              "interval": 1
            }
          ]
        }
        `, "items")
        .commit ()

    .given ("H/4")
        .expectingResultJsonToBe (`
        {
          "expr": "H/4",
          "items": [
            {
              "expr": "H/4",
              "from": 1,
              "to": 12,
              "hasRange": false,
              "interval": 4
            }
          ]
        }
        `, "items")
        .expectingPropertyToBe ("result.items.0.values", [4, 8, 12])
        .commit ()

    .given ("1-6/1,7/2")
        .expectingResultJsonToBe (`
        {
          "expr": "1-6/1,7/2",
          "items": [
            {
              "expr": "1-6/1",
              "from": 1,
              "to": 6,
              "values": [
                1,
                2,
                3,
                4,
                5,
                6
              ],
              "interval": 1
            },
            {
              "expr": "7-12/2",
              "from": 7,
              "to": 12,
              "values": [
                7,
                9,
                11
              ],
              "interval": 2
            }
          ]
        }
        `, "items")
        .commit ()

    .given ("Jan,mar,JUN")
        .expectingResultJsonToBe (`
        {
          "expr": "Jan,mar,JUN",
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
              "expr": "6",
              "from": 6,
              "to": 6,
              "values": [
                6
              ],
              "interval": 1
            }
          ]
        }
        `, "items")
        .commit ()

    .given ("Jan-may/1,JUN/2")
        .expectingResultJsonToBe (`
        {
          "expr": "Jan-may/1,JUN/2",
          "items": [
            {
              "expr": "1-5/1",
              "from": 1,
              "to": 5,
              "values": [
                1,
                2,
                3,
                4,
                5
              ],
              "interval": 1
            },
            {
              "expr": "6-12/2",
              "from": 6,
              "to": 12,
              "values": [
                6,
                8,
                10,
                12
              ],
              "interval": 2
            }
          ]
        }
        `, "items")
        .commit ()

    .given ("Jan-mar,JUN/2")
        .expectingResultJsonToBe (`
        {
          "expr": "Jan-mar,JUN/2",
          "items": [
            {
              "expr": "1-3",
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
              "expr": "6-12/2",
              "from": 6,
              "to": 12,
              "values": [
                6,
                8,
                10,
                12
              ],
              "interval": 2
            }
          ]
        }
        `, "items")
        .commit ()

    .given ("jan-feb/12")
        .expectingResultJsonToBe (`
        {
          "expr": "jan-feb/12",
          "items": [
            {
              "expr": "1-2/12",
              "from": 1,
              "to": 2,
              "values": [
                1
              ],
              "interval": 12
            }
          ]
        }
        `, "items")
        .commit ()
;


test.object ("cron.fields.Month")
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

    .given ("7-2")
        .throws ("error.from_value_greater_than_to_value")
        .commit ()

    .given ("jan-feb/13")
        .throws ("error.interval_out_of_range")
        .commit ()

;


test.method ("cron.fields.Month", "getValueForDate")
    .should ("return the date value from a date")
        .given (nit.parseDate ("2023-03-05 13:24:35"))
        .returns (3)
        .commit ()
;


test.method ("cron.fields.Month", "forward")
    .should ("increment the dates by the given value")
        .given (cron.getDateAsUtc (nit.parseDate ("2023-03-05 13:24:35")), 10)
        .returns ()
        .expectingMethodToReturnValue ("args.0.getUTCFullYear", null, 2024)
        .expectingMethodToReturnValue ("args.0.getUTCMonth", null, 0)
        .expectingMethodToReturnValue ("args.0.getUTCDate", null, 1)
        .expectingMethodToReturnValue ("args.0.getUTCHours", null, 0)
        .expectingMethodToReturnValue ("args.0.getUTCMinutes", null, 0)
        .expectingMethodToReturnValue ("args.0.getUTCSeconds", null, 0)
        .expectingMethodToReturnValue ("args.0.getUTCMilliseconds", null, 0)
        .commit ()
;
