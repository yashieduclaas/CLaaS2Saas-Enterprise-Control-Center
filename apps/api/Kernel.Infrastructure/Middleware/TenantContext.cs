using Kernel.Application.Abstractions;

namespace Kernel.Infrastructure.Middleware;

/// <summary>
/// Mutable tenant context populated by TenantMiddleware.
/// Scoped per request.
/// </summary>
internal sealed class TenantContext : ITenantContext
{
    public string? TenantId { get; private set; }
    public bool IsResolved => TenantId is not null;

    internal void Resolve(string tenantId)
    {
        if (string.IsNullOrWhiteSpace(tenantId))
            throw new ArgumentException("TenantId must not be empty.", nameof(tenantId));

        TenantId = tenantId;
    }
}
