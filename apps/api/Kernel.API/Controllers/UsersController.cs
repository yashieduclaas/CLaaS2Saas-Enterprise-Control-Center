using Kernel.Application.Features.Users;
using Kernel.Application.Authorization;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Kernel.API.Controllers;

// ============================================================
// AI-GENERATED CODE - DO NOT MODIFY WITHOUT PROMPT RE-EXECUTION
// FEAT-ID:    FEAT-NNN
// TASK-ID:    T-NNN
// PROMPT-ID:  PR-NNN-api-users-enrich-endpoint
// Generated:  2026-03-25 | ChatGPT REVIEW: PENDING
// ============================================================

/// <summary>
/// User-management endpoints.
/// </summary>
[ApiController]
[Route("api/v1/users")]
public sealed class UsersController : ControllerBase
{
    private readonly ISender _sender;

    public UsersController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>
    /// Returns all security users for the resolved tenant.
    /// </summary>
    [HttpGet]
    [Authorize(Policy = Policies.UsersRead)]
    [ProducesResponseType(typeof(ListUsersResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ListUsers(CancellationToken ct)
    {
        var result = await _sender.Send(new ListUsersQuery(), ct);
        return Ok(result);
    }

    /// <summary>
    /// Upserts a user with enrichment fields based on Entra email.
    /// </summary>
    [HttpPost("enrich")]
    [Authorize(Policy = Policies.UsersWrite)]
    [ProducesResponseType(typeof(EnrichUserResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> EnrichUser([FromBody] EnrichUserRequest request, CancellationToken ct)
    {
        var command = new EnrichUserCommand(request.EntraEmailId, request.DisplayName, request.OrgRole, request.ManagerEmailId, request.ManagerName, request.IsActive);
        var result = await _sender.Send(command, ct);
        return Ok(result);
    }

    /// <summary>
    /// Processes a CSV file for bulk user enrichment.
    /// </summary>
    [HttpPost("enrich/bulk")]
    [Authorize(Policy = Policies.UsersWrite)]
    [ProducesResponseType(typeof(BulkEnrichUsersResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(string), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> BulkEnrichUsers([FromForm] IFormFile? file, CancellationToken ct)
    {
        if (file is null) return BadRequest("File is required");
        if (file.Length == 0) return BadRequest("File is empty");
        if (!IsCsvFile(file.FileName)) return BadRequest("Invalid file type");
        if (file.Length > 5 * 1024 * 1024) return BadRequest("File too large; maximum 5 MB allowed");

        var startTime = DateTime.UtcNow;
        var parseResult = await ParseBulkItemsAsync(file, ct);
        var parseDurationMs = (DateTime.UtcNow - startTime).TotalMilliseconds;
        if (!parseResult.Success) return BadRequest(parseResult.Error);

        var commandResult = await _sender.Send(new BulkEnrichUsersCommand(parseResult.Items), ct);
        Response.Headers["X-Parse-Duration-Ms"] = parseDurationMs.ToString("F2");
        // TODO: Move metrics to telemetry system (App Insights / OpenTelemetry)
        var combinedErrors = commandResult.Errors
            .Concat(parseResult.ParseErrors)
            .DistinctBy(e => new { e.Row, e.EntraEmailId, e.Error })
            .ToList();
        var merged = new BulkEnrichUsersResult(
            Total: parseResult.TotalRows,
            Success: parseResult.TotalRows - combinedErrors.Count,
            Failed: combinedErrors.Count,
            Errors: combinedErrors);

        return Ok(merged);
    }

    private static bool IsCsvFile(string fileName) =>
        string.Equals(Path.GetExtension(fileName), ".csv", StringComparison.OrdinalIgnoreCase);

    private static async Task<CsvParseResult> ParseBulkItemsAsync(IFormFile file, CancellationToken ct)
    {
        var items = new List<BulkEnrichUserItem>();
        var parseErrors = new List<BulkError>();
        var totalRows = 0;

        using var stream = file.OpenReadStream();
        using var reader = new StreamReader(stream);

        var header = await reader.ReadLineAsync(ct);
        if (!IsValidHeader(header))
        {
            return CsvParseResult.Fail("Invalid CSV format: invalid CSV header format");
        }

        var rowNumber = 1;
        while (await reader.ReadLineAsync(ct) is { } line)
        {
            rowNumber++;
            totalRows++;
            if (string.IsNullOrWhiteSpace(line))
            {
                continue;
            }

            if (line.Contains('"'))
            {
                var firstColumn = line.Split(',')[0].Trim();
                var quoteEmail = string.IsNullOrWhiteSpace(firstColumn) ? "UNKNOWN" : firstColumn;
                parseErrors.Add(new BulkError(
                    Row: rowNumber,
                    EntraEmailId: quoteEmail,
                    Error: "Invalid CSV format: quoted values are not supported"));
                continue;
            }

            var parts = line.Split(',');
            var email = parts.Length > 0 && !string.IsNullOrWhiteSpace(parts[0])
                ? parts[0].Trim()
                : "UNKNOWN";

            if (parts.Length != 6)
            {
                parseErrors.Add(new BulkError(
                    Row: rowNumber,
                    EntraEmailId: email,
                    Error: "Invalid CSV format: expected 6 columns"));
                continue;
            }

            var entraEmailId = parts[0].Trim();
            var displayName = parts[1].Trim();
            var orgRole = ToNull(parts[2]);
            var managerEmailId = ToNull(parts[3]);
            var managerName = ToNull(parts[4]);

            if (string.IsNullOrWhiteSpace(entraEmailId) || string.IsNullOrWhiteSpace(displayName))
            {
                parseErrors.Add(new BulkError(
                    Row: rowNumber,
                    EntraEmailId: email,
                    Error: "Invalid CSV format: missing required fields (entra_email_id/display_name)"));
                continue;
            }

            if (!bool.TryParse(parts[5].Trim(), out var isActive))
            {
                parseErrors.Add(new BulkError(
                    Row: rowNumber,
                    EntraEmailId: email,
                    Error: "Invalid CSV format: invalid boolean value for is_active"));
                continue;
            }

            items.Add(new BulkEnrichUserItem(
                EntraEmailId: entraEmailId,
                DisplayName: displayName,
                OrgRole: orgRole,
                ManagerEmailId: managerEmailId,
                ManagerName: managerName,
                IsActive: isActive));

            if (items.Count > 1000)
            {
                return CsvParseResult.Fail("Invalid CSV format: file too large");
            }
        }

        return CsvParseResult.Ok(items, parseErrors, totalRows);
    }

    private static bool IsValidHeader(string? headerLine)
    {
        if (string.IsNullOrWhiteSpace(headerLine))
        {
            return false;
        }

        var header = headerLine.Split(',');
        if (header.Length != 6)
        {
            return false;
        }

        return string.Equals(header[0].Trim(), "entra_email_id", StringComparison.OrdinalIgnoreCase)
            && string.Equals(header[1].Trim(), "display_name", StringComparison.OrdinalIgnoreCase)
            && string.Equals(header[2].Trim(), "org_role", StringComparison.OrdinalIgnoreCase)
            && string.Equals(header[3].Trim(), "manager_email_id", StringComparison.OrdinalIgnoreCase)
            && string.Equals(header[4].Trim(), "manager_name", StringComparison.OrdinalIgnoreCase)
            && string.Equals(header[5].Trim(), "is_active", StringComparison.OrdinalIgnoreCase);
    }

    private static string? ToNull(string value)
    {
        var trimmed = value.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }

    private sealed record CsvParseResult(
        bool Success,
        List<BulkEnrichUserItem> Items,
        List<BulkError> ParseErrors,
        int TotalRows,
        string? Error)
    {
        public static CsvParseResult Ok(List<BulkEnrichUserItem> items, List<BulkError> parseErrors, int totalRows) =>
            new(true, items, parseErrors, totalRows, null);

        public static CsvParseResult Fail(string error) =>
            new(false, [], [], 0, error);
    }
}

/// <summary>
/// Request payload for user enrichment.
/// </summary>
public sealed record EnrichUserRequest(
    string EntraEmailId,
    string DisplayName,
    string? OrgRole,
    string? ManagerEmailId,
    string? ManagerName,
    bool IsActive);