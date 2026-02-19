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
        var email = context.Request.Headers["X-Demo-User"].FirstOrDefault()
            ?? "global.admin@demo.com";

        var user = DemoUserStore.GetByEmail(email);
        if (user is null)
        {
            _logger.LogWarning("DemoAuth: unknown user {Email}, defaulting to global.admin@demo.com", email);
            user = DemoUserStore.GetByEmail("global.admin@demo.com")!;
        }

        context.User = DemoUserStore.CreatePrincipal(user);
        _logger.LogDebug("DemoAuth: set User for {Email} tenant={TenantId}", user.Email, user.TenantId);

        await _next(context);
    }
}
