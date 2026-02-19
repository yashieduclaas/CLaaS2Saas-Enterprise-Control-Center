namespace Kernel.Application.Abstractions;

/// <summary>
/// Represents the resolved tenant context for the current request.
/// Populated by TenantMiddleware. Must be available after authentication.
/// </summary>
public interface ITenantContext
{
    /// <summary>Resolved tenant identifier. Non-null after TenantMiddleware runs.</summary>
    string? TenantId { get; }

    /// <summary>True if a valid tenant has been resolved for this request.</summary>
    bool IsResolved { get; }
}
