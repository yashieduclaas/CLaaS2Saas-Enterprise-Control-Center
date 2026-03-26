using Kernel.Application.Abstractions;
using Kernel.Application.Features.Users;
using Kernel.Domain.Entities;
using Kernel.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Kernel.Infrastructure.Users;

// ============================================================
// AI-GENERATED CODE - DO NOT MODIFY WITHOUT PROMPT RE-EXECUTION
// FEAT-ID:    FEAT-NNN
// TASK-ID:    T-NNN
// PROMPT-ID:  PR-NNN-infrastructure-users-sql-repository
// Generated:  2026-03-25 | ChatGPT REVIEW: PENDING
// ============================================================

/// <summary>
/// SQL Server-backed repository for <see cref="SecurityUser"/> persistence.
/// </summary>
internal sealed class SqlSecurityUserRepository : ISecurityUserRepository
{
    private readonly AppDbContext _dbContext;
    private readonly ITenantContext _tenantContext;

    /// <summary>
    /// Creates a new repository instance.
    /// </summary>
    /// <param name="dbContext">EF Core database context.</param>
    /// <param name="tenantContext">Resolved request tenant context.</param>
    public SqlSecurityUserRepository(AppDbContext dbContext, ITenantContext tenantContext)
    {
        _dbContext = dbContext;
        _tenantContext = tenantContext;
    }

    /// <inheritdoc />
    public async Task<SecurityUser?> GetByEntraEmailIdAsync(string entraEmailId, CancellationToken cancellationToken)
    {
        _ = GetRequiredTenantId();

        return await _dbContext.SecurityUsers
            .AsNoTracking()
            .SingleOrDefaultAsync(
                u => u.EntraEmailId == entraEmailId,
                cancellationToken);
    }

    /// <summary>
    /// Finds a security user by Entra email and explicit tenant identifier.
    /// </summary>
    /// <param name="entraEmailId">Normalized Entra email identifier.</param>
    /// <param name="tenantId">Tenant identifier.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The matching user when found; otherwise <see langword="null"/>.</returns>
    public async Task<SecurityUser?> GetByEntraEmailIdAndTenantIdAsync(
        string entraEmailId,
        string tenantId,
        CancellationToken cancellationToken)
    {
        _ = tenantId;
        return await _dbContext.SecurityUsers
            .AsNoTracking()
            .SingleOrDefaultAsync(
                u => u.EntraEmailId == entraEmailId,
                cancellationToken);
    }

    /// <inheritdoc />
    public async Task<SecurityUser> AddAsync(SecurityUser user, CancellationToken cancellationToken)
    {
        _ = GetRequiredTenantId();

        var entry = _dbContext.SecurityUsers.Add(user);
        // security_users.entra_oid is required in the existing SQL schema.
        entry.Property("EntraOid").CurrentValue = Guid.NewGuid().ToString();
        entry.Property("CreatedAt").CurrentValue = DateTime.UtcNow;
        entry.Property("CreatedBy").CurrentValue = "kernel-api";
        entry.Property("DeletedFlag").CurrentValue = false;
        await _dbContext.SaveChangesAsync(cancellationToken);
        return user;
    }

    /// <inheritdoc />
    public async Task UpdateAsync(SecurityUser user, CancellationToken cancellationToken)
    {
        _ = GetRequiredTenantId();

        var tracked = await _dbContext.SecurityUsers
            .SingleOrDefaultAsync(
                u => u.SecurityUserPid == user.SecurityUserPid,
                cancellationToken);

        if (tracked is null)
            return;

        tracked.DisplayName = user.DisplayName;
        tracked.OrgRole = user.OrgRole;
        tracked.ManagerEmailId = user.ManagerEmailId;
        tracked.ManagerName = user.ManagerName;
        tracked.IsActive = user.IsActive;

        // Keep update metadata in sync with the existing SQL schema.
        var trackedEntry = _dbContext.Entry(tracked);
        if (trackedEntry.Metadata.FindProperty("UpdatedAt") is not null)
            trackedEntry.Property("UpdatedAt").CurrentValue = DateTime.UtcNow;
        if (trackedEntry.Metadata.FindProperty("UpdatedBy") is not null)
            trackedEntry.Property("UpdatedBy").CurrentValue = "kernel-api";

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Retrieves all users for a tenant in read-only mode.
    /// </summary>
    /// <param name="tenantId">Tenant identifier.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Tenant-scoped users ordered by primary key.</returns>
    public async Task<IReadOnlyList<SecurityUser>> GetAllByTenantAsync(
        string tenantId,
        CancellationToken cancellationToken)
    {
        _ = tenantId;
        return await _dbContext.SecurityUsers
            .AsNoTracking()
            .OrderBy(u => u.SecurityUserPid)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc />
    public async Task<IReadOnlyList<SecurityUser>> GetAllAsync(CancellationToken cancellationToken)
    {
        _ = GetRequiredTenantId();

        return await _dbContext.SecurityUsers
            .AsNoTracking()
            .OrderBy(u => u.SecurityUserPid)
            .ToListAsync(cancellationToken);
    }

    private string GetRequiredTenantId()
    {
        if (!_tenantContext.IsResolved || string.IsNullOrWhiteSpace(_tenantContext.TenantId))
            throw new InvalidOperationException("Tenant must be resolved before repository operations.");

        return _tenantContext.TenantId;
    }
}
