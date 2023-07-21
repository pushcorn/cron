test.object ("cron.fields.DayOfMonth")
    .should ("be able to parse %{args.0}")
        .given ("*")
        .expectingResultJsonToBe (`
        {
          "expr": "1-31",
          "items": [
            {
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
