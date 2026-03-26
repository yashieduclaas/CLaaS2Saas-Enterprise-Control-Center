namespace Kernel.Application.Audit;

// ============================================================
// AI-GENERATED CODE - DO NOT MODIFY WITHOUT PROMPT RE-EXECUTION
// FEAT-ID:    FEAT-NNN
// TASK-ID:    T-NNN
// PROMPT-ID:  PR-NNN-application-audit-queue
// Generated:  2026-03-25 | ChatGPT REVIEW: PENDING
// ============================================================

/// <summary>
/// Fire-and-forget audit queue contract for state-changing application operations.
/// </summary>
public interface IAuditQueue
{
    /// <summary>
    /// Enqueues an audit entry without blocking the request path.
    /// </summary>
    /// <param name="entry">Audit entry to enqueue.</param>
    void Enqueue(AuditEntry entry);
}

/// <summary>
/// Minimal audit payload for application commands.
/// </summary>
/// <param name="entity_type">Domain entity name.</param>
/// <param name="entity_pid">Entity identifier.</param>
/// <param name="action_type">Mutation verb.</param>
/// <param name="occurred_utc">UTC timestamp for the action.</param>
public sealed record AuditEntry(
    string entity_type,
    int entity_pid,
    string action_type,
    DateTimeOffset occurred_utc);