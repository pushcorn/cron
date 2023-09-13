module.exports = function (nit, cron)
{
    return cron.defineItem ("NthDayOfWeek")
        .meta (
        {
            patterns: new RegExp (`^([0-7]|${cron.DAY_NAMES})#[1-5]$`, "i")
        })
        .field ("dayOfWeek", "integer", "The day of week.")
            .constraint ("min", 0)
            .constraint ("max", 6)
        .field ("position", "integer", "The n-th day of week.", 1)
            .constraint ("min", 1)
            .constraint ("max", 5)

        .method ("getDatesForDayOfWeek", function (date)
        {
            let { dayOfWeek, position } = this;
            let first = cron.getFirstDateOfMonth (date);
            let firstDow = first.getUTCDay ();
            let last = cron.getLastDateOfMonth (date);
            let dates = [];
            let offset = dayOfWeek == firstDow
                    ? 0
                    : (dayOfWeek > firstDow
                        ? (dayOfWeek - firstDow)
                        : (7 - firstDow + dayOfWeek))
            ;

            first.setUTCDate (first.getUTCDate () + offset);

            while (first <= last)
            {
                dates.push (first.getUTCDate ());
                first.setUTCDate (first.getUTCDate () + 7);
            }

            return dates;
        })
        .onGetTargetDate (function (date)
        {
            return this.getDatesForDayOfWeek (date)[this.position - 1] || 0;
        })
        .onParse (function ()
        {
            let self = this;
            let [dayOfWeek, position] = self.expr.split ("#");

            self.dayOfWeek = dayOfWeek % 7;
            self.position = position;
        })
        .onGetStepsToNextOccurrence (function (date)
        {
            return this.getStepsToTargetDate (date);
        })
    ;
};
