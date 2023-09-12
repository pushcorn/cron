module.exports = function (nit, cron)
{
    return cron.defineItem ("WeekdayOfMonth")
        .meta ({ patterns: /^(L|\d+)W$/ })
        .field ("last", "boolean", "Search for the last weekday.")
        .field ("anchor", "integer?", "The anchor date.")
            .constraint ("min", 1)
            .constraint ("max", 31)

        .onGetTargetDate (function (date)
        {
            let self = this;
            let { anchor, last } = self;
            let lastDom = cron.getLastDateOfMonth (date).getUTCDate ();
            let target = last ? lastDom : anchor;
            let d = new Date (date);

            d.setUTCDate (target);

            let day = d.getUTCDay ();

            if (day > 0 && day < 6)
            {
                return target;
            }
            else
            if (day == 6)
            {
                return target > 1 ? target - 1 : target + 2;
            }
            else
            {
                return target < lastDom ? target + 1 : target - 2;
            }
        })
        .onApplicableToMonth (function (month)
        {
            return this.last || cron.DAYS_IN_MONTH[month - 1] >= this.anchor;
        })
        .onParse (function ()
        {
            let self = this;
            let expr = self.expr;

            if (expr[0] == "L")
            {
                self.last = true;
            }
            else
            {
                self.anchor = nit.int (expr);
            }
        })
        .onGetStepsToNextOccurrence (function (date)
        {
            return this.getStepsToTargetDate (date);
        })
    ;
};
