namespace Kernel.Application.Abstractions;

// ============================================================
// AI-GENERATED CODE - DO NOT MODIFY WITHOUT PROMPT RE-EXECUTION
// FEAT-ID:    FEAT-NNN
// TASK-ID:    T-NNN
// PROMPT-ID:  PR-NNN-application-auth-current-principal
// Generated:  2026-03-25 | ChatGPT REVIEW: PENDING
// ============================================================

/// <summary>
/// Provides access to the current caller identity without leaking HTTP concerns into the application layer.
/// </summary>
public interface ICurrentPrincipalAccessor
{
    /// <summary>The current principal identifier, or <see langword="null"/> when unavailable.</summary>
    string? PrincipalId { get; }
}