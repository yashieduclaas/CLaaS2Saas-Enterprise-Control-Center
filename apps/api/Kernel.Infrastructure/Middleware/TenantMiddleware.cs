using Kernel.Application.Abstractions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Kernel.Infrastructure.Middleware;

/// <summary>
/// PLATFORM MIDDLEWARE — FROZEN.
///
/// Resolves the tenant for the current request and populates ITenantContext.
///
/// Resolution strategy (in priority order):
///   1. JWT claim: "tid" (Entra tenant ID)
///   2. Request header: X-Tenant-Id (service-to-service)
///
/// If the tenant cannot be resolved and RequireResolved = true (default),
/// the middleware short-circuits with 400 Bad Request.
///
/// Must execute AFTER UseAuthentication and BEFORE UseAuthorization.
/// </summary>
public sealed class TenantMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<TenantMiddleware> _logger;
    private readonly TenantMiddlewareOptions _options;

    public TenantMiddleware(
        RequestDelegate next,
        ILogger<TenantMiddleware> logger,
        IOptions<TenantMiddlewareOptions> options)
    {
        _next = next;
        _logger = logger;
        _options = options.Value;
    }

    public async Task InvokeAsync(HttpContext context, ITenantContext tenantContext)
    {
        // Skip health probe — no tenant context required.
        if (context.Request.Path.StartsWithSegments("/health", StringComparison.OrdinalIgnoreCase))
        {
            await _next(context);
            return;
        }

        var resolved = TryResolveTenantId(context, out var tenantId);

        if (resolved && tenantId is not null)
        {
            ((TenantContext)tenantContext).Resolve(tenantId);
            _logger.LogDebug("TenantMiddleware resolved tenant={TenantId}", tenantId);
        }
        else if (_options.RequireResolved)
        {
            _logger.LogWarning("TenantMiddleware: tenant could not be resolved for {Path}",
                context.Request.Path);
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsJsonAsync(new
            {
                type   = "https://kernel.claas2saas.io/errors/missing-tenant",
                title  = "Tenant context could not be resolved.",
                status = 400
            });
            return;
        }

        await _next(context);
    }

    private static bool TryResolveTenantId(HttpContext context, out string? tenantId)
    {
        // 1. JWT claim (Entra "tid")
        var claim = context.User.FindFirst("tid") ??
                    context.User.FindFirst("http://schemas.microsoft.com/identity/claims/tenantid");
        if (claim is not null && !string.IsNullOrWhiteSpace(claim.Value))
        {
            tenantId = claim.Value;
            return true;
        }

        // 2. Header fallback (service-to-service)
        if (context.Request.Headers.TryGetValue("X-Tenant-Id", out var headerVal) &&
            !string.IsNullOrWhiteSpace(headerVal))
        {
            tenantId = headerVal.ToString();
            return true;
        }

        tenantId = null;
        return false;
    }
}

public sealed class TenantMiddlewareOptions
{
    /// <summary>
    /// When true (default), requests without a resolved tenant return 400.
    /// Set to false only for endpoints that are genuinely tenant-agnostic.
    /// </summary>
    public bool RequireResolved { get; set; } = true;
}
