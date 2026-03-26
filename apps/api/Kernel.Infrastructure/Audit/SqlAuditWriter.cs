using Kernel.Application.Abstractions;
using Kernel.Application.Audit;
using Kernel.Infrastructure.Persistence;
using Kernel.Infrastructure.Persistence.Models;
using Microsoft.Extensions.Logging;

namespace Kernel.Infrastructure.Audit;

// ============================================================
// AI-GENERATED CODE - DO NOT MODIFY WITHOUT PROMPT RE-EXECUTION
// FEAT-ID:    FEAT-NNN
// TASK-ID:    T-NNN
// PROMPT-ID:  PR-NNN-infrastructure-audit-sql-writer
// Generated:  2026-03-25 | ChatGPT REVIEW: PENDING
// ============================================================

/// <summary>
/// SQL-backed audit queue implementation. Fire-and-forget: failures are logged but never block the request path.
/// </summary>
internal sealed class SqlAuditWriter : IAuditQueue
{
    private readonly AppDbContext _dbContext;
    private readonly ICurrentPrincipalAccessor _currentPrincipalAccessor;
    private readonly ILogger<SqlAuditWriter> _logger;

    /// <summary>
    /// Creates a new SQL audit writer.
    /// </summary>
    /// <param name="dbContext">EF Core context.</param>
    /// <param name="currentPrincipalAccessor">Current caller accessor.</param>
    /// <param name="logger">Logger for non-fatal audit write failures.</param>
    public SqlAuditWriter(
        AppDbContext dbContext,
        ICurrentPrincipalAccessor currentPrincipalAccessor,
        ILogger<SqlAuditWriter> logger)
    {
        _dbContext = dbContext;
        _currentPrincipalAccessor = currentPrincipalAccessor;
        _logger = logger;
    }

    /// <inheritdoc />
    /// <remarks>
    /// Per architecture contract: audit writes are fire-and-forget and must NEVER block or fail the originating request.
    /// If the write fails (e.g. missing audit session in demo mode), the error is logged as a warning only.
    /// </remarks>
    public void Enqueue(AuditEntry entry)
    {
        Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry<AuditLogEntry>? auditEntry = null;

        try
        {
            auditEntry = _dbContext.AuditLogs.Add(new AuditLogEntry
            {
                AuditSessionPid = 0,   // Placeholder: real implementation requires a resolved audit session
                SecurityUserPid = 0,   // Placeholder: real implementation requires a resolved security_user_pid
                ActionTimestamp = DateTime.UtcNow,
                ActionType = entry.action_type,
                EntityType = entry.entity_type,
                EntityPid = entry.entity_pid,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = _currentPrincipalAccessor.PrincipalId ?? "kernel-api",
                DeletedFlag = false,
            });

            _dbContext.SaveChanges();
        }
        catch (Exception ex)
        {
            if (auditEntry is not null)
            {
                auditEntry.State = Microsoft.EntityFrameworkCore.EntityState.Detached;
            }

            // Fire-and-forget: audit failures MUST NOT propagate to the caller.
            _logger.LogWarning(ex, "Audit write failed for entity_type={EntityType} entity_pid={EntityPid} action={Action}. This is non-fatal.",
                entry.entity_type, entry.entity_pid, entry.action_type);
        }
    }
}
