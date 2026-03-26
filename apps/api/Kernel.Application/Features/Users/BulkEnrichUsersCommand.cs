using Kernel.Application.Abstractions;
using Kernel.Application.Authorization;
using Kernel.Domain.Exceptions;
using MediatR;

namespace Kernel.Application.Features.Users;

// ============================================================
// AI-GENERATED CODE - DO NOT MODIFY WITHOUT PROMPT RE-EXECUTION
// FEAT-ID:    FEAT-NNN
// TASK-ID:    T-NNN
// PROMPT-ID:  PR-NNN-application-users-bulk-enrich
// Generated:  2026-03-25 | ChatGPT REVIEW: PENDING
// ============================================================

/// <summary>
/// Performs bulk user enrichment by reusing <see cref="EnrichUserCommand"/> for each input row.
/// </summary>
/// <param name="Items">Parsed enrichment rows to process.</param>
/// <param name="PreValidationErrors">Optional parser/validation errors provided by the controller.</param>
public sealed record BulkEnrichUsersCommand(
    List<BulkEnrichUserItem> Items,
    List<BulkError>? PreValidationErrors = null) : IRequest<BulkEnrichUsersResult>;

/// <summary>
/// Input model for a single bulk enrichment item.
/// </summary>
public sealed record BulkEnrichUserItem(
    string EntraEmailId,
    string DisplayName,
    string? OrgRole,
    string? ManagerEmailId,
    string? ManagerName,
    bool IsActive);

/// <summary>
/// Summary result for bulk enrichment execution.
/// </summary>
public sealed record BulkEnrichUsersResult(
    int Total,
    int Success,
    int Failed,
    List<BulkError> Errors);

/// <summary>
/// Row-level error details for bulk enrichment.
/// </summary>
public sealed record BulkError(
    int Row,
    string EntraEmailId,
    string Error);

/// <summary>
/// Handles <see cref="BulkEnrichUsersCommand"/> by dispatching one <see cref="EnrichUserCommand"/> per row.
/// </summary>
public sealed class BulkEnrichUsersCommandHandler : IRequestHandler<BulkEnrichUsersCommand, BulkEnrichUsersResult>
{
    private const string NotAuthorizedMessage = "Caller is not authorized to enrich users.";
    private const string RowFailedMessage = "Row processing failed.";

    private readonly ITenantContext _tenantContext;
    private readonly ICurrentPrincipalAccessor _currentPrincipalAccessor;
    private readonly IPermissionEvaluator _permissionEvaluator;
    private readonly ISender _sender;

    /// <summary>
    /// Creates a new instance of the bulk handler.
    /// </summary>
    public BulkEnrichUsersCommandHandler(
        ITenantContext tenantContext,
        ICurrentPrincipalAccessor currentPrincipalAccessor,
        IPermissionEvaluator permissionEvaluator,
        ISender sender)
    {
        _tenantContext = tenantContext;
        _currentPrincipalAccessor = currentPrincipalAccessor;
        _permissionEvaluator = permissionEvaluator;
        _sender = sender;
    }

    /// <summary>
    /// Processes each row with partial-success behavior and collects row-level failures.
    /// </summary>
    /// <param name="request">Bulk enrichment request.</param>
    /// <param name="ct">Cancellation token.</param>
    /// <returns>Bulk execution summary.</returns>
    /// <exception cref="PermissionDeniedException">Thrown when caller lacks admin/global-admin permission.</exception>
    public async Task<BulkEnrichUsersResult> Handle(BulkEnrichUsersCommand request, CancellationToken ct)
    {
        var tenantId = _tenantContext.TenantId;
        var principalId = _currentPrincipalAccessor.PrincipalId;

        if (!_tenantContext.IsResolved || string.IsNullOrWhiteSpace(tenantId) || string.IsNullOrWhiteSpace(principalId))
        {
            throw new PermissionDeniedException(NotAuthorizedMessage);
        }

        // Authorize once for the whole batch.
        var authorization = await _permissionEvaluator.EvaluateBatchAsync(
            tenantId,
            principalId,
            [Permissions.AdminGlobal, Permissions.UsersWrite],
            ct);

        var isGlobalAdmin = authorization.TryGetValue(Permissions.AdminGlobal, out var globalAdmin) && globalAdmin;
        var isUsersAdmin = authorization.TryGetValue(Permissions.UsersWrite, out var usersAdmin) && usersAdmin;

        if (!isGlobalAdmin && !isUsersAdmin)
        {
            throw new PermissionDeniedException(NotAuthorizedMessage);
        }

        var items = request.Items ?? [];
        var success = 0;
        var errors = new List<BulkError>();

        if (request.PreValidationErrors is not null)
        {
            foreach (var err in request.PreValidationErrors)
            {
                if (!errors.Any(e =>
                    e.Row == err.Row &&
                    e.EntraEmailId == err.EntraEmailId &&
                    e.Error == err.Error))
                {
                    errors.Add(err);
                }
            }
        }

        for (var i = 0; i < items.Count; i++)
        {
            ct.ThrowIfCancellationRequested();

            var item = items[i];
            try
            {
                await _sender.Send(new EnrichUserCommand(
                    item.EntraEmailId,
                    item.DisplayName,
                    item.OrgRole,
                    item.ManagerEmailId,
                    item.ManagerName,
                    item.IsActive), ct);

                success++;
            }
            catch (OperationCanceledException)
            {
                throw;
            }
            catch (Exception)
            {
                errors.Add(new BulkError(
                    Row: i + 1,
                    EntraEmailId: item.EntraEmailId,
                    Error: RowFailedMessage));
            }
        }

        return new BulkEnrichUsersResult(
            Total: items.Count,
            Success: success,
            Failed: errors.Count,
            Errors: errors);
    }
}
