module.exports = function (nit, Self)
{
    return (Self = nit.defineConstraint ("cron.constraints.Expression"))
        .use ("cron.Expression")
        .throws ("error.invalid_expr", "The cron expression '%{value}' is invalid. (Cause: %{cause})")
        .onValidate (function (ctx)
        {
            try
            {
                return !!Self.Expression (ctx.value);
            }
            catch (e)
            {
                ctx.cause = e.message;
            }
        })
    ;
};
