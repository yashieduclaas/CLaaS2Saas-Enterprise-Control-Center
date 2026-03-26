using Kernel.Domain.Entities;

namespace Kernel.Application.Features.Users;

// ============================================================
// AI-GENERATED CODE - DO NOT MODIFY WITHOUT PROMPT RE-EXECUTION
// FEAT-ID:    FEAT-NNN
// TASK-ID:    T-NNN
// PROMPT-ID:  PR-NNN-application-users-repository
// Generated:  2026-03-25 | ChatGPT REVIEW: PENDING
// ============================================================

/// <summary>
/// Repository abstraction for security-user enrichment operations.
/// </summary>
public interface ISecurityUserRepository
{
    /// <summary>
    /// Finds a security user by normalized Entra email identifier.
    /// </summary>
    /// <param name="entraEmailId">Normalized Entra email identifier.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The matching user when found; otherwise <see langword="null"/>.</returns>
    Task<SecurityUser?> GetByEntraEmailIdAsync(string entraEmailId, CancellationToken cancellationToken);

    /// <summary>
    /// Persists a new security user.
    /// </summary>
    /// <param name="user">User to create.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created user including assigned identifier.</returns>
    Task<SecurityUser> AddAsync(SecurityUser user, CancellationToken cancellationToken);

    /// <summary>
    /// Persists enrichment changes for an existing security user.
    /// </summary>
    /// <param name="user">User to update.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task UpdateAsync(SecurityUser user, CancellationToken cancellationToken);

    /// <summary>
    /// Returns all security users visible to the resolved tenant, ordered by primary key.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Read-only list of users.</returns>
    Task<IReadOnlyList<SecurityUser>> GetAllAsync(CancellationToken cancellationToken);
}