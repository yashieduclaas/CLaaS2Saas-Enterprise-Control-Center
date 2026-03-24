using ECC.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECC.Infrastructure.Persistence.Configurations;

public class AuditSessionConfiguration : IEntityTypeConfiguration<AuditSession>
{
    public void Configure(EntityTypeBuilder<AuditSession> builder)
    {
        builder.ToTable("SecurityDB_Audit_Session");
        builder.HasKey(e => e.AuditSessionId);
        builder.Property(e => e.EntraEmailId).HasMaxLength(320);
        builder.Property(e => e.IpAddress).HasMaxLength(45);
        builder.Property(e => e.DeviceInfo).HasMaxLength(500);
        builder.Property(e => e.Location).HasMaxLength(200);
        builder.Property(e => e.SessionTokenId).HasMaxLength(200);
        builder.Property(e => e.Reason).HasMaxLength(500);
        builder.Property(e => e.CreatedBy).HasMaxLength(100).IsRequired();
        builder.Property(e => e.UpdatedBy).HasMaxLength(100);
        builder.HasIndex(e => e.UserId);

        builder.HasOne(e => e.User)
            .WithMany()
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.SolutionModule)
            .WithMany()
            .HasForeignKey(e => e.SolutionModuleId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
