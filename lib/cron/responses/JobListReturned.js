module.exports = function (nit, cron)
{
    return cron.defineResponse ("JobListReturned")
        .info (200, "The job list has been returned.")
        .field ("[jobs...]", "cron.Job")
    ;
};
