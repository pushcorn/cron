module.exports = function (nit, cron)
{
    return cron.defineResponse ("JobUpdated")
        .info (200, "The job has been updated.")
        .field ("<job>", "cron.Job", "The updated job.")
    ;
};
