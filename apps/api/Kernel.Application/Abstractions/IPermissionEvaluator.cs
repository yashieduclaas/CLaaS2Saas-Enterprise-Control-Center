namespace Kernel.Application.Abstractions;

/// <summary>
/// PLATFORM SEAM — DO NOT MODIFY WITHOUT ARCHITECTURE REVIEW.
///
/// Evaluates whether the current principal holds the specified permission
/// within the given tenant context. All authorization in the platform routes
/// through this interface.
///
/// Implementations MUST be:
/// - deterministic for the same input
/// - async-safe (no thread-local state)
/// - tenant-scoped
///
/// Future implementations will replace the stub in Infrastructure.
/// </summary>
public interface IPermissionEvaluator
{
    /// <summary>
    /// Evaluates a single permission for the current principal and tenant.
    /// </summary>
    /// <param name="tenantId">The tenant scope for evaluation.</param>
    /// <param name="principalId">The identity of the subject being evaluated.</param>
    /// <param name="permission">The permission key (e.g. "ADMIN:GLOBAL", "USERS:READ").</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if the principal holds the permission; false otherwise.</returns>
    Task<bool> EvaluateAsync(
        string tenantId,
        string principalId,
        string permission,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Evaluates multiple permissions in a single pass (optimization contract).
    /// Default implementation delegates to EvaluateAsync per-item.
    /// </summary>
    async Task<IReadOnlyDictionary<string, bool>> EvaluateBatchAsync(
        string tenantId,
        string principalId,
        IEnumerable<string> permissions,
        CancellationToken cancellationToken = default)
    {
        var results = new Dictionary<string, bool>(StringComparer.OrdinalIgnoreCase);
        foreach (var p in permissions)
        {
            results[p] = await EvaluateAsync(tenantId, principalId, p, cancellationToken);
        }
        return results;
    }
}
