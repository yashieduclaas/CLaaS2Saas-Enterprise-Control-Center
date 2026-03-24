namespace Kernel.Application.Features.BulkAssignment;

/// <summary>
/// Parses a CSV stream whose rows represent bulk role-assignment operations.
/// Parsing only — no validation of email format or role existence is performed here.
/// </summary>
public interface IBulkAssignmentCsvParserService
{
    /// <summary>
    /// Reads <paramref name="csvStream"/> and returns all parsed data rows.
    /// Expected CSV headers: <c>email</c>, <c>role</c> (case-insensitive).
    /// Rows with missing columns are included with empty strings; the stream is not disposed.
    /// </summary>
    /// <param name="csvStream">A readable stream positioned at the start of CSV content.</param>
    /// <returns>A list of <see cref="BulkAssignmentRow"/> — one entry per non-blank data row.</returns>
    IReadOnlyList<BulkAssignmentRow> Parse(Stream csvStream);
}
