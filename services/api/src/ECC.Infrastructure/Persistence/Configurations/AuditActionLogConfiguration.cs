using ECC.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECC.Infrastructure.Persistence.Configurations;

public class AuditActionLogConfiguration : IEntityTypeConfiguration<AuditActionLog>
{
    public void Configure(EntityTypeBuilder<AuditActionLog> builder)
    {
        builder.ToTable("SecurityDB_Audit_Action_Log");
        builder.HasKey(e => e.AuditActionId);
        builder.Property(e => e.ActionName).HasMaxLength(200).IsRequired();
        builder.Property(e => e.PermissionCode).HasMaxLength(50);
        builder.Property(e => e.ActionStatus).HasMaxLength(50).IsRequired();
        builder.Property(e => e.AdditionalInfo).HasMaxLength(2000);
        builder.Property(e => e.CreatedBy).HasMaxLength(100).IsRequired();
        builder.Property(e => e.UpdatedBy).HasMaxLength(100);
        builder.HasIndex(e => e.AuditSessionId);
        builder.HasIndex(e => e.UserId);

        builder.HasOne(e => e.AuditSession)
            .WithMany(s => s.ActionLogs)
            .HasForeignKey(e => e.AuditSessionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
