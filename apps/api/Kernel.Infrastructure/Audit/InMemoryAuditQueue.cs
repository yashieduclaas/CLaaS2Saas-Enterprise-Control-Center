using System.Collections.Concurrent;
using Kernel.Application.Audit;

namespace Kernel.Infrastructure.Audit;

// ============================================================
// AI-GENERATED CODE - DO NOT MODIFY WITHOUT PROMPT RE-EXECUTION
// FEAT-ID:    FEAT-NNN
// TASK-ID:    T-NNN
// PROMPT-ID:  PR-NNN-infrastructure-audit-in-memory-queue
// Generated:  2026-03-25 | ChatGPT REVIEW: PENDING
// ============================================================

/// <summary>
/// In-memory audit queue used by the shell implementation.
/// </summary>
internal sealed class InMemoryAuditQueue : IAuditQueue
{
    private readonly ConcurrentQueue<AuditEntry> _entries = new();

    public void Enqueue(AuditEntry entry)
    {
        _entries.Enqueue(entry);
    }
}