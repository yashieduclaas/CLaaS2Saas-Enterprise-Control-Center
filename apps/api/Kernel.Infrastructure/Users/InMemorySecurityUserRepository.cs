using System.Collections.Concurrent;
using System.Threading;
using Kernel.Application.Features.Users;
using Kernel.Domain.Entities;

namespace Kernel.Infrastructure.Users;

// ============================================================
// AI-GENERATED CODE - DO NOT MODIFY WITHOUT PROMPT RE-EXECUTION
// FEAT-ID:    FEAT-NNN
// TASK-ID:    T-NNN
// PROMPT-ID:  PR-NNN-infrastructure-users-in-memory-repository
// Generated:  2026-03-25 | ChatGPT REVIEW: PENDING
// ============================================================

/// <summary>
/// In-memory repository used until the infrastructure persistence layer is implemented.
/// </summary>
internal sealed class InMemorySecurityUserRepository : ISecurityUserRepository
{
    private readonly ConcurrentDictionary<string, SecurityUser> _users = new(StringComparer.OrdinalIgnoreCase);
    private int _nextId;

    public Task<SecurityUser?> GetByEntraEmailIdAsync(string entraEmailId, CancellationToken cancellationToken)
    {
        _users.TryGetValue(entraEmailId, out var user);
        return Task.FromResult(user is null ? null : Clone(user));
    }

    public Task<SecurityUser> AddAsync(SecurityUser user, CancellationToken cancellationToken)
    {
        var created = Clone(user);
        created.SecurityUserPid = Interlocked.Increment(ref _nextId);
        _users[created.EntraEmailId] = Clone(created);
        return Task.FromResult(Clone(created));
    }

    public Task UpdateAsync(SecurityUser user, CancellationToken cancellationToken)
    {
        _users[user.EntraEmailId] = Clone(user);
        return Task.CompletedTask;
    }

    public Task<IReadOnlyList<SecurityUser>> GetAllAsync(CancellationToken cancellationToken)
    {
        IReadOnlyList<SecurityUser> list = _users.Values
            .OrderBy(u => u.SecurityUserPid)
            .Select(Clone)
            .ToList();
        return Task.FromResult(list);
    }

    private static SecurityUser Clone(SecurityUser user) =>
        new()
        {
            SecurityUserPid = user.SecurityUserPid,
            EntraEmailId = user.EntraEmailId,
            DisplayName = user.DisplayName,
            OrgRole = user.OrgRole,
            ManagerEmailId = user.ManagerEmailId,
            ManagerName = user.ManagerName,
            IsActive = user.IsActive,
        };
}