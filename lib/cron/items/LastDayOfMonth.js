module.exports = function (nit, cron)
{
    return cron.defineItem ("LastDayOfMonth")
        .meta ({ patterns: /^L(-\d+)?$/ })
        .field ("offset", "integer", "The offset to the last day of month.")
            .constraint ("min", 0)
            .constraint ("max", 30)

        .onGetTargetDate (function (date)
        {
            let lastDom = cron.getLastDateOfMonth (date);

            return lastDom.getUTCDate () - this.offset;
        })
        .onApplicableToMonth (function (month)
        {
            return cron.DAYS_IN_MONTH[month - 1] > this.offset;
        })
        .onParse (function ()
        {
            let expr = this.expr;

            if (expr[1] == "-")
            {
                this.offset = -nit.int (expr.slice (1));
            }
        })
        .onGetStepsToNextOccurrence (function (date)
        {
            return this.getStepsToTargetDate (date);
        })
    ;
};
