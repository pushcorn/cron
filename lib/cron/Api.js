module.exports = function (nit, Self)
{
    return (Self = nit.defineClass ("cron.Api", "http.Api"))
        .m ("error.job_not_found")
        .categorize ("cron.apis")
        .use ("cron.models.Job")
        .use ("postgresql.Database")
        .defineComponentPlugin ()
        .defineContext (Context =>
        {
            Context
                .serviceprovider ("postgresql:database")
                .getter ("db", false, false, function () { return this.lookupService ("postgresql.Database"); })
                .getter ("cronServer", false, false, function () { return this.lookupService ("cron.Server"); })
                .getter ("Job", false, false, function () { return this.db.lookup (Self.Job); })
            ;
        })
        .onPostNsInvoke (Subclass =>
        {
            if (Subclass.superclass == Self
                && Subclass.Request.parameterMap.id)
            {
                Subclass
                    .defineCompgenCompleter (Completer =>
                    {
                        Completer
                            .completeForOption ("commands.Api.id", { api: nit.ComponentDescriptor.normalizeName (Subclass.name, "apis") }, async (ctx) =>
                            {
                                let db = new Self.Database;
                                let Job = db.lookup (Self.Job);
                                let ids = (await Job.select ()).map (r => r.id.value);

                                return [nit.Compgen.ACTIONS.VALUE, ...ctx.filterCompletions (ids)];
                            })
                        ;
                    })
                ;
            }
        })
    ;
};
