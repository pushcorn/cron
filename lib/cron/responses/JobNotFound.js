module.exports = function (nit, cron)
{
    return cron.defineResponse ("JobNotFound")
        .info (404, "The job was not found.")
    ;
};
