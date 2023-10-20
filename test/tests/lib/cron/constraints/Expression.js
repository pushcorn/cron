test.method ("cron.constraints.Expression", "validate")
    .should ("return true if the expression is valid")
        .given ({ value: "0 0 * * *" })
        .returns (true)
        .commit ()

    .should ("throw if the expression is not valid")
        .given ({ value: "0 0 ab * *" })
        .throws (/expression.*invalid.*cause.*month/i)
        .commit ()
;
