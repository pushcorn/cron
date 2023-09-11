const cron = nit.require ("cron");


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
