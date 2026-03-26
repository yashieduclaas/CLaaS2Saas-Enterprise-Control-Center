using Kernel.Application.Abstractions;
using Kernel.Application.Authorization;
using Kernel.Domain.Entities;
using Kernel.Domain.Exceptions;
using MediatR;

namespace Kernel.Application.Features.Users;

// ============================================================
// AI-GENERATED CODE — DO NOT MODIFY WITHOUT PROMPT RE-EXECUTION
// FEAT-ID:    FEAT-NNN
// TASK-ID:    T-NNN
// PROMPT-ID:  PR-NNN-application-users-list
// Generated:  2026-03-25 | ChatGPT REVIEW: PENDING
// ============================================================

/// <summary>
/// Returns all security users visible to the resolved tenant.
/// </summary>
public sealed record ListUsersQuery() : IRequest<ListUsersResult>;

/// <summary>
/// DTO returned by <see cref="ListUsersQuery"/>.
/// </summary>
/// <param name="SecurityUserPid">Internal user identifier.</param>
/// <param name="EntraEmailId">Entra email identifier.</param>
/// <param name="DisplayName">User display name.</param>
/// <param name="OrgRole">Organizational role.</param>
/// <param name="ManagerEmailId">Manager email identifier.</param>
/// <param name="ManagerName">Manager display name.</param>
/// <param name="IsActive">Whether the user account is active.</param>
public sealed record UserDto(
    int SecurityUserPid,
    string EntraEmailId,
    string DisplayName,
    string? OrgRole,
    string? ManagerEmailId,
    string? ManagerName,
    bool IsActive);

/// <summary>
/// Result payload for <see cref="ListUsersQuery"/>.
/// </summary>
/// <param name="Users">Ordered list of security users.</param>
public sealed record ListUsersResult(IReadOnlyList<UserDto> Users);

/// <summary>
/// Handles <see cref="ListUsersQuery"/>.
/// </summary>
public sealed class ListUsersQueryHandler : IRequestHandler<ListUsersQuery, ListUsersResult>
{
    private const string NotAuthorizedMessage = "Caller is not authorized to list users.";

    private readonly ITenantContext _tenantContext;
    private readonly ICurrentPrincipalAccessor _currentPrincipalAccessor;
    private readonly IPermissionEvaluator _permissionEvaluator;
    private readonly ISecurityUserRepository _repository;

    /// <summary>
    /// Creates a new handler instance.
    /// </summary>
    public ListUsersQueryHandler(
        ITenantContext tenantContext,
        ICurrentPrincipalAccessor currentPrincipalAccessor,
        IPermissionEvaluator permissionEvaluator,
        ISecurityUserRepository repository)
    {
        _tenantContext = tenantContext;
        _currentPrincipalAccessor = currentPrincipalAccessor;
        _permissionEvaluator = permissionEvaluator;
        _repository = repository;
    }

    /// <summary>
    /// Executes the query.
    /// </summary>
    /// <param name="request">The query.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>All users for the resolved tenant.</returns>
    /// <exception cref="PermissionDeniedException">Thrown when the caller lacks read permission.</exception>
    public async Task<ListUsersResult> Handle(ListUsersQuery request, CancellationToken ct)
    {
        var tenantId = _tenantContext.TenantId;
        var principalId = _currentPrincipalAccessor.PrincipalId;

        if (!_tenantContext.IsResolved || string.IsNullOrWhiteSpace(tenantId) || string.IsNullOrWhiteSpace(principalId))
        {
            throw new PermissionDeniedException(NotAuthorizedMessage);
        }

        var authorization = await _permissionEvaluator.EvaluateBatchAsync(
            tenantId,
            principalId,
            [Permissions.AdminGlobal, Permissions.UsersRead, Permissions.UsersWrite],
            ct);

        var hasAccess =
            (authorization.TryGetValue(Permissions.AdminGlobal, out var isAdmin) && isAdmin) ||
            (authorization.TryGetValue(Permissions.UsersRead, out var canRead) && canRead) ||
            (authorization.TryGetValue(Permissions.UsersWrite, out var canWrite) && canWrite);

        if (!hasAccess)
        {
            throw new PermissionDeniedException(NotAuthorizedMessage);
        }

        var users = await _repository.GetAllAsync(ct);

        var dtos = users.Select(u => new UserDto(
            SecurityUserPid: u.SecurityUserPid,
            EntraEmailId: u.EntraEmailId,
            DisplayName: u.DisplayName,
            OrgRole: u.OrgRole,
            ManagerEmailId: u.ManagerEmailId,
            ManagerName: u.ManagerName,
            IsActive: u.IsActive)).ToList();

        return new ListUsersResult(dtos);
    }
}
