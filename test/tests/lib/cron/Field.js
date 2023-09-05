test.method ("cron.Field", "registerItemType", true)
    .should ("register a supported item type")
        .given ("cron:range")
        .commit ()

    .should ("accept an item class")
        .given (nit.lookupClass ("cron.items.Range"))
        .commit ()
;
