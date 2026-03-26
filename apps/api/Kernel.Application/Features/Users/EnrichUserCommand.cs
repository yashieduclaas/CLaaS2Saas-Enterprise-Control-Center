using Kernel.Application.Abstractions;
using Kernel.Application.Audit;
using Kernel.Application.Authorization;
using Kernel.Domain.Entities;
using Kernel.Domain.Exceptions;
using MediatR;

namespace Kernel.Application.Features.Users;

// ============================================================
// AI-GENERATED CODE - DO NOT MODIFY WITHOUT PROMPT RE-EXECUTION
// FEAT-ID:    FEAT-NNN
// TASK-ID:    T-NNN
// PROMPT-ID:  PR-NNN-application-users-enrich
// Generated:  2026-03-25 | ChatGPT REVIEW: PENDING
// ============================================================

/// <summary>
/// Upserts a security user by Entra email identifier using enrichment data.
/// </summary>
/// <param name="entra_email_id">Unique Entra email identifier used for lookup.</param>
/// <param name="display_name">Display name used when a new user is created.</param>
/// <param name="org_role">Organization role enrichment value.</param>
/// <param name="manager_email_id">Manager email enrichment value.</param>
/// <param name="manager_name">Manager name enrichment value.</param>
/// <param name="is_active">Active flag to persist.</param>
public sealed record EnrichUserCommand(
    string entra_email_id,
    string display_name,
    string? org_role,
    string? manager_email_id,
    string? manager_name,
    bool is_active) : IRequest<EnrichUserResult>;

/// <summary>
/// Result for the enrich-user upsert operation.
/// </summary>
/// <param name="security_user_pid">Internal user identifier.</param>
/// <param name="is_created">Whether the operation created a new user.</param>
public sealed record EnrichUserResult(int security_user_pid, bool is_created);

/// <summary>
/// Handles <see cref="EnrichUserCommand"/> requests.
/// </summary>
public sealed class EnrichUserCommandHandler : IRequestHandler<EnrichUserCommand, EnrichUserResult>
{
    private const string NotAuthorizedMessage = "Caller is not authorized to enrich users.";

    private readonly ITenantContext _tenantContext;
    private readonly ICurrentPrincipalAccessor _currentPrincipalAccessor;
    private readonly IPermissionEvaluator _permissionEvaluator;
    private readonly ISecurityUserRepository _securityUserRepository;
    private readonly IAuditQueue _auditQueue;

    /// <summary>
    /// Creates a new instance of the handler.
    /// </summary>
    public EnrichUserCommandHandler(
        ITenantContext tenantContext,
        ICurrentPrincipalAccessor currentPrincipalAccessor,
        IPermissionEvaluator permissionEvaluator,
        ISecurityUserRepository securityUserRepository,
        IAuditQueue auditQueue)
    {
        _tenantContext = tenantContext;
        _currentPrincipalAccessor = currentPrincipalAccessor;
        _permissionEvaluator = permissionEvaluator;
        _securityUserRepository = securityUserRepository;
        _auditQueue = auditQueue;
    }

    /// <summary>
    /// Upserts a security user by Entra email identifier.
    /// </summary>
    /// <param name="request">Enrichment payload.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>The created or updated user identifier and create flag.</returns>
    /// <exception cref="PermissionDeniedException">Thrown when the caller does not hold admin permissions.</exception>
    public async Task<EnrichUserResult> Handle(EnrichUserCommand request, CancellationToken ct)
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
            [Permissions.AdminGlobal, Permissions.UsersWrite],
            ct);

        if (!authorization.TryGetValue(Permissions.AdminGlobal, out var isGlobalAdmin))
        {
            isGlobalAdmin = false;
        }

        if (!authorization.TryGetValue(Permissions.UsersWrite, out var isUsersAdmin))
        {
            isUsersAdmin = false;
        }

        if (!isGlobalAdmin && !isUsersAdmin)
        {
            throw new PermissionDeniedException(NotAuthorizedMessage);
        }

        var normalizedEntraEmailId = NormalizeRequiredEmail(request.entra_email_id);
        var normalizedManagerEmailId = NormalizeOptionalEmail(request.manager_email_id);
        var normalizedManagerName = NormalizeOptionalText(request.manager_name);
        var normalizedOrgRole = NormalizeOptionalText(request.org_role);

        var existingUser = await _securityUserRepository.GetByEntraEmailIdAsync(normalizedEntraEmailId, ct);
        if (existingUser is null)
        {
            var createdUser = await _securityUserRepository.AddAsync(
                new SecurityUser
                {
                    EntraEmailId = normalizedEntraEmailId,
                    DisplayName = request.display_name.Trim(),
                    OrgRole = normalizedOrgRole,
                    ManagerEmailId = normalizedManagerEmailId,
                    ManagerName = normalizedManagerName,
                    IsActive = request.is_active,
                },
                ct);

            _auditQueue.Enqueue(new AuditEntry(
                entity_type: nameof(SecurityUser),
                entity_pid: createdUser.SecurityUserPid,
                action_type: "CREATE",
                occurred_utc: DateTimeOffset.UtcNow));

            return new EnrichUserResult(createdUser.SecurityUserPid, is_created: true);
        }

        existingUser.OrgRole = normalizedOrgRole;
        existingUser.ManagerEmailId = normalizedManagerEmailId;
        existingUser.ManagerName = normalizedManagerName;
        existingUser.DisplayName = request.display_name?.Trim() ?? string.Empty;
        existingUser.IsActive = request.is_active;

        await _securityUserRepository.UpdateAsync(existingUser, ct);

        _auditQueue.Enqueue(new AuditEntry(
            entity_type: nameof(SecurityUser),
            entity_pid: existingUser.SecurityUserPid,
            action_type: "UPDATE",
            occurred_utc: DateTimeOffset.UtcNow));

        return new EnrichUserResult(existingUser.SecurityUserPid, is_created: false);
    }

    private static string NormalizeRequiredEmail(string value) => value.Trim().ToLowerInvariant();

    private static string? NormalizeOptionalEmail(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim().ToLowerInvariant();

    private static string? NormalizeOptionalText(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}