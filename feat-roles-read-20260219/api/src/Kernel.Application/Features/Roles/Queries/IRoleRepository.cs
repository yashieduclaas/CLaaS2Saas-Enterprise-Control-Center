// apps/api/src/Kernel.Application/Features/Roles/Queries/IRoleRepository.cs
namespace Kernel.Application.Features.Roles.Queries;

/// <summary>
/// Read-side repository contract for the Roles aggregate.
/// Lives in Application — implemented by Infrastructure.
///
/// MMP note: A caching decorator (e.g. CachedRoleRepository wrapping this
/// interface) can be inserted here with a single DI registration swap in
/// InfrastructureServiceExtensions. No other code changes required.
/// </summary>
public interface IRoleRepository
{
    /// <summary>
    /// Returns all roles scoped to the given tenant.
    /// Implementation MUST apply tenant filter. Callers MUST NOT pass a
    /// tenantId sourced from user input — only from TenantContext.
    /// </summary>
    Task<IReadOnlyList<RoleReadModel>> ListByTenantAsync(
        string tenantId,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Lightweight read projection — avoids loading permission collections.
/// Maps directly to <see cref="Kernel.Application.Features.Roles.Queries.RoleDto"/>.
/// </summary>
public sealed record RoleReadModel(
    Guid Id,
    string Name,
    string? Description,
    bool IsSystemRole,
    DateTimeOffset UpdatedAt);
