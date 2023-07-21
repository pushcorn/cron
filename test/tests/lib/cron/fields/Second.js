test.object ("cron.fields.Second")
    .should ("be able to parse %{args.0}")
        .given ("*")
        .expectingResultJsonToBe (`
        {
          "expr": "0-59",
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
        `)
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
        `)
        .expectingPropertyToBe ("result.values", [10, 15, 20, 25, 30, 35, 39, 43, 47, 51, 55, 59])
        .commit ()
;


test.object ("cron.fields.Second")
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
