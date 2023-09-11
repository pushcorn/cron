module.exports = function (nit, cron, Self)
{
    return (Self = cron.defineItem ("LastDayOfWeek"))
        .meta (
        {
            patterns: new RegExp (`^(\\d|${cron.DAY_NAMES})L$`, "i")
        })
        .field ("day", "integer")
            .constraint ("min", Self.min)
            .constraint ("max", Self.max)

        .method ("getTargetDate", function (date)
        {
            let lastDom = cron.getLastDateOfMonth (date);
            let diff = lastDom.getUTCDay () - this.day;

            if (diff < 0)
            {
                diff += 7;
            }

            return lastDom.getUTCDate () - diff;
        })
        .onParse (function ()
        {
            let expr = this.expr;

            if (expr.length > 2)
            {
                this.day = cron.DAY_NAME_ARRAY.indexOf (expr.slice (0, -1).toUpperCase ());
            }
            else
            {
                this.day = nit.int (expr);
            }
        })
        .onGetStepsToNextOccurrence (function (date)
        {
            let self = this;
            let target = self.getTargetDate (date);
            let diff = target - date.getUTCDate ();

            if (diff < 0)
            {
                let d = new Date (date);

                d.setUTCMonth (d.getUTCMonth () + 1);
                d.setUTCDate (1);

                target = self.getTargetDate (d);
                diff = target + cron.getLastDateOfMonth (date).getUTCDate () - date.getUTCDate ();
            }

            return diff;
        })
    ;
};
