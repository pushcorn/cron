const cron = nit.require ("cron");


test.object ("cron.fields.Hour")
    .should ("be able to parse %{args.0}")
        .given ("*")
        .expectingResultJsonToBe (`
        {
          "expr": "*",
          "items": [
            {
              "expr": "0-23",
              "from": 0,
              "to": 23,
              "values": [
                0,
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
                23
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
              "from": 0,
              "to": 23,
              "hasRange": false,
              "interval": 4
            }
          ]
        }
        `, "items")
        .expectingPropertyToBe ("result.items.0.values", [0, 4, 8, 12, 16, 20])
        .commit ()

    .given ("5-15/5,16/2")
        .expectingResultJsonToBe (`
        {
          "expr": "5-15/5,16/2",
          "items": [
            {
              "expr": "5-15/5",
              "from": 5,
              "to": 15,
              "values": [
                5,
                10,
                15
              ],
              "interval": 5
            },
            {
              "expr": "16-23/2",
              "from": 16,
              "to": 23,
              "values": [
                16,
                18,
                20,
                22
              ],
              "interval": 2
            }
          ]
        }
        `, "items")
        .commit ()
;


test.object ("cron.fields.Hour")
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

    .given ("23-20")
        .throws ("error.from_value_greater_than_to_value")
        .commit ()
;


test.method ("cron.fields.Hour", "getValueForDate")
    .should ("return the date value from a date")
        .given (cron.getDateAsUtc (nit.parseDate ("2023-03-05 13:24:35")))
        .returns (13)
        .commit ()
;


test.method ("cron.fields.Hour", "forward")
    .should ("increment the dates by the given value")
        .given (cron.getDateAsUtc (nit.parseDate ("2023-03-05 13:24:35")), 10)
        .returns ()
        .expectingMethodToReturnValue ("args.0.getUTCFullYear", null, 2023)
        .expectingMethodToReturnValue ("args.0.getUTCMonth", null, 2)
        .expectingMethodToReturnValue ("args.0.getUTCDate", null, 5)
        .expectingMethodToReturnValue ("args.0.getUTCHours", null, 23)
        .expectingMethodToReturnValue ("args.0.getUTCMinutes", null, 0)
        .expectingMethodToReturnValue ("args.0.getUTCSeconds", null, 0)
        .expectingMethodToReturnValue ("args.0.getUTCMilliseconds", null, 0)
        .commit ()
;
