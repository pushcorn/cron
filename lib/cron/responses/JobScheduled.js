module.exports = function (nit, cron)
{
    return cron.defineResponse ("JobScheduled")
        .info (201, "The job has been scheduled.")
        .field ("<job>", "cron.Job", "The scheduled job.")
    ;
};
