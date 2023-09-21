module.exports = function (nit, cron)
{
    return cron.defineResponse ("JobCreated")
        .info (201, "The job has been created.")
        .field ("<job>", "cron.Job", "The created job.")
    ;
};
