test.method ("cron.serverplugins.Server", "preInit")
    .should ("initialize a cron server")
        .given (nit.new ("http.Server"))
        .expectingPropertyToBe ("args.0.serviceproviders.length", 1)
        .commit ()
;


test.method ("cron.serverplugins.Server", "preStart")
    .should ("start the cron server")
        .up (s => s.cronServer = nit.new ("cron.Server"))
        .before (s => s.object.cronServer = s.cronServer)
        .mock ("cronServer", "start")
        .expectingPropertyToBe ("mocks.0.invocations.length", 1)
        .commit ()
;


test.method ("cron.serverplugins.Server", "preStop")
    .should ("stop the cron server")
        .up (s => s.cronServer = nit.new ("cron.Server"))
        .before (s => s.object.cronServer = s.cronServer)
        .mock ("cronServer", "stop")
        .expectingPropertyToBe ("mocks.0.invocations.0.args", [true])
        .commit ()
;
