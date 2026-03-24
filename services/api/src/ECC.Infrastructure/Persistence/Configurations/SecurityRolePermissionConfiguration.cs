using ECC.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECC.Infrastructure.Persistence.Configurations;

public class SecurityRolePermissionConfiguration : IEntityTypeConfiguration<SecurityRolePermission>
{
    public void Configure(EntityTypeBuilder<SecurityRolePermission> builder)
    {
        builder.ToTable("SecurityDB_Security_Role_Permission");
        builder.HasKey(e => e.SecRoleId);
        builder.Property(e => e.RoleCode).HasMaxLength(20).IsRequired();
        builder.Property(e => e.RoleName).HasMaxLength(100).IsRequired();
        builder.Property(e => e.CreatedBy).HasMaxLength(100).IsRequired();
        builder.Property(e => e.UpdatedBy).HasMaxLength(100);
        builder.HasIndex(e => new { e.RoleCode, e.SolutionModuleId }).IsUnique();

        builder.HasOne(e => e.SolutionModule)
            .WithMany(m => m.RolePermissions)
            .HasForeignKey(e => e.SolutionModuleId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
