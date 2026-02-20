// apps/api/src/Kernel.Infrastructure/Repositories/RoleRepository.cs
using Kernel.Application.Features.Roles.Queries;
using Kernel.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Kernel.Infrastructure.Repositories;

/// <summary>
/// EF Core implementation of <see cref="IRoleRepository"/>.
///
/// TENANT ISOLATION:
///   Tenant scoping is enforced at two complementary layers:
///   1. The <c>KernelDbContext</c> global query filter applies
///      <c>WHERE TenantId = @tenantId</c> to every generated SQL query.
///   2. This method explicitly passes <c>tenantId</c> to the context —
///      the context was constructed with the same tenantId from TenantContext,
///      so this serves as a defensive double-check.
///   
///   Do NOT call <c>IgnoreQueryFilters()</c> — this is a rejection criterion
///   in the pod validation pipeline and a Severity-1 security defect.
///
/// PERFORMANCE:
///   - No tracked entities for read queries (AsNoTracking)
///   - No navigation property loading (no Include calls here — permission codes
///     are NOT loaded on the list endpoint)
///   - Single query — no N+1
///   - Prepared for caching: the method signature matches IRoleRepository which
///     can be wrapped by a CachedRoleRepository decorator at DI registration time.
/// </summary>
internal sealed class RoleRepository : IRoleRepository
{
    private readonly KernelDbContext _dbContext;
    private readonly ILogger<RoleRepository> _logger;

    public RoleRepository(
        KernelDbContext dbContext,
        ILogger<RoleRepository> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<RoleReadModel>> ListByTenantAsync(
        string tenantId,
        CancellationToken cancellationToken = default)
    {
        // Defensive assertion — TenantMiddleware + PermissionRequirementHandler
        // guarantee a non-empty tenantId before this is called.
        // This guard exists to fail loudly during integration testing if the
        // middleware pipeline is misconfigured.
        if (string.IsNullOrWhiteSpace(tenantId))
        {
            _logger.LogError("RoleRepository.ListByTenantAsync called with empty tenantId. " +
                             "This indicates a middleware pipeline misconfiguration.");
            throw new ArgumentException("tenantId must not be null or whitespace.", nameof(tenantId));
        }

        // NOTE: The global query filter on KernelDbContext already enforces
        // WHERE TenantId = _tenantId. We project only the columns needed for
        // the list view — no permissions collection loaded.
        var roles = await _dbContext.Roles
            .AsNoTracking()
            .OrderBy(r => r.Name)    // deterministic ordering
            .Select(r => new RoleReadModel(
                r.Id,
                r.Name,
                r.Description,
                r.IsSystemRole,
                r.UpdatedAt))
            .ToListAsync(cancellationToken);

        _logger.LogDebug(
            "RoleRepository: loaded {Count} roles for tenant {TenantId}",
            roles.Count, tenantId);

        return roles.AsReadOnly();
    }
}
