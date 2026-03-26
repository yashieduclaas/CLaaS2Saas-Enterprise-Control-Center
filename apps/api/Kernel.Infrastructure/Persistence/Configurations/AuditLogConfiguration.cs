using Kernel.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Kernel.Infrastructure.Persistence.Configurations;

// ============================================================
// AI-GENERATED CODE — DO NOT MODIFY WITHOUT PROMPT RE-EXECUTION
// FEAT-ID:    FEAT-NNN
// TASK-ID:    T-NNN
// PROMPT-ID:  PR-NNN-infrastructure-persistence-audit-log-config
// Generated:  2026-03-25 | ChatGPT REVIEW: PENDING
// ============================================================

/// <summary>
/// EF Core Fluent API configuration for the <see cref="AuditLogEntry"/> persistence model.
/// Defines the explicit column mapping and constraints for the append-only
/// <c>AuditLogs</c> table.
/// </summary>
public sealed class AuditLogConfiguration : IEntityTypeConfiguration<AuditLogEntry>
{
    /// <inheritdoc />
    public void Configure(EntityTypeBuilder<AuditLogEntry> builder)
    {
        builder.ToTable("audit_action_logs");

        // ── Primary key ──────────────────────────────────────────────────────
        builder.HasKey(a => a.AuditActionPid);
        builder.Property(a => a.AuditActionPid)
            .HasColumnName("audit_action_pid")
            .ValueGeneratedOnAdd();

        // ── Required columns ─────────────────────────────────────────────────
        builder.Property(a => a.AuditSessionPid)
            .HasColumnName("audit_session_pid")
            .IsRequired();

        builder.Property(a => a.SecurityUserPid)
            .HasColumnName("security_user_pid")
            .IsRequired();

        builder.Property(a => a.ActionTimestamp)
            .HasColumnName("action_timestamp")
            .HasColumnType("datetime2")
            .IsRequired();

        builder.Property(a => a.CreatedAt)
            .HasColumnName("created_at")
            .HasColumnType("datetime2")
            .IsRequired();

        builder.Property(a => a.CreatedBy)
            .HasColumnName("created_by")
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(a => a.DeletedFlag)
            .HasColumnName("deleted_flag")
            .IsRequired();

        // ── Optional columns ─────────────────────────────────────────────────
        builder.Property(a => a.ActionType)
            .HasColumnName("action_type")
            .HasMaxLength(100);

        builder.Property(a => a.ActionName)
            .HasColumnName("action_name")
            .HasMaxLength(255);

        builder.Property(a => a.EntityType)
            .HasColumnName("entity_type")
            .HasMaxLength(128);

        builder.Property(a => a.EntityPid)
            .HasColumnName("entity_pid");

        builder.Property(a => a.OldValue)
            .HasColumnName("old_value")
            .HasColumnType("nvarchar(max)");

        builder.Property(a => a.NewValue)
            .HasColumnName("new_value")
            .HasColumnType("nvarchar(max)");
    }
}
