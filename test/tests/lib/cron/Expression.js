const TZ_TAIPEI = "Asia/Taipei";
const TZ_INDIANAPOLIS = "America/Indianapolis";


test.object ("cron.Expression.FieldGroup")
    .should ("have an expr getter")
        .given (
            nit.new ("cron.fields.DayOfMonth", 3),
            nit.new ("cron.fields.DayOfWeek", 2)
        )
        .expectingPropertyToBe ("result.expr", "3|2")
        .commit ()
;


test.method ("cron.Expression", "parse", true)
    .should ("throw the day of month is invalid")
        .given ("0 0 31 2 *")
        .throws ("error.invalid_day_of_month")
        .commit ()

    .should ("not throw if there is at least one day of month is valid")
        .given ("0 0 28,31 2 *")
        .returnsInstanceOf ("cron.Expression")
        .commit ()

    .should ("accept macro syntax")
        .given ("@hourly")
        .returnsInstanceOf ("cron.Expression")
        .expectingPropertyToBe ("result.second.expr", "0")
        .expectingPropertyToBe ("result.minute.expr", "0")
        .expectingPropertyToBe ("result.hour.expr", "*")
        .expectingPropertyToBe ("result.month.expr", "*")
        .expectingPropertyToBe ("result.dayOfMonth.expr", "*")
        .expectingPropertyToBe ("result.dayOfWeek.expr", "*")
        .commit ()

    .given ("0 0 31 2,3 *")
        .returnsInstanceOf ("cron.Expression")
        .commit ()

    .should ("parse the expression and return an instance of Expression")
        .given ("*/10 9-17 * * 1-5", TZ_TAIPEI)
        .returnsInstanceOf ("cron.Expression")
        .expectingResultJsonToBe (`
        {
          "second": {
            "expr": "0",
            "items": [
              {
                "field": null,
                "expr": "0",
                "from": 0,
                "to": 0,
                "values": [
                  0
                ],
                "interval": 1
              }
            ]
          },
          "minute": {
            "expr": "*/10",
            "items": [
              {
                "field": null,
                "expr": "0-59/10",
                "from": 0,
                "to": 59,
                "values": [
                  0,
                  10,
                  20,
                  30,
                  40,
                  50
                ],
                "interval": 10
              }
            ]
          },
          "hour": {
            "expr": "9-17",
            "items": [
              {
                "field": null,
                "expr": "9-17",
                "from": 9,
                "to": 17,
                "values": [
                  9,
                  10,
                  11,
                  12,
                  13,
                  14,
                  15,
                  16,
                  17
                ],
                "interval": 1
              }
            ]
          },
          "dayOfMonth": {
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
          },
          "month": {
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
          },
          "dayOfWeek": {
            "expr": "1-5",
            "items": [
              {
                "field": null,
                "expr": "1-5",
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
              }
            ]
          },
          "timezone": "Asia/Taipei"
        }
        `)
        .commit ()
;


test.method ("cron.Expression", "next")
    .should ("throw if next occurrence cannot be found")
        .up (s => s.class = s.class.defineSubclass ("Expression", true).constant ("MAX_SEARCH_ITERATIONS", 10))
        .before (s => s.object.getValuesForDate = () => [Math.random ()])
        .throws ("error.unresolvable_expression")
        .commit ()

    .should ("return the next run time")
        .up (s => s.createArgs =
        {
            minute: "*/10",
            hour: "13-14",
            dayOfMonth: "*",
            month: "*",
            dayOfWeek: "1-5"
        })
        .given (nit.parseDate ("2023-09-01 14:50:00"))
        .returns (new nit.Date ("2023-09-04 13:00:00"))
        .commit ()

    .reset ()
        .up (s => s.createArgs =
        {
            minute: "*/10",
            hour: "9-17",
            dayOfMonth: "*",
            month: "*",
            dayOfWeek: "1-5",
            timezone: TZ_TAIPEI
        })
        .given (new nit.Date ("2023-09-01 18:50:00", TZ_TAIPEI))
        .returns (new nit.Date ("2023-09-04 09:00:00", TZ_TAIPEI))
        .commit ()

    .reset ()
        .given (new nit.Date ("2024-01-01"))
        .after (s => s.next = s.object.next (s.result))
        .returns (new nit.Date ("2024-01-07"))
        .expectingPropertyToBe ("next", new nit.Date ("2024-01-14"))
        .commit ()

    .should ("use the last given date if no value was provided")
        .up (s => s.createArgs =
        {
            minute: "0",
            hour: "0",
            dayOfMonth: "1,15",
            month: "*",
            dayOfWeek: "Sun"
        })
        .given (nit.Date ("2023-01-01 01:01:01"))
        .returns (nit.Date ("2023-01-08"))
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-01-15"))
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-01-22"))
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-01-29"))
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-02-01"))
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-02-05"))
        .commit ()

    .reset ()
        .up (s => s.createArgs =
        {
            minute: "0",
            hour: "0",
            dayOfMonth: "*",
            month: "*",
            dayOfWeek: "Sun"
        })
        .given (nit.Date ("2023-02-15 01:01:01"))
        .returns (nit.Date ("2023-02-19"))
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-02-26"))
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-05"))
        .commit ()

    .reset ()
        .up (s => s.createArgs =
        {
            minute: "0",
            hour: "0",
            dayOfMonth: "1,15",
            month: "*",
            dayOfWeek: "*"
        })
        .given (nit.Date ("2023-01-01 01:01:01"))
        .returns (nit.Date ("2023-01-15"))
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-02-01"))
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-02-15"))
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-01"))
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-15"))
        .commit ()

    .reset ()
        .up (s => s.createArgs =
        {
            minute: "0",
            hour: "0",
            dayOfMonth: "1,15",
            month: "*",
            dayOfWeek: "*",
            timezone: TZ_TAIPEI
        })
        .given (nit.Date ("2023-01-01 01:01:01", TZ_TAIPEI))
        .returns (nit.Date ("2023-01-15", TZ_TAIPEI))
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-02-01", TZ_TAIPEI))
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-02-15", TZ_TAIPEI))
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-01", TZ_TAIPEI))
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-15", TZ_TAIPEI))
        .commit ()

    .should ("accept an integer timestamp")
        .given (nit.Date ("2024-01-01").getTime ())
        .returns (nit.Date ("2024-01-07"))
        .commit ()

    .should ("accept a timestamp string")
        .given ("2024-01-01")
        .returns (nit.Date ("2024-01-07"))
        .commit ()

    .should ("accept a timestamp string")
        .given ("2024-01-01")
        .returns (nit.Date ("2024-01-07"))
        .commit ()

    .should ("be able to handle a different timezone")
        .up (s => s.createArgs =
        {
            minute: "*/10",
            hour: "9-17",
            dayOfMonth: "*",
            month: "*",
            dayOfWeek: "*",
            timezone: TZ_TAIPEI
        })
        .given (nit.Date ("2023-09-06 22:02:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2023-09-07 10:10:00", TZ_TAIPEI))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "8 minutes")
        .commit ()

    .reset ()
        .up (s => s.createArgs =
        {
            minute: "0",
            hour: "0-3",
            dayOfMonth: "*",
            month: "*",
            dayOfWeek: "*",
            timezone: TZ_INDIANAPOLIS
        })
        .given (nit.Date ("2023-03-11 23:02:00", TZ_TAIPEI))
        .returns (nit.Date ("2023-03-12 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "13 hours and 58 minutes")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-12 01:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "1 hour")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-12 03:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "1 hour")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-13 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "21 hours")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-13 01:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "1 hour")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-13 02:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "1 hour")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-13 03:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "1 hour")
        .commit ()

    .should ("handle the starting of DST")
        .up (s => s.createArgs =
        {
            minute: "0",
            hour: "2",
            dayOfMonth: "*",
            month: "*",
            dayOfWeek: "*",
            timezone: TZ_INDIANAPOLIS
        })
        .given (nit.Date ("2023-03-12 00:00:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2023-03-12 03:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "2 hours")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-13 02:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "23 hours")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-14 02:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "1 day")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-15 02:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "1 day")
        .commit ()

    .should ("handle the starting of DST")
        .up (s => s.createArgs =
        {
            minute: "0",
            hour: "0-3",
            dayOfMonth: "*",
            month: "*",
            dayOfWeek: "*",
            timezone: TZ_INDIANAPOLIS
        })
        .given (nit.Date ("2023-03-12 00:00:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2023-03-12 01:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "1 hour")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-12 03:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "1 hour")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-13 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "21 hours")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-13 01:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "1 hour")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-13 02:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "1 hour")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-13 03:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "1 hour")
        .commit ()

    .should ("handle the ending of DST")
        .up (s => s.createArgs =
        {
            minute: "0",
            hour: "1",
            dayOfMonth: "*",
            month: "*",
            dayOfWeek: "*",
            timezone: TZ_INDIANAPOLIS
        })
        .given (nit.Date ("2023-11-05 00:00:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2023-11-05 01:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "1 hour")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-11-06 01:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "1 day and 1 hour")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-11-07 01:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "1 day")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-11-08 01:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "1 day")
        .commit ()

    .should ("handle the ending of DST")
        .up (s => s.createArgs =
        {
            minute: "0",
            hour: "0-3",
            dayOfMonth: "*",
            month: "*",
            dayOfWeek: "*",
            timezone: TZ_INDIANAPOLIS
        })
        .given (nit.Date ("2023-11-05 00:00:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2023-11-05 01:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "1 hour")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-11-05 02:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "2 hours")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-11-05 03:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "1 hour")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-11-06 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "21 hours")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-11-06 01:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "1 hour")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-11-06 02:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "1 hour")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-11-06 03:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "1 hour")
        .commit ()

    .should ("handle last day of week syntax")
        .up (s => s.createArgs =
        {
            minute: "0",
            hour: "0",
            dayOfMonth: "*",
            month: "*",
            dayOfWeek: "3L",
            timezone: TZ_INDIANAPOLIS
        })
        .given (nit.Date ("2023-11-05 00:00:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2023-11-29 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "3 weeks, 3 days and 1 hour")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-12-27 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "4 weeks")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-01-31 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "1 month and 5 days")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-02-28 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "4 weeks")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-03-27 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "3 weeks, 6 days and 23 hours")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-04-24 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "4 weeks")
        .commit ()

    .should ("handle last day of week and range syntax")
        .up (s => s.createArgs =
        {
            minute: "0",
            hour: "0",
            dayOfMonth: "*",
            month: "*",
            dayOfWeek: "1,2,WedL",
            timezone: TZ_INDIANAPOLIS
        })
        .given (nit.Date ("2023-11-20 00:00:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2023-11-21 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "1 day")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-11-27 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "6 days")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-11-28 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "1 day")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-11-29 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "1 day")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-12-04 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "5 days")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-12-05 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "1 day")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-12-11 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "6 days")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-12-12 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "1 day")
        .commit ()

    .should ("handle last day of month syntax")
        .up (s => s.createArgs =
        {
            minute: "0",
            hour: "0",
            dayOfMonth: "L-5",
            month: "*",
            dayOfWeek: "*",
            timezone: TZ_INDIANAPOLIS
        })
        .given (nit.Date ("2023-11-20 00:00:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2023-11-25 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "5 days")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-12-26 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "1 month and 1 day")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-01-26 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "1 month and 1 day")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-02-24 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "4 weeks and 1 day")
        .commit ()

    .should ("handle last day of month syntax")
        .up (s => s.createArgs =
        {
            minute: "0",
            hour: "0",
            dayOfMonth: "L-30",
            month: "*",
            dayOfWeek: "*",
            timezone: TZ_INDIANAPOLIS
        })
        .given (nit.Date ("2023-11-20 00:00:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2023-12-01 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "1 week and 4 days")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-01-01 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "1 month and 1 day")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-03-01 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "2 months")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-05-01 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "2 months and 23 hours")
        .commit ()
;


test.method ("cron.Expression", "next")
    .should ("handle day of month's weekday syntax")
        .up (s => s.createArgs =
        {
            minute: "0",
            hour: "0",
            dayOfMonth: "LW",
            month: "*",
            dayOfWeek: "*",
            timezone: TZ_INDIANAPOLIS
        })
        .given (nit.Date ("2024-02-02 00:00:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2024-02-29 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "3 weeks and 6 days")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-03-29 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "4 weeks and 23 hours")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-04-30 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "1 month and 2 days")
        .commit ()

    .reset ()
        .up (s => s.createArgs =
        {
            minute: "0",
            hour: "0",
            dayOfMonth: "LW",
            month: "*",
            dayOfWeek: "*",
            timezone: TZ_INDIANAPOLIS
        })
        .given (nit.Date ("2024-03-02 00:00:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2024-03-29 00:00:00", TZ_INDIANAPOLIS))
        .commit ()

    .reset ()
        .up (s => s.createArgs =
        {
            minute: "0",
            hour: "0",
            dayOfMonth: "3W",
            month: "*",
            dayOfWeek: "*",
            timezone: TZ_INDIANAPOLIS
        })
        .given (nit.Date ("2024-03-06 00:00:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2024-04-03 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "3 weeks, 6 days and 23 hours")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-05-03 00:00:00", TZ_INDIANAPOLIS))
        .commit ()

    .reset ()
        .up (s => s.createArgs =
        {
            minute: "0",
            hour: "0",
            dayOfMonth: "2W",
            month: "*",
            dayOfWeek: "*",
            timezone: TZ_INDIANAPOLIS
        })
        .given (nit.Date ("2024-03-06 00:00:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2024-04-02 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "3 weeks, 5 days and 23 hours")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-05-02 00:00:00", TZ_INDIANAPOLIS))
        .commit ()

    .reset ()
        .up (s => s.createArgs =
        {
            minute: "0",
            hour: "0",
            dayOfMonth: "1W",
            month: "*",
            dayOfWeek: "*",
            timezone: TZ_INDIANAPOLIS
        })
        .given (nit.Date ("2024-06-06 00:00:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2024-07-01 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "3 weeks and 4 days")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-08-01 00:00:00", TZ_INDIANAPOLIS))
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-09-02 00:00:00", TZ_INDIANAPOLIS))
        .commit ()
;


test.method ("cron.Expression", "next")
    .should ("handle day of week's n-th day of week syntax")
        .up (s => s.createArgs =
        {
            minute: "0",
            hour: "0",
            dayOfMonth: "*",
            month: "*",
            dayOfWeek: "1#5",
            timezone: TZ_INDIANAPOLIS
        })
        .given (nit.Date ("2024-08-07 00:00:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2024-09-30 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "1 month, 3 weeks and 3 days")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-12-30 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "3 months, 1 day and 1 hour")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2025-03-31 00:00:00", TZ_INDIANAPOLIS))
        .commit ()

    .reset ()
        .up (s => s.createArgs =
        {
            minute: "0",
            hour: "0",
            dayOfMonth: "*",
            month: "*",
            dayOfWeek: "6#5",
            timezone: TZ_INDIANAPOLIS
        })
        .given (nit.Date ("2024-08-07 00:00:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2024-08-31 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "3 weeks and 3 days")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-11-30 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "3 months, 1 day and 1 hour")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2025-03-29 00:00:00", TZ_INDIANAPOLIS))
        .commit ()

    .reset ()
        .up (s => s.createArgs =
        {
            minute: "0",
            hour: "0",
            dayOfMonth: "*",
            month: "*",
            dayOfWeek: "6#5",
            timezone: TZ_INDIANAPOLIS
        })
        .given (nit.Date ("2025-03-01 00:00:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2025-03-29 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("Humanize.duration (object.nextTimeout)", "3 weeks, 6 days and 23 hours")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2025-05-31 00:00:00", TZ_INDIANAPOLIS))
        .commit ()
;
