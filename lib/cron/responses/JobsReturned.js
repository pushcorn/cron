module.exports = function (nit, cron)
{
    return cron.defineResponse ("JobsReturned")
        .info (200, "The jobs has been returned.")
        .field ("[jobs...]", "cron.Job")
    ;
};
