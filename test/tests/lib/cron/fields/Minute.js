const cron = nit.require ("cron");


test.object ("cron.fields.Minute")
    .should ("be able to parse %{args.0}")
        .given ("*")
        .expectingResultJsonToBe (`
        {
          "expr": "*",
          "items": [
            {
              "expr": "0-59",
              "from": 0,
              "to": 59,
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
                23,
                24,
                25,
                26,
                27,
                28,
                29,
                30,
                31,
                32,
                33,
                34,
                35,
                36,
                37,
                38,
                39,
                40,
                41,
                42,
                43,
                44,
                45,
                46,
                47,
                48,
                49,
                50,
                51,
                52,
                53,
                54,
                55,
                56,
                57,
                58,
                59
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
              "to": 59,
              "hasRange": false,
              "interval": 4
            }
          ]
        }
        `, "items")
        .expectingPropertyToBe ("result.items.0.values", [3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59])
        .commit ()

    .given ("10-30/5,35/4")
        .expectingResultJsonToBe (`
        {
          "expr": "10-30/5,35/4",
          "items": [
            {
              "expr": "10-30/5",
              "from": 10,
              "to": 30,
              "values": [
                10,
                15,
                20,
                25,
                30
              ],
              "interval": 5
            },
            {
              "expr": "35-59/4",
              "from": 35,
              "to": 59,
              "values": [
                35,
                39,
                43,
                47,
                51,
                55,
                59
              ],
              "interval": 4
            }
          ]
        }
        `, "items")
        .commit ()

    .given ("*/5")
        .expectingResultJsonToBe (`
        {
          "expr": "*/5",
          "items": [
            {
              "expr": "0-59/5",
              "from": 0,
              "to": 59,
              "values": [
                0,
                5,
                10,
                15,
                20,
                25,
                30,
                35,
                40,
                45,
                50,
                55
              ],
              "interval": 5
            }
          ]
        }
        `, "items")
        .commit ()
;


test.object ("cron.fields.Minute")
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

    .given ("50-20")
        .throws ("error.min_value_greater_than_max_value")
        .commit ()
;


test.method ("cron.fields.Minute", "getValueForDate")
    .should ("return the date value from a date")
        .given (nit.parseDate ("2023-03-05 13:24:35"))
        .returns (24)
        .commit ()
;


test.method ("cron.fields.Minute", "forward")
    .should ("increment the dates by the given value")
        .given (cron.getDateAsUtc (nit.parseDate ("2023-03-05 13:24:35")), 10)
        .returns ()
        .expectingMethodToReturnValue ("args.0.getUTCFullYear", null, 2023)
        .expectingMethodToReturnValue ("args.0.getUTCMonth", null, 2)
        .expectingMethodToReturnValue ("args.0.getUTCDate", null, 5)
        .expectingMethodToReturnValue ("args.0.getUTCHours", null, 13)
        .expectingMethodToReturnValue ("args.0.getUTCMinutes", null, 34)
        .expectingMethodToReturnValue ("args.0.getUTCSeconds", null, 0)
        .expectingMethodToReturnValue ("args.0.getUTCMilliseconds", null, 0)
        .commit ()
;
