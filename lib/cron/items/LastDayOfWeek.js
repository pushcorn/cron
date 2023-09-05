module.exports = function (nit, cron, Self)
{
    return (Self = cron.defineItem ("LastDayOfWeek"))
        .meta ({ patterns: [/^\dL$/] })
        .field ("day", "integer")
            .constraint ("min", Self.min)
            .constraint ("max", Self.max)

        .method ("getTargetDate", function (date)
        {
            let lastDom = cron.getLastDateOfMonth (date);
            let diff = lastDom.getDay () - this.day;

            if (diff < 0)
            {
                diff += 7;
            }

            return lastDom.getDate () - diff;
        })
        .onParse (function ()
        {
            this.day = nit.int (this.expr);
        })
        .onGetStepsToNextOccurrence (function (date)
        {
            let self = this;
            let target = self.getTargetDate (date);
            let diff = target - date.getDate ();

            if (diff < 0)
            {
                let d = new Date (date);

                d.setMonth (d.getMonth () + 1);
                d.setDate (1);

                target = self.getTargetDate (d);
                diff = target + cron.getLastDateOfMonth (date).getDate () - date.getDate ();
            }

            return diff;
        })
    ;
};
