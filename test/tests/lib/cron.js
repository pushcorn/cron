const cron = nit.require ("cron");


test.method ("cron", "getDateAsUtc", true)
    .should ("return a UTC date based on the local date value")
        .given (new Date (2023, 8, 1, 13))
        .returns (new Date ("2023-09-01T13:00:00.000Z"))
        .commit ()

    .should ("use the current date if no date was given")
        .returnsInstanceOf (Date)
        .commit ()
;


test.method ("cron", "getFirstDateOfMonth", true)
    .should ("return the first date of the month")
        .given (cron.getDateAsUtc (new nit.Date ("2023-09-01 03:00:00", "Asia/Taipei")))
        .returnsInstanceOf ("Date")
        .expectingMethodToReturnValue ("result.getUTCMonth", null, 8)
        .expectingMethodToReturnValue ("result.getUTCDate", null, 1)
        .expectingMethodToReturnValue ("result.getUTCMinutes", null, 0)
        .expectingMethodToReturnValue ("result.getUTCSeconds", null, 0)
        .commit ()

    .reset ()
        .given (new nit.Date ("2023-09-01", "America/Indianapolis"))
        .returnsInstanceOf ("Date")
        .expectingMethodToReturnValue ("result.getUTCMonth", null, 8)
        .expectingMethodToReturnValue ("result.getUTCDate", null, 1)
        .commit ()
;


test.method ("cron", "getLastDateOfMonth", true)
    .should ("return the last date of the month")
        .given (cron.getDateAsUtc (new nit.Date ("2023-09-01 03:00:00", "Asia/Taipei")))
        .returnsInstanceOf ("Date")
        .expectingMethodToReturnValue ("result.getUTCMonth", null, 8)
        .expectingMethodToReturnValue ("result.getUTCDate", null, 30)
        .commit ()

    .reset ()
        .given (new nit.Date ("2023-09-01", "America/Indianapolis"))
        .returnsInstanceOf ("Date")
        .expectingMethodToReturnValue ("result.getUTCMonth", null, 8)
        .expectingMethodToReturnValue ("result.getUTCDate", null, 30)
        .commit ()
;
