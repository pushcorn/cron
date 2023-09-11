module.exports = function (nit, cron)
{
    return cron.defineItem ("LastDayOfMonth")
        .meta ({ patterns: [/^L(-\d+)?$/] })
        .field ("offset", "integer", "The offset to the last day of month.")
            .constraint ("min", 0)
            .constraint ("max", 30)

        .method ("getTargetDate", function (date)
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
            let self = this;
            let d = new Date (date);
            let target = self.getTargetDate (d);
            let diff = target - d.getUTCDate ();
            let steps = diff;

            while (diff < 0)
            {
                d.setUTCMonth (d.getUTCMonth () + 1);
                d.setUTCDate (1);

                let dd = new Date (d);

                dd.setUTCMonth (dd.getUTCMonth () + 1);
                dd.setUTCDate (0);

                steps += dd.getUTCDate ();

                target = self.getTargetDate (d);
                diff = target - d.getUTCDate ();
            }

            return steps;
        })
    ;
};
