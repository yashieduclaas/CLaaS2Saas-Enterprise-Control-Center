using ECC.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECC.Infrastructure.Persistence.Configurations;

public class SecurityUserRoleConfiguration : IEntityTypeConfiguration<SecurityUserRole>
{
    public void Configure(EntityTypeBuilder<SecurityUserRole> builder)
    {
        builder.ToTable("SecurityDB_Security_User_Role");
        builder.HasKey(e => e.UserRoleId);
        builder.Property(e => e.CreatedBy).HasMaxLength(100).IsRequired();
        builder.Property(e => e.UpdatedBy).HasMaxLength(100);

        // Filtered unique index: one active assignment per user + module + role
        builder.HasIndex(e => new { e.UserId, e.SolutionModuleId, e.SecRoleId })
            .HasFilter("[IsActive] = 1")
            .IsUnique();

        builder.HasOne(e => e.User)
            .WithMany(u => u.UserRoles)
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.SolutionModule)
            .WithMany(m => m.UserRoles)
            .HasForeignKey(e => e.SolutionModuleId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.RolePermission)
            .WithMany(rp => rp.UserRoles)
            .HasForeignKey(e => e.SecRoleId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
