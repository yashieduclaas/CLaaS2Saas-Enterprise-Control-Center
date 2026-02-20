// apps/api/src/Kernel.Infrastructure/Persistence/KernelDbContext.cs
using Kernel.Application.Tenant;
using Kernel.Domain.Roles;
using Microsoft.EntityFrameworkCore;

namespace Kernel.Infrastructure.Persistence;

/// <summary>
/// Application EF Core DbContext.
///
/// TENANT ISOLATION INVARIANTS (non-negotiable):
///   1. Every entity that is tenant-scoped has a <c>TenantId</c> property.
///   2. The global query filter for each tenant-scoped entity applies
///      <c>tenantId == _tenantId</c>. This filter is NEVER disabled.
///   3. <c>IgnoreQueryFilters()</c> is NEVER called in application or feature code.
///      Its use is restricted to platform-team migration scripts only, via a
///      a separate DbContext subclass not accessible to feature code.
///   4. <c>_tenantId</c> is resolved from <c>ITenantContextAccessor</c> at
///      DbContext construction time — it is immutable for the lifetime of the
///      request-scoped context.
/// </summary>
public sealed class KernelDbContext : DbContext
{
    private readonly string _tenantId;

    public KernelDbContext(
        DbContextOptions<KernelDbContext> options,
        ITenantContextAccessor tenantContextAccessor)
        : base(options)
    {
        // Defensive: empty string means no tenant filter matches — zero rows returned.
        // This is intentional. An unauthenticated DbContext returns nothing.
        _tenantId = tenantContextAccessor.Current?.TenantId ?? string.Empty;
    }

    public DbSet<Role> Roles => Set<Role>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("Roles");
            entity.HasKey(r => r.Id);

            entity.Property(r => r.TenantId)
                  .IsRequired()
                  .HasMaxLength(36);   // Entra tenant GUID

            entity.Property(r => r.Name)
                  .IsRequired()
                  .HasMaxLength(200);

            entity.Property(r => r.Description)
                  .HasMaxLength(1000);

            entity.Property(r => r.IsSystemRole)
                  .IsRequired();

            entity.Property(r => r.CreatedAt)
                  .IsRequired();

            entity.Property(r => r.UpdatedAt)
                  .IsRequired();

            // ── GLOBAL QUERY FILTER — TENANT ISOLATION ──────────────────────
            // This filter is applied to every LINQ query against Roles.
            // It is NOT a hint. It is enforced at the SQL generation layer.
            // NEVER call IgnoreQueryFilters() against this entity.
            entity.HasQueryFilter(r => r.TenantId == _tenantId);

            // Covering index for tenant-scoped list queries
            entity.HasIndex(r => r.TenantId)
                  .HasDatabaseName("IX_Roles_TenantId");
        });
    }
}
