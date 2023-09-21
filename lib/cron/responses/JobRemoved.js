module.exports = function (nit, cron)
{
    return cron.defineResponse ("JobRemoved")
        .info (200, "The job has been removed.")
        .field ("<job>", "cron.Job", "The removed job.")
    ;
};
