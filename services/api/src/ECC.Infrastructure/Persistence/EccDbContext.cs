using ECC.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ECC.Infrastructure.Persistence;

/// <summary>
/// EF Core DbContext for the ECC Security Database.
/// </summary>
public class EccDbContext : DbContext
{
    public EccDbContext(DbContextOptions<EccDbContext> options) : base(options) { }

    public DbSet<SecurityUser> SecurityUsers => Set<SecurityUser>();
    public DbSet<SolutionModule> SolutionModules => Set<SolutionModule>();
    public DbSet<SecurityRolePermission> SecurityRolePermissions => Set<SecurityRolePermission>();
    public DbSet<SecurityUserRole> SecurityUserRoles => Set<SecurityUserRole>();
    public DbSet<AuditSession> AuditSessions => Set<AuditSession>();
    public DbSet<AuditActionLog> AuditActionLogs => Set<AuditActionLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(EccDbContext).Assembly);
    }
}
