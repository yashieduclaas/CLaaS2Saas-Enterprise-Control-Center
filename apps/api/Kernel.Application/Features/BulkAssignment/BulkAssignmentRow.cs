namespace Kernel.Application.Features.BulkAssignment;

/// <summary>
/// Represents a single parsed row from a bulk-assignment CSV upload.
/// Values are raw (trimmed only) — validation is handled in a separate pipeline step.
/// </summary>
/// <param name="Email">Raw email value from the CSV row.</param>
/// <param name="Role">Raw role value from the CSV row.</param>
public sealed record BulkAssignmentRow(string Email, string Role);
