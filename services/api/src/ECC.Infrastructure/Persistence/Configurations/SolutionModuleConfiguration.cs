using ECC.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECC.Infrastructure.Persistence.Configurations;

public class SolutionModuleConfiguration : IEntityTypeConfiguration<SolutionModule>
{
    public void Configure(EntityTypeBuilder<SolutionModule> builder)
    {
        builder.ToTable("SecurityDB_Solution_Module");
        builder.HasKey(e => e.SolutionModuleId);
        builder.Property(e => e.SolutionCode).HasMaxLength(10).IsRequired();
        builder.Property(e => e.SolutionName).HasMaxLength(100).IsRequired();
        builder.Property(e => e.ModuleCode).HasMaxLength(10).IsRequired();
        builder.Property(e => e.ModuleName).HasMaxLength(100).IsRequired();
        builder.Property(e => e.Description).HasMaxLength(500).IsRequired();
        builder.Property(e => e.ModuleLead).HasMaxLength(200);
        builder.Property(e => e.DocumentationUrl).HasMaxLength(500);
        builder.Property(e => e.ModuleVersion).HasMaxLength(20);
        builder.Property(e => e.CreatedBy).HasMaxLength(100).IsRequired();
        builder.Property(e => e.UpdatedBy).HasMaxLength(100);
        builder.HasIndex(e => new { e.SolutionCode, e.ModuleCode }).IsUnique();
    }
}
