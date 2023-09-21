module.exports = function (nit, cron)
{
    return cron.defineResponse ("JobReturned")
        .info (200, "The job has been returned.")
        .field ("<job>", "cron.Job", "The cron job.")
    ;
};
