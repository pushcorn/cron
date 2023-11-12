test.object ("cron.Api.Context", true, "scheduler")
    .should ("have a scheduler getter")
        .given (nit.require ("http.Context").new ())
        .before (s => s.args[0].server = nit.new ("http.Server"))
        .returnsInstanceOf ("cron.Scheduler")
        .commit ()
;
