// apps/api/src/Kernel.Application/Features/Roles/Queries/ListRolesQuery.cs
using Microsoft.Extensions.Logging;

namespace Kernel.Application.Features.Roles.Queries;

// ── Query ──────────────────────────────────────────────────────────────────

/// <summary>
/// Query: list all roles for a tenant.
///
/// <para>tenantId is resolved exclusively from TenantContext by the controller
/// before the query is dispatched. It is never sourced from user input.</para>
/// </summary>
public sealed record ListRolesQuery(string TenantId);

// ── Result ─────────────────────────────────────────────────────────────────

/// <summary>
/// Deterministic result shape for <see cref="ListRolesQueryHandler"/>.
/// </summary>
public sealed record ListRolesResult(IReadOnlyList<RoleDto> Roles);

// ── DTO ────────────────────────────────────────────────────────────────────

/// <summary>
/// Read-only projection of a single role.
/// Mirrors the TypeScript <c>RoleDto</c> in <c>packages/contracts/src/rbac/RoleDto.ts</c>.
/// Do NOT add mutable properties. Do NOT expose permission codes.
/// </summary>
public sealed record RoleDto(
    string Id,
    string Name,
    string? Description,
    bool IsSystemRole,
    string UpdatedAt);   // ISO 8601 UTC — matches IsoDateTime contract type

// ── Handler ────────────────────────────────────────────────────────────────

/// <summary>
/// Handles <see cref="ListRolesQuery"/>.
///
/// Responsibilities:
///   - Validates tenantId is non-empty (defensive; TenantMiddleware guarantees this)
///   - Delegates read to <see cref="IRoleRepository"/>
///   - Maps <see cref="RoleReadModel"/> → <see cref="RoleDto"/>
///   - Returns deterministic <see cref="ListRolesResult"/>
///
/// Does NOT:
///   - Perform authorization (handled by [Authorize] + IPermissionEvaluator)
///   - Check role names or claims
///   - Apply additional tenant filtering (enforced by IRoleRepository)
/// </summary>
public sealed class ListRolesQueryHandler
{
    private readonly IRoleRepository _repository;
    private readonly ILogger<ListRolesQueryHandler> _logger;

    public ListRolesQueryHandler(
        IRoleRepository repository,
        ILogger<ListRolesQueryHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<ListRolesResult> HandleAsync(
        ListRolesQuery query,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(query.TenantId, nameof(query.TenantId));

        _logger.LogInformation(
            "ListRoles: querying roles for tenant {TenantId}",
            query.TenantId);

        var models = await _repository.ListByTenantAsync(query.TenantId, cancellationToken);

        var dtos = models
            .Select(m => new RoleDto(
                Id:           m.Id.ToString(),
                Name:         m.Name,
                Description:  m.Description,
                IsSystemRole: m.IsSystemRole,
                UpdatedAt:    m.UpdatedAt.UtcDateTime.ToString("O")))
            .ToList()
            .AsReadOnly();

        _logger.LogInformation(
            "ListRoles: returning {Count} roles for tenant {TenantId}",
            dtos.Count, query.TenantId);

        return new ListRolesResult(dtos);
    }
}
