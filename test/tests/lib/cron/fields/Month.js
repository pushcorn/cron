test.object ("cron.fields.Month")
    .should ("be able to parse %{args.0}")
        .given ("*")
        .expectingResultJsonToBe (`
        {
          "expr": "*",
          "items": [
            {
              "field": null,
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
        `)
        .commit ()

    .given ("1-6/1,7/2")
        .expectingResultJsonToBe (`
        {
          "expr": "1-6/1,7/2",
          "items": [
            {
              "field": null,
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
              "field": null,
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
        `)
        .expectingPropertyToBe ("result.values", [1, 2, 3, 4, 5, 6, 7, 9, 11])
        .commit ()

    .given ("Jan,mar,JUN")
        .expectingResultJsonToBe (`
        {
          "expr": "Jan,mar,JUN",
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
        `)
        .expectingPropertyToBe ("result.values", [1, 3, 6])
        .commit ()

    .given ("Jan-may/1,JUN/2")
        .expectingResultJsonToBe (`
        {
          "expr": "Jan-may/1,JUN/2",
          "items": [
            {
              "field": null,
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
              "field": null,
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
        `)
        .expectingPropertyToBe ("result.values", [1, 2, 3, 4, 5, 6, 8, 10, 12])
        .commit ()

    .given ("Jan-mar,JUN/2")
        .expectingResultJsonToBe (`
        {
          "expr": "Jan-mar,JUN/2",
          "items": [
            {
              "field": null,
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
              "field": null,
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
        `)
        .expectingPropertyToBe ("result.values", [1, 2, 3, 6, 8, 10, 12])
        .commit ()

    .given ("jan-feb/12")
        .expectingPropertyToBe ("result.values", [1])
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
        .throws ("error.min_value_greater_than_max_value")
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
        .given (nit.parseDate ("2023-03-05 13:24:35"), 10)
        .returns ()
        .expectingMethodToReturnValue ("args.0.getFullYear", null, 2024)
        .expectingMethodToReturnValue ("args.0.getMonth", null, 0)
        .expectingMethodToReturnValue ("args.0.getDate", null, 1)
        .expectingMethodToReturnValue ("args.0.getHours", null, 0)
        .expectingMethodToReturnValue ("args.0.getMinutes", null, 0)
        .expectingMethodToReturnValue ("args.0.getSeconds", null, 0)
        .expectingMethodToReturnValue ("args.0.getMilliseconds", null, 0)
        .commit ()
;
