test.object ("cron.fields.DayOfMonth")
    .should ("be able to parse %{args.0}")
        .given ("*")
        .expectingResultJsonToBe (`
        {
          "expr": "*",
          "items": [
            {
              "field": null,
              "expr": "1-31",
              "from": 1,
              "to": 31,
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
                12,
                13,
                14,
                15,
                16,
                17,
                18,
                19,
                20,
                21,
                22,
                23,
                24,
                25,
                26,
                27,
                28,
                29,
                30,
                31
              ],
              "interval": 1
            }
          ]
        }
        `)
        .commit ()

    .given ("1-20/5,21/4")
        .expectingResultJsonToBe (`
        {
          "expr": "1-20/5,21/4",
          "items": [
            {
              "field": null,
              "expr": "1-20/5",
              "from": 1,
              "to": 20,
              "values": [
                1,
                6,
                11,
                16
              ],
              "interval": 5
            },
            {
              "field": null,
              "expr": "21-31/4",
              "from": 21,
              "to": 31,
              "values": [
                21,
                25,
                29
              ],
              "interval": 4
            }
          ]
        }
        `)
        .expectingPropertyToBe ("result.values", [1, 6, 11, 16, 21, 25, 29])
        .commit ()
;


test.object ("cron.fields.DayOfMonth")
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

    .given ("31-2")
        .throws ("error.min_value_greater_than_max_value")
        .commit ()
;


test.method ("cron.fields.DayOfMonth", "getValueForDate")
    .should ("return the date value from a date")
        .given (nit.parseDate ("2023-03-05"))
        .returns (5)
        .commit ()

    .should ("use today's date if no date was given")
        .given ()
        .returns (new Date ().getDate ())
        .commit ()
;


test.method ("cron.fields.DayOfMonth", "forward")
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

    .should ("increment the one day if no value was given")
        .given (nit.parseDate ("2023-03-05 13:24:35"))
        .returns ()
        .expectingMethodToReturnValue ("args.0.getFullYear", null, 2023)
        .expectingMethodToReturnValue ("args.0.getMonth", null, 2)
        .expectingMethodToReturnValue ("args.0.getDate", null, 6)
        .expectingMethodToReturnValue ("args.0.getHours", null, 0)
        .expectingMethodToReturnValue ("args.0.getMinutes", null, 0)
        .expectingMethodToReturnValue ("args.0.getSeconds", null, 0)
        .expectingMethodToReturnValue ("args.0.getMilliseconds", null, 0)
        .commit ()
;
