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
// PROMPT-ID:  PR-NNN-api-tests-enrich-endpoint
// Generated:  2026-03-25 | ChatGPT REVIEW: PENDING
// ============================================================

/// <summary>
/// Integration tests for POST /api/v1/users/enrich endpoint.
/// Tests real HTTP requests through the full middleware pipeline.
/// Requires demo auth to be enabled (default for integration tests).
/// </summary>
public sealed class EnrichUserEndpointTests : IAsyncLifetime
{
    private ApiFactory? _factory;
    private HttpClient? _client;

    public async Task InitializeAsync()
    {
        _factory = new ApiFactory();
        _client = _factory.CreateAuthorizedClient();
        // Ensure the factory is initialized
        await Task.CompletedTask;
    }

    public async Task DisposeAsync()
    {
        _client?.Dispose();
        _factory?.Dispose();
        await Task.CompletedTask;
    }

    /// <summary>
    /// TEST 1: Successful enrichment of a new user.
    /// Sends valid JSON with required fields.
    /// Expects 200 OK with security_user_pid and is_created = true.
    /// </summary>
    [Fact]
    public async Task EnrichUser_WithValidInput_ReturnsOkWithCreatedUser()
    {
        // Arrange
        var request = new
        {
            EntraEmailId = "newuser@example.com",
            DisplayName = "New User",
            OrgRole = "Engineer",
            ManagerEmailId = "manager@example.com",
            ManagerName = "Manager Name",
            IsActive = true
        };

        var jsonContent = new StringContent(
            JsonSerializer.Serialize(request),
            Encoding.UTF8,
            "application/json");

        // Act
        var response = await _client!.PostAsync(
            "/api/v1/users/enrich",
            jsonContent);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var responseBody = await response.Content.ReadAsStringAsync();
        var jsonDoc = JsonDocument.Parse(responseBody);
        jsonDoc.RootElement.TryGetProperty("security_user_pid", out var pidElement).Should().BeTrue();
        pidElement.GetInt32().Should().BeGreaterThan(0);

        jsonDoc.RootElement.TryGetProperty("is_created", out var isCreatedElement).Should().BeTrue();
        isCreatedElement.GetBoolean().Should().BeTrue();
    }

    /// <summary>
    /// TEST 2: Validation failure due to empty email.
    /// Expects 400 BadRequest with validation error details.
    /// </summary>
    [Fact]
    public async Task EnrichUser_WithEmptyEmail_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            EntraEmailId = "",
            DisplayName = "User",
            OrgRole = (string?)null,
            ManagerEmailId = (string?)null,
            ManagerName = (string?)null,
            IsActive = true
        };

        var jsonContent = new StringContent(
            JsonSerializer.Serialize(request),
            Encoding.UTF8,
            "application/json");

        // Act
        var response = await _client!.PostAsync(
            "/api/v1/users/enrich",
            jsonContent);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        
        var responseBody = await response.Content.ReadAsStringAsync();
            responseBody.Should().ContainAny("validation", "error", "Email");
    }

    /// <summary>
    /// TEST 3: Validation failure due to empty display name.
    /// Expects 400 BadRequest with validation error details.
    /// </summary>
    [Fact]
    public async Task EnrichUser_WithEmptyDisplayName_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            EntraEmailId = "user@example.com",
            DisplayName = "",
            OrgRole = (string?)null,
            ManagerEmailId = (string?)null,
            ManagerName = (string?)null,
            IsActive = true
        };

        var jsonContent = new StringContent(
            JsonSerializer.Serialize(request),
            Encoding.UTF8,
            "application/json");

        // Act
        var response = await _client!.PostAsync(
            "/api/v1/users/enrich",
            jsonContent);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        
        var responseBody = await response.Content.ReadAsStringAsync();
            var bodyLower = responseBody.ToLower();
            bodyLower.Should().ContainAny("validation", "error", "display");
    }

    /// <summary>
    /// TEST 4: Invalid email format.
    /// Expects 400 BadRequest with validation error for email format.
    /// </summary>
    [Fact]
    public async Task EnrichUser_WithInvalidEmailFormat_ReturnsBadRequest()
    {
        // Arrange
        var request = new
        {
            EntraEmailId = "not-an-email",
            DisplayName = "User",
            OrgRole = (string?)null,
            ManagerEmailId = (string?)null,
            ManagerName = (string?)null,
            IsActive = true
        };

        var jsonContent = new StringContent(
            JsonSerializer.Serialize(request),
            Encoding.UTF8,
            "application/json");

        // Act
        var response = await _client!.PostAsync(
            "/api/v1/users/enrich",
            jsonContent);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        
        var responseBody = await response.Content.ReadAsStringAsync();
            var bodyLower = responseBody.ToLower();
            bodyLower.Should().ContainAny("validation", "error", "email");
    }

    /// <summary>
    /// TEST 5: Email exceeds maximum length.
    /// Expects 400 BadRequest with validation error for length.
    /// </summary>
    [Fact]
    public async Task EnrichUser_WithEmailTooLong_ReturnsBadRequest()
    {
        // Arrange
        var longEmail = new string('a', 255) + "@example.com";
        var request = new
        {
            EntraEmailId = longEmail,
            DisplayName = "User",
            OrgRole = (string?)null,
            ManagerEmailId = (string?)null,
            ManagerName = (string?)null,
            IsActive = true
        };

        var jsonContent = new StringContent(
            JsonSerializer.Serialize(request),
            Encoding.UTF8,
            "application/json");

        // Act
        var response = await _client!.PostAsync(
            "/api/v1/users/enrich",
            jsonContent);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    /// <summary>
    /// TEST 6: Display name exceeds maximum length.
    /// Expects 400 BadRequest with validation error for length.
    /// </summary>
    [Fact]
    public async Task EnrichUser_WithDisplayNameTooLong_ReturnsBadRequest()
    {
        // Arrange
        var longDisplayName = new string('A', 501);
        var request = new
        {
            EntraEmailId = "user@example.com",
            DisplayName = longDisplayName,
            OrgRole = (string?)null,
            ManagerEmailId = (string?)null,
            ManagerName = (string?)null,
            IsActive = true
        };

        var jsonContent = new StringContent(
            JsonSerializer.Serialize(request),
            Encoding.UTF8,
            "application/json");

        // Act
        var response = await _client!.PostAsync(
            "/api/v1/users/enrich",
            jsonContent);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    /// <summary>
    /// TEST 7: Request without authentication.
    /// The endpoint requires the UsersWrite permission.
    /// Expects 401 Unauthorized or 403 Forbidden.
    /// </summary>
    [Fact]
    public async Task EnrichUser_WithoutAuthentication_ReturnsUnauthorized()
    {
        // Arrange
        var anonymousClient = _factory!.CreateAnonymousClient();

        var request = new
        {
            EntraEmailId = "user@example.com",
            DisplayName = "User",
            OrgRole = (string?)null,
            ManagerEmailId = (string?)null,
            ManagerName = (string?)null,
            IsActive = true
        };

        var jsonContent = new StringContent(
            JsonSerializer.Serialize(request),
            Encoding.UTF8,
            "application/json");

        // Act
        var response = await anonymousClient.PostAsync(
            "/api/v1/users/enrich",
            jsonContent);

        // Assert
        // Should be 401 Unauthorized or 403 Forbidden depending on auth pipeline
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Unauthorized, HttpStatusCode.Forbidden);
    }
}
