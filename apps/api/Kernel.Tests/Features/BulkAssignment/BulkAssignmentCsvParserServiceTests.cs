using System.Text;
using Kernel.Application.Features.BulkAssignment;
using Xunit;

namespace Kernel.Tests.Features.BulkAssignment;

public sealed class BulkAssignmentCsvParserServiceTests
{
    private readonly IBulkAssignmentCsvParserService _sut = new BulkAssignmentCsvParserService();

    private static Stream ToStream(string content) =>
        new MemoryStream(Encoding.UTF8.GetBytes(content));

    // -------------------------------------------------------------------------
    // Happy-path parsing
    // -------------------------------------------------------------------------

    [Fact]
    public void Parse_StandardCsv_ReturnsMappedRows()
    {
        const string csv = "email,role\nalice@example.com,Admin\nbob@example.com,ReadOnly";

        var result = _sut.Parse(ToStream(csv));

        Assert.Equal(2, result.Count);
        Assert.Equal("alice@example.com", result[0].Email);
        Assert.Equal("Admin",             result[0].Role);
        Assert.Equal("bob@example.com",   result[1].Email);
        Assert.Equal("ReadOnly",          result[1].Role);
    }

    [Fact]
    public void Parse_TrimsWhitespace_FromAllValues()
    {
        const string csv = "email , role\n  alice@example.com ,  Admin  \n  bob@example.com  ,  User  ";

        var result = _sut.Parse(ToStream(csv));

        Assert.Equal(2, result.Count);
        Assert.Equal("alice@example.com", result[0].Email);
        Assert.Equal("Admin",             result[0].Role);
        Assert.Equal("bob@example.com",   result[1].Email);
        Assert.Equal("User",              result[1].Role);
    }

    [Fact]
    public void Parse_CaseInsensitiveHeaders_ResolvedCorrectly()
    {
        const string csv = "EMAIL,ROLE\nalice@example.com,Admin";

        var result = _sut.Parse(ToStream(csv));

        Assert.Single(result);
        Assert.Equal("alice@example.com", result[0].Email);
        Assert.Equal("Admin",             result[0].Role);
    }

    [Fact]
    public void Parse_MixedCaseHeaders_ResolvedCorrectly()
    {
        const string csv = "Email,Role\nalice@example.com,Admin";

        var result = _sut.Parse(ToStream(csv));

        Assert.Single(result);
        Assert.Equal("alice@example.com", result[0].Email);
    }

    [Fact]
    public void Parse_ColumnsInReverseOrder_ResolvedCorrectly()
    {
        const string csv = "role,email\nAdmin,alice@example.com";

        var result = _sut.Parse(ToStream(csv));

        Assert.Single(result);
        Assert.Equal("alice@example.com", result[0].Email);
        Assert.Equal("Admin",             result[0].Role);
    }

    // -------------------------------------------------------------------------
    // Quoted fields (RFC 4180)
    // -------------------------------------------------------------------------

    [Fact]
    public void Parse_QuotedFieldWithComma_ParsedCorrectly()
    {
        const string csv = "email,role\n\"alice,bob@example.com\",Admin";

        var result = _sut.Parse(ToStream(csv));

        Assert.Single(result);
        Assert.Equal("alice,bob@example.com", result[0].Email);
        Assert.Equal("Admin",                 result[0].Role);
    }

    [Fact]
    public void Parse_QuotedFieldWithEscapedDoubleQuote_ParsedCorrectly()
    {
        const string csv = "email,role\n\"alice\"\"quoted\"\"@example.com\",Admin";

        var result = _sut.Parse(ToStream(csv));

        Assert.Single(result);
        Assert.Equal("alice\"quoted\"@example.com", result[0].Email);
    }

    // -------------------------------------------------------------------------
    // Missing / incomplete values
    // -------------------------------------------------------------------------

    [Fact]
    public void Parse_MissingRoleValue_ReturnsEmptyRole()
    {
        const string csv = "email,role\nalice@example.com,";

        var result = _sut.Parse(ToStream(csv));

        Assert.Single(result);
        Assert.Equal("alice@example.com", result[0].Email);
        Assert.Equal(string.Empty,        result[0].Role);
    }

    [Fact]
    public void Parse_MissingEmailValue_ReturnsEmptyEmail()
    {
        const string csv = "email,role\n,Admin";

        var result = _sut.Parse(ToStream(csv));

        Assert.Single(result);
        Assert.Equal(string.Empty, result[0].Email);
        Assert.Equal("Admin",      result[0].Role);
    }

    [Fact]
    public void Parse_BothValuesMissing_ReturnsBothEmpty()
    {
        const string csv = "email,role\n,";

        var result = _sut.Parse(ToStream(csv));

        Assert.Single(result);
        Assert.Equal(string.Empty, result[0].Email);
        Assert.Equal(string.Empty, result[0].Role);
    }

    [Fact]
    public void Parse_UnknownHeaders_ReturnsEmptyStrings()
    {
        const string csv = "name,department\nalice,Engineering";

        var result = _sut.Parse(ToStream(csv));

        Assert.Single(result);
        Assert.Equal(string.Empty, result[0].Email);
        Assert.Equal(string.Empty, result[0].Role);
    }

    [Fact]
    public void Parse_ExtraColumns_IgnoredGracefully()
    {
        const string csv = "email,role,notes\nalice@example.com,Admin,some free text";

        var result = _sut.Parse(ToStream(csv));

        Assert.Single(result);
        Assert.Equal("alice@example.com", result[0].Email);
        Assert.Equal("Admin",             result[0].Role);
    }

    // -------------------------------------------------------------------------
    // Edge cases
    // -------------------------------------------------------------------------

    [Fact]
    public void Parse_EmptyStream_ReturnsEmptyList()
    {
        var result = _sut.Parse(ToStream(string.Empty));

        Assert.Empty(result);
    }

    [Fact]
    public void Parse_HeaderOnlyNoDataRows_ReturnsEmptyList()
    {
        var result = _sut.Parse(ToStream("email,role"));

        Assert.Empty(result);
    }

    [Fact]
    public void Parse_BlankLinesBetweenDataRows_AreSkipped()
    {
        const string csv = "email,role\nalice@example.com,Admin\n\nbob@example.com,ReadOnly";

        var result = _sut.Parse(ToStream(csv));

        Assert.Equal(2, result.Count);
    }

    // -------------------------------------------------------------------------
    // Scale
    // -------------------------------------------------------------------------

    [Fact]
    public void Parse_LargeFile_1000Rows_HandledCorrectly()
    {
        var sb = new StringBuilder("email,role\n");
        for (int i = 0; i < 1000; i++)
            sb.Append($"user{i}@example.com,Role{i % 5}\n");

        var result = _sut.Parse(ToStream(sb.ToString()));

        Assert.Equal(1000, result.Count);
        Assert.Equal("user0@example.com",   result[0].Email);
        Assert.Equal("user999@example.com", result[999].Email);
    }
}
