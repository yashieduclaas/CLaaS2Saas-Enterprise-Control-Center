// apps/api/src/Kernel.Infrastructure/Tenant/HttpTenantContextAccessor.cs
using Kernel.Application.Tenant;
using Microsoft.AspNetCore.Http;

namespace Kernel.Infrastructure.Tenant;

/// <summary>
/// Resolves <see cref="TenantContext"/> from <see cref="IHttpContextAccessor"/>.
/// TenantContext is placed into HttpContext.Items by <c>TenantMiddleware</c>.
///
/// Lifetime: Scoped — one instance per request.
/// This is the only permitted way to read TenantContext in the application layer.
/// Feature code MUST inject <see cref="ITenantContextAccessor"/>, not this class directly.
/// </summary>
internal sealed class HttpTenantContextAccessor : ITenantContextAccessor
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public HttpTenantContextAccessor(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public TenantContext? Current =>
        _httpContextAccessor.HttpContext?.Items[TenantContext.HttpContextKey] as TenantContext;

    public TenantContext GetRequiredContext()
    {
        var ctx = Current;
        if (ctx is null)
        {
            throw new InvalidOperationException(
                "TenantContext is not available. " +
                "Verify TenantMiddleware is registered and the request is authenticated. " +
                "This method must only be called within an authenticated request pipeline.");
        }
        return ctx;
    }
}
