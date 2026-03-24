using System.Text;

namespace Kernel.Application.Features.BulkAssignment;

/// <summary>
/// RFC 4180-compatible CSV parser for bulk role-assignment uploads.
/// <list type="bullet">
///   <item>Handles quoted fields containing commas and escaped double-quotes ("").</item>
///   <item>Header matching is case-insensitive; column order is not assumed.</item>
///   <item>All values are whitespace-trimmed after parsing.</item>
///   <item>Malformed or incomplete rows are never thrown; missing columns return an empty string.</item>
///   <item>Blank lines between data rows are silently skipped.</item>
/// </list>
/// </summary>
public sealed class BulkAssignmentCsvParserService : IBulkAssignmentCsvParserService
{
    /// <inheritdoc />
    public IReadOnlyList<BulkAssignmentRow> Parse(Stream csvStream)
    {
        using var reader = new StreamReader(csvStream, leaveOpen: true);

        // First line must be the header row.
        var headerLine = reader.ReadLine();
        if (headerLine is null)
            return Array.Empty<BulkAssignmentRow>();

        var headers    = SplitLine(headerLine);
        var emailIndex = FindHeader(headers, "email");
        var roleIndex  = FindHeader(headers, "role");

        var results = new List<BulkAssignmentRow>();

        string? line;
        while ((line = reader.ReadLine()) is not null)
        {
            if (string.IsNullOrWhiteSpace(line))
                continue;

            var fields = SplitLine(line);
            var email  = GetTrimmed(fields, emailIndex);
            var role   = GetTrimmed(fields, roleIndex);

            results.Add(new BulkAssignmentRow(email, role));
        }

        return results;
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /// <summary>Returns the 0-based index of the first header matching <paramref name="name"/>
    /// (case-insensitive, whitespace-trimmed), or -1 if not found.</summary>
    private static int FindHeader(IList<string> headers, string name)
    {
        for (int i = 0; i < headers.Count; i++)
        {
            if (string.Equals(headers[i].Trim(), name, StringComparison.OrdinalIgnoreCase))
                return i;
        }

        return -1;
    }

    /// <summary>Returns the trimmed value at <paramref name="index"/>, or <see cref="string.Empty"/>
    /// when the index is out of range or unknown (-1).</summary>
    private static string GetTrimmed(IList<string> fields, int index) =>
        index >= 0 && index < fields.Count ? fields[index].Trim() : string.Empty;

    /// <summary>
    /// Splits a single CSV line into raw field strings following RFC 4180:
    /// <list type="bullet">
    ///   <item>Fields may be optionally enclosed in double-quotes.</item>
    ///   <item>A double-quote inside a quoted field is escaped by a second double-quote ("").</item>
    ///   <item>Commas inside a quoted field are treated as literal characters, not delimiters.</item>
    /// </list>
    /// </summary>
    private static IList<string> SplitLine(string line)
    {
        var fields   = new List<string>();
        var current  = new StringBuilder(64);
        var inQuotes = false;

        for (int i = 0; i < line.Length; i++)
        {
            char c = line[i];

            if (inQuotes)
            {
                if (c == '"')
                {
                    // Peek: escaped quote ("") → emit single " and skip next char.
                    if (i + 1 < line.Length && line[i + 1] == '"')
                    {
                        current.Append('"');
                        i++;
                    }
                    else
                    {
                        // Closing quote — exit quoted-field mode.
                        inQuotes = false;
                    }
                }
                else
                {
                    current.Append(c);
                }
            }
            else
            {
                if (c == '"')
                {
                    inQuotes = true;
                }
                else if (c == ',')
                {
                    fields.Add(current.ToString());
                    current.Clear();
                }
                else
                {
                    current.Append(c);
                }
            }
        }

        // Always append the final field (handles lines without a trailing comma).
        fields.Add(current.ToString());
        return fields;
    }
}
