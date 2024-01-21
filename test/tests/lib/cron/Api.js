test.object ("cron.Api.Context", true, "cronServer")
    .should ("have a cron server getter")
        .up (s => s.args = nit.require ("http.Context").new ())
        .up (s => s.args[0].serviceproviders.push (nit.lookupClass ("cron.Server")))
        .returnsInstanceOf ("cron.Server")
        .commit ()
;


test.object ("cron.Api.Context", true, "db")
    .should ("have a db getter")
        .up (s => s.args = nit.require ("http.Context").new ())
        .returnsInstanceOf ("postgresql.Database")
        .commit ()
;


test.object ("cron.Api.Context", true, "Job")
    .should ("have a Job getter")
        .up (s => s.args = nit.require ("http.Context").new ())
        .returnsInstanceOf ("cron.models.Job", true)
        .commit ()
;


test.method ("cron.Api", "postNsInvoke", true)
    .should ("add the compgen completer for the ID parameter")
        .useMockPgClient ()
        .up (s => s.class = s.class.defineSubclass ("test.apis.MyApi")
            .defineRequest (Request =>
                Request.path ("<id>", "string", "The Job ID.")
            )
        )
        .mock ("MockPgClient.prototype", "query", function ()
        {
            return { rows: [{ id: "1234" }] };
        })
        .after (s => s.Completer = nit.lookupClass (s.class.name + ".compgencompleters.Completer"))
        .after (s => s.completions1 = s.Completer.generate (
        {
            completionType: "option",
            filterCompletions: v => v,
            commandClass:
            {
                name: "commands.Api"
            }
            ,
            currentOption:
            {
                name: "id"
            }
            ,
            specifiedValues:
            {
                api: "test:my-api"
            }
        }))
        .expectingPropertyToBe ("completions1", ["VALUE", "1234"])
        .commit ()
;
