using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Kernel.Infrastructure.Auth;

/// <summary>
/// Demo auth middleware for AUTH_MODE=Demo.
/// Reads X-Demo-User header, looks up in DemoUserStore, synthesizes ClaimsPrincipal.
/// Runs before TenantMiddleware. No Entra, no MSAL.
/// </summary>
public sealed class DemoAuthMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<DemoAuthMiddleware> _logger;

    public DemoAuthMiddleware(RequestDelegate next, ILogger<DemoAuthMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var demoUserHeader = context.Request.Headers["X-Demo-User"].FirstOrDefault();
        if (string.IsNullOrWhiteSpace(demoUserHeader))
        {
            _logger.LogDebug("Demo auth: no X-Demo-User header supplied; request remains anonymous");
            await _next(context);
            return;
        }

        var user = DemoUserStore.GetByEmail(demoUserHeader);
        if (user is null)
        {
            _logger.LogWarning("Demo auth: header did not resolve to a configured user; request remains anonymous");
            await _next(context);
            return;
        }

        context.User = DemoUserStore.CreatePrincipal(user);
        _logger.LogDebug("Demo auth: principal established for request");

        await _next(context);
    }
}
