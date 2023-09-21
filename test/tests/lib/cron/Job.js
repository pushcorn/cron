test.object ("cron.Job")
    .should ("contain the information of a cron job")
    .given ({ expr: "H H * * *", command: "nit test" })
    .returnsInstanceOf ("cron.Job")
    .expectingPropertyToBeOfType ("result.entry", "cron.Entry")
    .commit ()
;
