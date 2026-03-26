using System.Reflection;
using Kernel.Domain.Entities;
using Kernel.Infrastructure.Persistence.Models;
using Microsoft.EntityFrameworkCore;

namespace Kernel.Infrastructure.Persistence;

// ============================================================
// AI-GENERATED CODE - DO NOT MODIFY WITHOUT PROMPT RE-EXECUTION
// FEAT-ID:    FEAT-NNN
// TASK-ID:    T-NNN
// PROMPT-ID:  PR-NNN-infrastructure-persistence-app-dbcontext
// Generated:  2026-03-25 | ChatGPT REVIEW: PENDING
// ============================================================

/// <summary>
/// Entity Framework Core database context for infrastructure persistence.
/// </summary>
public sealed class AppDbContext : DbContext
{
    /// <summary>
    /// Creates a new <see cref="AppDbContext"/> instance.
    /// </summary>
    /// <param name="options">Configured EF Core options.</param>
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    /// <summary>
    /// Security users table set.
    /// </summary>
    public DbSet<SecurityUser> SecurityUsers => Set<SecurityUser>();

    /// <summary>
    /// Audit logs table set.
    /// </summary>
    public DbSet<AuditLogEntry> AuditLogs => Set<AuditLogEntry>();

    /// <inheritdoc />
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}
