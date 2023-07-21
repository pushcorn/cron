test.object ("cron.fields.Hour")
    .should ("be able to parse %{args.0}")
        .given ("*")
        .expectingResultJsonToBe (`
        {
          "expr": "0-23",
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
        `)
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
        `)
        .expectingPropertyToBe ("result.values", [5, 10, 15, 16, 18, 20, 22])
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
        .throws ("error.min_value_greater_than_max_value")
        .commit ()
;
