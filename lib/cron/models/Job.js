module.exports = function (nit, postgresql, Self)
{
    return (Self = postgresql.defineModel ("cron.models.Job", "postgresql.models.JobBase"))
        .use ("cron.Expression")
        .use ("nit.utils.Humanize")
        // .field ("<id>", "postgresql.ids.Uuid", { key: true, order: 0 })
        .field ("<expr>", "string", "The cron expression.", { order: 5 })
            .constraint ("cron:expression")
        // .field ("<command>", "string", "The command to run.", { order: 10 })
        .field ("[timezone]", "string", "The time zone.", () => nit.timezone (), { order: 10 })
            .constraint ("timezone")
        .field ("status", "string", "The job status.", "scheduled", { columnDefval: "'scheduled'", order: 50 })
            .constraint ("choice", "scheduled", "queued", "running")
        .field ("nextRun", "string", "The local time of the next run.")
        .field ("nextRunUtc", "date", "The UTC time of the next run.")
        .getter ("timeUntilNextRun", function ()
        {
            return this.nextRunUtc - Date.now ();
        })
        .getter ("timeUntilNextRunHumanized", function ()
        {
            return Self.Humanize.duration (this.timeUntilNextRun, 3);
        })
        .onConstruct (function ()
        {
            this.next ();
        })
        .onPrepareTable (table => table.Index ("nextRunUtc"))
        .onPreUpdate (ctx => ctx.new.next (Date.now ()))
        .method ("next", function (date)
        {
            let self = this;

            if (self.expr)
            {
                let expr = new Self.Expression (self.expr, self.timezone);

                expr.next (date || self.nextRunUtc);

                self.nextRun = expr.nextRun;
                self.nextRunUtc = expr.nextRunUtc;
            }
        })
    ;
};
