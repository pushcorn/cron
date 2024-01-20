test.method ("cron.Job", "nit.Object.caster", true)
    .should ("cast the models.Job to Job")
        .up (s => s.args = nit.new ("cron.models.Job",
        {
            id: { value: "11111111-1111-1111-1111-111111111111" },
            expr: "0 0 * * *",
            command: "shell echo test",
            timezone: "UTC",
            nextRunUtc: s.cron.getDateAsUtc (new Date (2024, 1, 12, 17, 20))
        }))
        .returnsInstanceOf ("cron.Job")
        .commit ()

    .should ("just return non models.Job values")
        .given (3)
        .returns (3)
        .commit ()
;
