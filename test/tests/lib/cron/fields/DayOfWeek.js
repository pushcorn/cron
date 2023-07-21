test.object ("cron.fields.DayOfWeek")
    .should ("be able to parse %{args.0}")
        .given ("*")
        .expectingResultJsonToBe (`
        {
          "expr": "0-6",
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
        `)
        .commit ()

    .given ("1-3/5,4/4")
        .expectingResultJsonToBe (`
        {
          "expr": "1-3/5,4/4",
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
        `)
        .expectingPropertyToBe ("result.values", [1, 2, 3, 4, 6])
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
