module.exports = function (nit)
{
    return nit.defineCommand ("cron.commands.Server")
        .describe ("Run the cron server.")
        .commandplugin ("http:server",
        {
            name: "nit cron server",
            config:
            {
                "serverplugins":
                [
                    "http:auto-restart",
                    "cron:server"
                ]
                ,
                "services":
                [
                {
                    "@name": "http:api-server",
                    "includes": ["http.*", "cron.*"]
                }
                ]
            }
        })
    ;
};
