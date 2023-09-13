module.exports = function (nit, cron, Self)
{
    return (Self = cron.defineItem ("LastDayOfWeek"))
        .meta (
        {
            patterns: new RegExp (`^([0-7]|${cron.DAY_NAMES})L$`, "i")
        })
        .field ("day", "integer")
            .constraint ("min", 0)
            .constraint ("max", 7)

        .onGetTargetDate (function (date)
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
                this.day = nit.int (expr) % 7;
            }
        })
        .onGetStepsToNextOccurrence (function (date)
        {
            return this.getStepsToTargetDate (date);
        })
    ;
};
