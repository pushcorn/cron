test.object ("cron.items.Range")
    .should ("throw if the expression is invalid")
        .given (nit.new ("cron.fields.DayOfWeek"), "MOM")
        .throws ("error.invalid_value")
        .commit ()
;
