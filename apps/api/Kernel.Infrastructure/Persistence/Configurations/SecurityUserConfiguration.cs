using Kernel.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Kernel.Infrastructure.Persistence.Configurations;

// ============================================================
// AI-GENERATED CODE — DO NOT MODIFY WITHOUT PROMPT RE-EXECUTION
// FEAT-ID:    FEAT-NNN
// TASK-ID:    T-NNN
// PROMPT-ID:  PR-NNN-infrastructure-persistence-security-user-config
// Generated:  2026-03-25 | ChatGPT REVIEW: PENDING
// ============================================================

/// <summary>
/// EF Core Fluent API configuration for the <see cref="SecurityUser"/> entity.
/// Defines the explicit column mapping, constraints, and indexes for the
/// <c>security_users</c> table.
/// </summary>
public sealed class SecurityUserConfiguration : IEntityTypeConfiguration<SecurityUser>
{
    /// <inheritdoc />
    public void Configure(EntityTypeBuilder<SecurityUser> builder)
    {
        builder.ToTable("security_users");

        // ── Primary key ──────────────────────────────────────────────────────
        builder.HasKey(u => u.SecurityUserPid);

        builder.Property(u => u.SecurityUserPid)
            .HasColumnName("security_user_pid")
            .ValueGeneratedOnAdd();

        // ── Required columns ─────────────────────────────────────────────────
        builder.Property(u => u.EntraEmailId)
            .HasColumnName("entra_email_id")
            .IsRequired()
            .HasMaxLength(255);

        // The pre-created SecurityDB schema requires entra_oid (non-null).
        // It is not exposed on the domain entity yet, so map it as a shadow property.
        builder.Property<string>("EntraOid")
            .HasColumnName("entra_oid")
            .IsRequired()
            .HasMaxLength(36);

        // TenantId does not exist in the current pre-created schema.
        builder.Ignore(u => u.TenantId);

        // ── Optional columns ─────────────────────────────────────────────────
        // DisplayName is typed as non-nullable string on the entity; it maps
        // as a required column.  The max-length constraint is still applied.
        builder.Property(u => u.DisplayName)
            .HasColumnName("display_name")
            .HasMaxLength(255);

        builder.Property(u => u.OrgRole)
            .HasColumnName("org_role")
            .HasMaxLength(255);

        builder.Property(u => u.ManagerEmailId)
            .HasColumnName("manager_email_id")
            .HasMaxLength(255);

        builder.Property(u => u.ManagerName)
            .HasColumnName("manager_name")
            .HasMaxLength(255);

        // ── Defaults ─────────────────────────────────────────────────────────
        builder.Property(u => u.IsActive)
            .HasColumnName("is_active")
            .HasDefaultValue(true);

        // Required operational/audit fields in SecurityDB schema.
        builder.Property<DateTime>("CreatedAt")
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property<string>("CreatedBy")
            .HasColumnName("created_by")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property<bool>("DeletedFlag")
            .HasColumnName("deleted_flag")
            .HasDefaultValue(false)
            .IsRequired();

        // Optional update-tracking fields.
        builder.Property<DateTime?>("UpdatedAt")
            .HasColumnName("updated_at");

        builder.Property<string?>("UpdatedBy")
            .HasColumnName("updated_by")
            .HasMaxLength(255);

        // ── Indexes ──────────────────────────────────────────────────────────
        builder.HasIndex(u => u.EntraEmailId)
            .IsUnique()
            .HasDatabaseName("IX_security_users_entra_email_id");
    }
}
