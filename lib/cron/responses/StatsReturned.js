module.exports = function (nit, cron)
{
    return cron.defineResponse ("StatsReturned")
        .info (200, "The stats has been returned.")
        .field ("<stats>", "cron.Stats", "The scheduler stats.")
    ;
};
