const TZ_TAIPEI = "Asia/Taipei";
const TZ_INDIANAPOLIS = "America/Indianapolis";


test.object ("cron.Job.FieldGroup")
    .should ("have an expr getter")
        .given (
            nit.new ("cron.fields.DayOfMonth", 3),
            nit.new ("cron.fields.DayOfWeek", 2)
        )
        .expectingPropertyToBe ("result.expr", "3|2")
        .commit ()
;


test.object ("cron.Job")
    .should ("throw the day of month is invalid")
        .given (0, "0 0 31 2 *", "test")
        .throws ("error.invalid_day_of_month")
        .commit ()

    .should ("not throw if there is at least one day of month is valid")
        .given (0, "0 0 28,31 2 *", "test")
        .returnsInstanceOf ("cron.Job")
        .commit ()

    .should ("accept macro syntax")
        .given (0, "@hourly", "test")
        .returnsInstanceOf ("cron.Job")
        .expectingPropertyToBe ("result.second.expr", "0")
        .expectingPropertyToBe ("result.minute.expr", "0")
        .expectingPropertyToBe ("result.hour.expr", "*")
        .expectingPropertyToBe ("result.month.expr", "*")
        .expectingPropertyToBe ("result.dayOfMonth.expr", "*")
        .expectingPropertyToBe ("result.dayOfWeek.expr", "*")
        .commit ()

    .given (0, "0 0 31 2,3 *", "test")
        .returnsInstanceOf ("cron.Job")
        .commit ()

    .should ("parse the expression and return an instance of Job")
        .given (0, "*/10 9-17 * * 1-5", "test", TZ_TAIPEI)
        .returnsInstanceOf ("cron.Job")
        .expectingPropertyToBe ("result.second.expr", "0")
        .expectingPropertyToBe ("result.minute.expr", "*/10")
        .expectingPropertyToBe ("result.hour.expr", "9-17")
        .expectingPropertyToBe ("result.month.expr", "*")
        .expectingPropertyToBe ("result.dayOfMonth.expr", "*")
        .expectingPropertyToBe ("result.dayOfWeek.expr", "1-5")
        .expectingPropertyToBe ("result.timezone", TZ_TAIPEI)
        .commit ()
;


test.method ("cron.Job", "next")
    .should ("throw if next occurrence cannot be found")
        .up (s => s.class = s.class.defineSubclass ("Job", true).constant ("MAX_SEARCH_ITERATIONS", 10))
        .up (s => s.createArgs = [0, "0 0 1 1 0", "test"])
        .before (s => s.object.getValuesForDate = () => [Math.random ()])
        .throws ("error.unresolvable_expression")
        .commit ()

    .should ("return the next run time")
        .up (s => s.createArgs = [0, "*/10 13-14 * * 1-5", "test"])
        .given (nit.parseDate ("2023-09-01 14:50:00"))
        .returns (new nit.Date ("2023-09-04 13:00:00"))
        .commit ()

    .reset ()
        .up (s => s.createArgs = [0, "*/10 9-17 * * 1-5", "test", TZ_TAIPEI])
        .given (new nit.Date ("2023-09-01 18:50:00", TZ_TAIPEI))
        .returns (new nit.Date ("2023-09-04 09:00:00", TZ_TAIPEI))
        .commit ()

    .reset ()
        .up (s => s.createArgs = [0, "0 0 1 1 0", "test"])
        .given (new nit.Date ("2024-01-01"))
        .after (s => s.next = s.object.next (s.result))
        .returns (new nit.Date ("2024-01-07"))
        .expectingPropertyToBe ("next", new nit.Date ("2024-01-14"))
        .commit ()

    .should ("use the last given date if no value was provided")
        .up (s => s.createArgs = [0, "0 0 1,15 * Sun", "test"])
        .given (nit.Date ("2023-01-01 01:01:01"))
        .returns (nit.Date ("2023-01-08"))
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-01-15"))
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-01-22"))
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-01-29"))
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-02-01"))
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-02-05"))
        .commit ()

    .reset ()
        .up (s => s.createArgs = [0, "0 0 * * Sun", "test"])
        .given (nit.Date ("2023-02-15 01:01:01"))
        .returns (nit.Date ("2023-02-19"))
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-02-26"))
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-05"))
        .commit ()

    .reset ()
        .up (s => s.createArgs = [0, "0 0 1,15 * *", "test"])
        .given (nit.Date ("2023-01-01 01:01:01"))
        .returns (nit.Date ("2023-01-15"))
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-02-01"))
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-02-15"))
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-01"))
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-15"))
        .commit ()

    .reset ()
        .up (s => s.createArgs = [0, "0 0 1,15 * *", "test", TZ_TAIPEI])
        .given (nit.Date ("2023-01-01 01:01:01", TZ_TAIPEI))
        .returns (nit.Date ("2023-01-15", TZ_TAIPEI))
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-02-01", TZ_TAIPEI))
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-02-15", TZ_TAIPEI))
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-01", TZ_TAIPEI))
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-15", TZ_TAIPEI))
        .commit ()

    .should ("accept an integer timestamp")
        .up (s => s.createArgs = [0, "0 0 1 1 0", "test"])
        .given (nit.Date ("2024-01-01").getTime ())
        .returns (nit.Date ("2024-01-07"))
        .commit ()

    .should ("accept a timestamp string")
        .up (s => s.createArgs = [0, "0 0 1 1 0", "test"])
        .given ("2024-01-01")
        .returns (nit.Date ("2024-01-07"))
        .commit ()

    .should ("accept a timestamp string")
        .up (s => s.createArgs = [0, "0 0 1 1 0", "test"])
        .given ("2024-01-01")
        .returns (nit.Date ("2024-01-07"))
        .commit ()

    .should ("be able to handle a different timezone")
        .up (s => s.createArgs = [0, "*/10 9-17 * * *", "test", TZ_TAIPEI])
        .given (nit.Date ("2023-09-06 22:02:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2023-09-07 10:10:00", TZ_TAIPEI))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "8 minutes")
        .commit ()

    .reset ()
        .up (s => s.createArgs = [0, "0 0-3 * * *", "test", TZ_INDIANAPOLIS])
        .given (nit.Date ("2023-03-11 23:02:00", TZ_TAIPEI))
        .returns (nit.Date ("2023-03-12 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "13 hours and 58 minutes")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-12 01:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "1 hour")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-12 03:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "1 hour")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-13 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "21 hours")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-13 01:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "1 hour")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-13 02:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "1 hour")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-13 03:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "1 hour")
        .commit ()

    .should ("handle the starting of DST")
        .up (s => s.createArgs = [0, "0 2 * * *", "teset", TZ_INDIANAPOLIS])
        .given (nit.Date ("2023-03-12 00:00:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2023-03-12 03:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "2 hours")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-13 02:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "23 hours")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-14 02:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "1 day")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-15 02:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "1 day")
        .commit ()

    .should ("handle the starting of DST")
        .up (s => s.createArgs = [0, "0 0-3 * * *", "test", TZ_INDIANAPOLIS])
        .given (nit.Date ("2023-03-12 00:00:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2023-03-12 01:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "1 hour")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-12 03:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "1 hour")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-13 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "21 hours")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-13 01:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "1 hour")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-13 02:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "1 hour")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-03-13 03:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "1 hour")
        .commit ()

    .should ("handle the ending of DST")
        .up (s => s.createArgs = [0, "0 1 * * *", "test", TZ_INDIANAPOLIS])
        .given (nit.Date ("2023-11-05 00:00:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2023-11-05 01:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "1 hour")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-11-06 01:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "1 day and 1 hour")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-11-07 01:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "1 day")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-11-08 01:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "1 day")
        .commit ()

    .should ("handle the ending of DST")
        .up (s => s.createArgs = [0, "0 0-3 * * *", "test", TZ_INDIANAPOLIS])
        .given (nit.Date ("2023-11-05 00:00:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2023-11-05 01:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "1 hour")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-11-05 02:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "2 hours")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-11-05 03:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "1 hour")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-11-06 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "21 hours")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-11-06 01:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "1 hour")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-11-06 02:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "1 hour")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-11-06 03:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "1 hour")
        .commit ()

    .should ("handle last day of week syntax")
        .up (s => s.createArgs = [0, "0 0 * * 3L", "test", TZ_INDIANAPOLIS])
        .given (nit.Date ("2023-11-05 00:00:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2023-11-29 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "3 weeks, 3 days and 1 hour")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-12-27 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "4 weeks")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-01-31 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "1 month and 5 days")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-02-28 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "4 weeks")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-03-27 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "3 weeks, 6 days and 23 hours")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-04-24 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "4 weeks")
        .commit ()

    .should ("handle last day of week and range syntax")
        .up (s => s.createArgs = [0, "0 0 * * 1,2,WedL", "test", TZ_INDIANAPOLIS])
        .given (nit.Date ("2023-11-20 00:00:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2023-11-21 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "1 day")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-11-27 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "6 days")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-11-28 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "1 day")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-11-29 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "1 day")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-12-04 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "5 days")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-12-05 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "1 day")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-12-11 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "6 days")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-12-12 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "1 day")
        .commit ()

    .should ("handle last day of month syntax")
        .up (s => s.createArgs = [0, "0 0 L-5 * *", "test", TZ_INDIANAPOLIS])
        .given (nit.Date ("2023-11-20 00:00:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2023-11-25 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "5 days")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2023-12-26 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "1 month and 1 day")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-01-26 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "1 month and 1 day")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-02-24 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "4 weeks and 1 day")
        .commit ()

    .should ("handle last day of month syntax")
        .up (s => s.createArgs = [0, "0 0 L-30 * *", "test", TZ_INDIANAPOLIS])
        .given (nit.Date ("2023-11-20 00:00:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2023-12-01 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "1 week and 4 days")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-01-01 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "1 month and 1 day")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-03-01 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "2 months")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-05-01 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "2 months and 23 hours")
        .commit ()
;


test.method ("cron.Job", "next")
    .should ("handle day of month's weekday syntax")
        .up (s => s.createArgs = [0, "0 0 LW * *", "test", TZ_INDIANAPOLIS])
        .given (nit.Date ("2024-02-02 00:00:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2024-02-29 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "3 weeks and 6 days")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-03-29 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "4 weeks and 23 hours")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-04-30 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "1 month and 2 days")
        .commit ()

    .reset ()
        .up (s => s.createArgs = [0, "0 0 LW * *", "test", TZ_INDIANAPOLIS])
        .given (nit.Date ("2024-03-02 00:00:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2024-03-29 00:00:00", TZ_INDIANAPOLIS))
        .commit ()

    .reset ()
        .up (s => s.createArgs = [0, "0 0 3W * *", "test", TZ_INDIANAPOLIS])
        .given (nit.Date ("2024-03-06 00:00:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2024-04-03 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "3 weeks, 6 days and 23 hours")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-05-03 00:00:00", TZ_INDIANAPOLIS))
        .commit ()

    .reset ()
        .up (s => s.createArgs = [0, "0 0 2W * *", "test", TZ_INDIANAPOLIS])
        .given (nit.Date ("2024-03-06 00:00:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2024-04-02 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "3 weeks, 5 days and 23 hours")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-05-02 00:00:00", TZ_INDIANAPOLIS))
        .commit ()

    .reset ()
        .up (s => s.createArgs = [0, "0 0 1W * *", "test", TZ_INDIANAPOLIS])
        .given (nit.Date ("2024-06-06 00:00:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2024-07-01 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "3 weeks and 4 days")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-08-01 00:00:00", TZ_INDIANAPOLIS))
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-09-02 00:00:00", TZ_INDIANAPOLIS))
        .commit ()
;


test.method ("cron.Job", "next")
    .should ("handle day of week's n-th day of week syntax")
        .up (s => s.createArgs = [0, "0 0 * * 1#5", "test", TZ_INDIANAPOLIS])
        .given (nit.Date ("2024-08-07 00:00:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2024-09-30 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "1 month, 3 weeks and 3 days")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-12-30 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "3 months, 1 day and 1 hour")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2025-03-31 00:00:00", TZ_INDIANAPOLIS))
        .commit ()

    .reset ()
        .up (s => s.createArgs = [0, "0 0 * * 6#5", "test", TZ_INDIANAPOLIS])
        .given (nit.Date ("2024-08-07 00:00:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2024-08-31 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "3 weeks and 3 days")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-11-30 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "3 months, 1 day and 1 hour")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2025-03-29 00:00:00", TZ_INDIANAPOLIS))
        .commit ()

    .reset ()
        .up (s => s.createArgs = [0, "0 0 * * 6#5", "test", TZ_INDIANAPOLIS])
        .given (nit.Date ("2025-03-01 00:00:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2025-03-29 00:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "3 weeks, 6 days and 23 hours")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2025-05-31 00:00:00", TZ_INDIANAPOLIS))
        .commit ()
;


test.method ("cron.Job", "next")
    .should ("handle hash syntax")
        .up (s => s.createArgs = [0, "H H * * *", "test", TZ_INDIANAPOLIS])
        .before (s => nit.dpv (s.object, "id", 1))
        .given (nit.Date ("2024-08-07 00:00:00", TZ_INDIANAPOLIS))
        .returns (nit.Date ("2024-08-07 15:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "15 hours")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-08-08 15:00:00", TZ_INDIANAPOLIS))
        .expectingExprToReturnValue ("object.timeUntilNextRunHumanized", "1 day")
        .expectingMethodToReturnValue ("object.next", null, nit.Date ("2024-08-09 15:00:00", TZ_INDIANAPOLIS))
        .commit ()
;


test.method ("cron.Job", "start")
    .should ("start the job")
        .up (s => s.createArgs =
        {
            expr: "0 0 * * *",
            command: "nit test",
            timezone: "America/Indianapolis"
        })
        .before (() =>
        {
            test.mock (Date, "now", nit.Date ("2023-09-18 14:55", "America/Indianapolis").getTime ());
        })
        .returnsInstanceOf ("cron.Job")
        .expectingPropertyToBe ("result.timeUntilNextRunHumanized", "9 hours and 5 minutes")
        .expectingPropertyToBeOfType ("result.timer", "nit.utils.Timer")
        .expectingMethodToReturnValueOfType ("result.stop", null, "cron.Job")
        .commit ()

    .should ("invoke run when the timer fires")
        .up (s => s.global = global)
        .up (s => (s.lock = new nit.Deferred) && null)
        .up (s => s.createArgs =
        {
            expr: "0 0 1 * *",
            command: "nit test:not-found",
            timezone: "America/Indianapolis"
        })
        .mock ("global.Date", "now", function ()
        {
            let { iteration, strategy: s } = this;

            if (iteration == 1)
            {
                s.now = nit.Date ("2023-09-02 14:55", "America/Indianapolis").getTime ();
            }

            return s.now;
        })
        .mock ("global", "setTimeout", function (cb, timeout)
        {
            let { targetMethod: setTimeout, strategy: s } = this;

            s.now += timeout;

            setTimeout (function ()
            {
                cb (); // eslint-disable-line callback-return

                if (timeout < 2147483647)
                {
                    s.lock.resolve ();
                }

            }, 1);
        })
        .mock ("object", "run")
        .after (s => s.lock)
        .returnsInstanceOf ("cron.Job")
        .expectingPropertyToBe ("mocks.1.invocations.length", 2)
        .expectingPropertyToBe ("mocks.1.invocations.0.args.1", 2147483647)
        .expectingPropertyToBe ("mocks.1.invocations.1.args.1", 304416353)
        .expectingPropertyToBe ("mocks.2.invocations.length", 1)
        .commit ()
;


test.method ("cron.Job", "updateInfo")
    .should ("updates the job status")
        .up (s => s.createArgs =
        {
            expr: "0 0 * * *",
            command: "nit test:not-found",
            timezone: "America/Indianapolis",
            env:
            {
                NIT_DEBUG: "cron.*"
            }
        })
        .up (s => s.Date = Date)
        .before (s => s.object.next (nit.Date ("2023-03-11 23:02:00", "America/Indianapolis")))
        .mock ("Date", "now", nit.Date ("2023-03-11 23:10:00", "America/Indianapolis") * 1, { iterations: 1 })
        .returnsInstanceOf ("cron.Job")
        .expectingPropertyToBe ("result.timeUntilNextRunHumanized", "50 minutes")
        .commit ()
;


test.method ("cron.Job", "run")
    .should ("run the job command")
        .up (s => s.createArgs =
        {
            expr: "0 0 * * *",
            command: "nit test:not-found",
            env:
            {
                NIT_DEBUG: "cron.*"
            }
        })
        .mock ("class", "spawn", function ()
        {
            return {
                stdout:
                {
                    on: () => {}
                }
                ,
                stderr:
                {
                    on: () => {}
                }
                ,
                on: (event, listener) =>
                {
                    listener (9);
                }
            };
        })
        .after (s => s.object.stop ())
        .expectingPropertyToBe ("mocks.0.invocations.0.args.0", "nit test:not-found")
        .expectingPropertyToContain ("mocks.0.invocations.0.args.1",
        {
            shell: true,
            detached: true,
            env:
            {
                NIT_DEBUG: "cron.*"
            }
        })
        .expectingPropertyToBe ("object.lastExitCode", 9)
        .commit ()

    .should ("log the messages from stdout and stderr")
        .up (s => s.createArgs =
        {
            expr: "0 0 * * *",
            command: "nit test:not-found",
            env:
            {
                NIT_DEBUG: "cron.*"
            }
        })
        .mock ("class", "spawn", function ()
        {
            return {
                stdout:
                {
                    on: (event, listener) =>
                    {
                        listener (Buffer.from ("stdout"));
                    }
                }
                ,
                stderr:
                {
                    on: (event, listener) =>
                    {
                        listener (Buffer.from ("stderr"));
                    }
                }
                ,
                on: (event, listener) =>
                {
                    listener (10);
                }
            };
        })
        .mock ("object.logger", "info")
        .mock ("object.logger", "error")
        .before (s => s.object.logger = nit.new ("nit.utils.Logger"))
        .after (s => s.object.stop ())
        .expectingPropertyToBe ("mocks.0.invocations.0.args.0", "nit test:not-found")
        .expectingPropertyToBe ("mocks.1.invocations.0.args.0", "stdout")
        .expectingPropertyToBe ("mocks.2.invocations.0.args.0", "stderr")
        .expectingPropertyToContain ("mocks.0.invocations.0.args.1",
        {
            shell: true,
            detached: true,
            env:
            {
                NIT_DEBUG: "cron.*"
            }
        })
        .expectingPropertyToBe ("object.lastExitCode", 10)
        .commit ()

    .should ("catch the exception and set job's lastExitCode to -1")
        .up (s => s.createArgs =
        {
            expr: "0 0 * * *",
            command: "nit test:not-found",
            env:
            {
                NIT_DEBUG: "cron.*"
            }
        })
        .mock ("class", "spawn", function ()
        {
            return {
                stdout:
                {
                    on: () => {}
                }
                ,
                stderr:
                {
                    on: () => {}
                }
                ,
                on: () =>
                {
                    throw new Error ("ERR!");
                }
            };
        })
        .after (s => s.object.stop ())
        .throws ("ERR!")
        .expectingPropertyToBe ("mocks.0.invocations.0.args.0", "nit test:not-found")
        .expectingPropertyToBe ("object.lastExitCode", -1)
        .commit ()
;
