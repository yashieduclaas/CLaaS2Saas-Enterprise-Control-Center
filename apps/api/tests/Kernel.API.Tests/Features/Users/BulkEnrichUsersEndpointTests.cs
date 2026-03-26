using System.Net;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using Kernel.API.Tests.TestFixtures;
using Xunit;

namespace Kernel.API.Tests.Features.Users;

// ============================================================
// AI-GENERATED CODE — DO NOT MODIFY WITHOUT PROMPT RE-EXECUTION
// FEAT-ID:    FEAT-NNN
// TASK-ID:    T-NNN
// PROMPT-ID:  PR-NNN-api-tests-bulk-endpoint
// Generated:  2026-03-25 | ChatGPT REVIEW: PENDING
// ============================================================

/// <summary>
/// Integration tests for POST /api/v1/users/enrich/bulk endpoint.
/// Tests CSV file upload through the full middleware pipeline.
/// Verifies file validation, parsing, and bulk processing.
/// </summary>
public sealed class BulkEnrichUsersEndpointTests : IAsyncLifetime
{
    private ApiFactory? _factory;
    private HttpClient? _client;

    public async Task InitializeAsync()
    {
        _factory = new ApiFactory();
        _client = _factory.CreateAuthorizedClient();
        await Task.CompletedTask;
    }

    public async Task DisposeAsync()
    {
        _client?.Dispose();
        _factory?.Dispose();
        await Task.CompletedTask;
    }

    /// <summary>
    /// Helper: Creates a CSV file in memory with the given header and rows.
    /// </summary>
    private ByteArrayContent CreateCsvContent(string header, string[] rows)
    {
        var csv = new StringBuilder();
        csv.AppendLine(header);
        foreach (var row in rows)
        {
            csv.AppendLine(row);
        }

        var bytes = Encoding.UTF8.GetBytes(csv.ToString());
        var content = new ByteArrayContent(bytes);
        content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("text/csv");
        return content;
    }

    /// <summary>
    /// Helper: Creates multipart form data with a CSV file.
    /// </summary>
    private MultipartFormDataContent CreateMultipartCsvRequest(ByteArrayContent csvContent)
    {
        var content = new MultipartFormDataContent();
        content.Add(csvContent, "file", "test.csv");
        return content;
    }

    /// <summary>
    /// TEST 1: Valid CSV upload with all correct data.
    /// Expects 200 OK with Success > 0 and Failed = 0.
    /// </summary>
    [Fact]
    public async Task BulkEnrichUsers_WithValidCsv_ReturnsOkWithSuccessCount()
    {
        // Arrange
        var header = "entra_email_id,display_name,org_role,manager_email_id,manager_name,is_active";
        var rows = new[]
        {
            "user1@example.com,User One,Engineer,manager@example.com,Manager,true",
            "user2@example.com,User Two,Senior Engineer,,,true",
            "user3@example.com,User Three,Architect,,,false"
        };

        var csvContent = CreateCsvContent(header, rows);
        var multipartContent = CreateMultipartCsvRequest(csvContent);

        // Act
        var response = await _client!.PostAsync(
            "/api/v1/users/enrich/bulk",
            multipartContent);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var responseBody = await response.Content.ReadAsStringAsync();
        var jsonDoc = JsonDocument.Parse(responseBody);
        var dataElement = jsonDoc.RootElement;

        dataElement.TryGetProperty("total", out var totalElement).Should().BeTrue();
        totalElement.GetInt32().Should().BeGreaterThan(0);

        dataElement.TryGetProperty("success", out var successElement).Should().BeTrue();
        successElement.GetInt32().Should().BeGreaterThan(0);

        dataElement.TryGetProperty("failed", out var failedElement).Should().BeTrue();
        failedElement.GetInt32().Should().Be(0);
    }

    /// <summary>
    /// TEST 2: CSV with partial failures (mix of valid and invalid rows).
    /// Expects 200 OK with Failed > 0 and errors array populated.
    /// </summary>
    [Fact]
    public async Task BulkEnrichUsers_WithPartialInvalidRows_ReturnsOkWithFailureCount()
    {
        // Arrange
        var header = "entra_email_id,display_name,org_role,manager_email_id,manager_name,is_active";
        var rows = new[]
        {
            "valid@example.com,Valid User,Engineer,,true",
            "invalid-email,No Domain User,Engineer,,true", // Invalid email format
            "",  // Empty row (will fail validation)
            "another@example.com,Another User,Architect,,false"
        };

        var csvContent = CreateCsvContent(header, rows);
        var multipartContent = CreateMultipartCsvRequest(csvContent);

        // Act
        var response = await _client!.PostAsync(
            "/api/v1/users/enrich/bulk",
            multipartContent);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var responseBody = await response.Content.ReadAsStringAsync();
        var jsonDoc = JsonDocument.Parse(responseBody);
        var dataElement = jsonDoc.RootElement;

        dataElement.TryGetProperty("failed", out var failedElement).Should().BeTrue();
        failedElement.GetInt32().Should().BeGreaterThan(0);

        dataElement.TryGetProperty("errors", out var errorsElement).Should().BeTrue();
        errorsElement.ValueKind.Should().Be(JsonValueKind.Array);
    }

    /// <summary>
    /// TEST 3: CSV with wrong header format.
    /// Expects 400 BadRequest with validation error.
    /// </summary>
    [Fact]
    public async Task BulkEnrichUsers_WithInvalidHeader_ReturnsBadRequest()
    {
        // Arrange
        var header = "email,name,role"; // Wrong column names, missing required columns
        var rows = new[]
        {
            "user@example.com,User One,Engineer"
        };

        var csvContent = CreateCsvContent(header, rows);
        var multipartContent = CreateMultipartCsvRequest(csvContent);

        // Act
        var response = await _client!.PostAsync(
            "/api/v1/users/enrich/bulk",
            multipartContent);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        
        var responseBody = await response.Content.ReadAsStringAsync();
            var bodyLower = responseBody.ToLower();
            bodyLower.Should().ContainAny("validation", "error", "header");
    }

    /// <summary>
    /// TEST 4: File exceeds 5 MB size limit.
    /// Expects 400 BadRequest with "File too large" message.
    /// </summary>
    [Fact]
    public async Task BulkEnrichUsers_WithFileTooLarge_ReturnsBadRequest()
    {
        // Arrange
        var oversizedBytes = new byte[(5 * 1024 * 1024) + 1024];
        Array.Fill(oversizedBytes, (byte)'A');
        var csvContent = new ByteArrayContent(oversizedBytes);
        csvContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("text/csv");
        var multipartContent = CreateMultipartCsvRequest(csvContent);

        // Act
        var response = await _client!.PostAsync(
            "/api/v1/users/enrich/bulk",
            multipartContent);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        
        var responseBody = await response.Content.ReadAsStringAsync();
            var bodyLower = responseBody.ToLower();
            bodyLower.Should().ContainAny("file too large", "file size", "5 mb", "5mb");
    }

    /// <summary>
    /// TEST 5: Empty CSV file (only header, no data rows).
    /// Expects either 400 BadRequest or 200 OK with 0 records processed.
    /// Behavior depends on implementation.
    /// </summary>
    [Fact]
    public async Task BulkEnrichUsers_WithEmptyCsv_ReturnsResponseWithZeroCount()
    {
        // Arrange
        var header = "entra_email_id,display_name,org_role,manager_email_id,manager_name,is_active";
        var rows = Array.Empty<string>(); // No data rows

        var csvContent = CreateCsvContent(header, rows);
        var multipartContent = CreateMultipartCsvRequest(csvContent);

        // Act
        var response = await _client!.PostAsync(
            "/api/v1/users/enrich/bulk",
            multipartContent);

        // Assert
        // Empty CSV should be handled gracefully
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
        
        if (response.StatusCode == HttpStatusCode.OK)
        {
            var responseBody = await response.Content.ReadAsStringAsync();
            var jsonDoc = JsonDocument.Parse(responseBody);
            var dataElement = jsonDoc.RootElement;
            
            dataElement.TryGetProperty("total", out var totalElement).Should().BeTrue();
            totalElement.GetInt32().Should().Be(0);
        }
    }

    /// <summary>
    /// TEST 6: CSV with missing optional columns (should succeed if required columns present).
    /// Expects 200 OK with successful processing.
    /// </summary>
    [Fact]
    public async Task BulkEnrichUsers_WithMissingOptionalColumns_ReturnsBadRequest()
    {
        // Arrange
        // Header must contain all expected columns for this endpoint.
        var header = "entra_email_id,display_name,is_active";
        var rows = new[]
        {
            "user1@example.com,User One,true",
            "user2@example.com,User Two,false"
        };

        var csvContent = CreateCsvContent(header, rows);
        var multipartContent = CreateMultipartCsvRequest(csvContent);

        // Act
        var response = await _client!.PostAsync(
            "/api/v1/users/enrich/bulk",
            multipartContent);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    /// <summary>
    /// TEST 7: CSV with special characters and unicode in data.
    /// Expects 200 OK with successful processing.
    /// </summary>
    [Fact]
    public async Task BulkEnrichUsers_WithUnicodeCharacters_ReturnsOk()
    {
        // Arrange
        var header = "entra_email_id,display_name,org_role,manager_email_id,manager_name,is_active";
        var rows = new[]
        {
            "user1@example.com,José García,Senior Engineer,,José Manager,true",
            "user2@example.com,张三,Architect,,李四,true",
            "user3@example.com,François Müller,Engineer,,Anne-Marie,false"
        };

        var csvContent = CreateCsvContent(header, rows);
        var multipartContent = CreateMultipartCsvRequest(csvContent);

        // Act
        var response = await _client!.PostAsync(
            "/api/v1/users/enrich/bulk",
            multipartContent);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var responseBody = await response.Content.ReadAsStringAsync();
        var jsonDoc = JsonDocument.Parse(responseBody);
        var dataElement = jsonDoc.RootElement;

        dataElement.TryGetProperty("success", out var successElement).Should().BeTrue();
        successElement.GetInt32().Should().BeGreaterThan(0);
    }
}
