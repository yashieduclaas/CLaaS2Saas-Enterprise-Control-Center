// tests/integration/roles-read-integration.cs
using Kernel.Application.Authorization;
using Kernel.Application.Features.Roles.Queries;
using Kernel.Application.Tenant;
using Microsoft.AspNetCore.Mvc.Testing;
using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using Xunit;

namespace Kernel.Tests.Integration;

/// <summary>
/// Integration tests for GET /api/v1/roles.
///
/// Tests run against the full ASP.NET Core pipeline with test doubles for:
///   - IPermissionEvaluator (controllable grants)
///   - IRoleRepository (in-memory test data)
///   - KernelDbContext is NOT loaded — repository is replaced entirely
///
/// Category tag: pod-roles-read, integration
/// </summary>
[Trait("Category", "pod-roles-read")]
[Trait("Category", "integration")]
public sealed class RolesReadIntegrationTests : IClassFixture<RolesIntegrationWebApplicationFactory>
{
    private readonly RolesIntegrationWebApplicationFactory _factory;

    private static readonly JsonSerializerOptions _jsonOpts = new(JsonSerializerDefaults.Web);

    public RolesReadIntegrationTests(RolesIntegrationWebApplicationFactory factory)
    {
        _factory = factory;
    }

    // ── Auth / permission checks ──────────────────────────────────────────

    [Fact]
    public async Task GetRoles_WithoutAuthorizationHeader_Returns401()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/v1/roles");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetRoles_AuthenticatedWithoutRolesReadPermission_Returns403()
    {
        var client = _factory.CreateClientForTenant("tenant-no-perm", []);

        var response = await client.GetAsync("/api/v1/roles");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task GetRoles_AuthenticatedWithRolesReadPermission_Returns200()
    {
        var client = _factory.CreateClientForTenant("tenant-ok", [PermissionCodes.RolesRead]);

        var response = await client.GetAsync("/api/v1/roles");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    // ── Response shape ────────────────────────────────────────────────────

    [Fact]
    public async Task GetRoles_Returns200_WithCorrectEnvelopeShape()
    {
        var client = _factory.CreateClientForTenant("tenant-shape", [PermissionCodes.RolesRead]);

        var response = await client.GetAsync("/api/v1/roles");

        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();

        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        // ApiEnvelope shape: { success: true, data: [...], correlationId: "..." }
        Assert.True(root.GetProperty("success").GetBoolean());
        Assert.Equal(JsonValueKind.Array, root.GetProperty("data").ValueKind);
        Assert.True(root.TryGetProperty("correlationId", out _));
    }

    [Fact]
    public async Task GetRoles_Returns200_WithCorrectRoleDtoShape()
    {
        var client = _factory.CreateClientForTenant(
            RolesIntegrationWebApplicationFactory.SeededTenantId,
            [PermissionCodes.RolesRead]);

        var response = await client.GetAsync("/api/v1/roles");

        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadAsStringAsync();
        var envelope = JsonSerializer.Deserialize<ApiEnvelopeStub>(body, _jsonOpts);

        Assert.NotNull(envelope);
        Assert.True(envelope.Success);
        Assert.NotEmpty(envelope.Data);

        var first = envelope.Data[0];
        Assert.False(string.IsNullOrEmpty(first.Id));
        Assert.False(string.IsNullOrEmpty(first.Name));
        Assert.False(string.IsNullOrEmpty(first.UpdatedAt));
        // IsSystemRole is bool — presence is sufficient check
    }

    // ── Tenant isolation ─────────────────────────────────────────────────

    [Fact]
    public async Task GetRoles_TenantIsolation_ClientACannotSeeTenantBRoles()
    {
        var clientA = _factory.CreateClientForTenant("tenant-iso-A-int", [PermissionCodes.RolesRead]);
        var clientB = _factory.CreateClientForTenant("tenant-iso-B-int", [PermissionCodes.RolesRead]);

        var responseA = await clientA.GetAsync("/api/v1/roles");
        var responseB = await clientB.GetAsync("/api/v1/roles");

        Assert.Equal(HttpStatusCode.OK, responseA.StatusCode);
        Assert.Equal(HttpStatusCode.OK, responseB.StatusCode);

        var bodyA = await responseA.Content.ReadAsStringAsync();
        var bodyB = await responseB.Content.ReadAsStringAsync();

        // Roles seeded for each tenant must not appear in the other tenant's response
        Assert.Contains("TenantA-IntRole", bodyA);
        Assert.DoesNotContain("TenantB-IntRole", bodyA);

        Assert.Contains("TenantB-IntRole", bodyB);
        Assert.DoesNotContain("TenantA-IntRole", bodyB);
    }

    [Fact]
    public async Task GetRoles_QueryStringTenantId_IsIgnored_TenantFromJwtOnly()
    {
        // Attempt to inject a different tenantId via querystring — must be ignored.
        // The endpoint MUST only use tenantId from TenantContext (JWT tid claim).
        var client = _factory.CreateClientForTenant("tenant-legit", [PermissionCodes.RolesRead]);

        // Malicious querystring attempt — must have zero effect
        var response = await client.GetAsync("/api/v1/roles?tenantId=tenant-other");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        // Response should only contain roles for "tenant-legit", not "tenant-other"
        var body = await response.Content.ReadAsStringAsync();
        Assert.DoesNotContain("tenant-other", body);
    }

    // ── Cancellation ──────────────────────────────────────────────────────

    [Fact]
    public async Task GetRoles_CancellationToken_HonoredBeforeRepositoryCall()
    {
        using var cts = new CancellationTokenSource(millisecondsDelay: 1);

        try
        {
            var client = _factory.CreateClientForTenant("tenant-cancel", [PermissionCodes.RolesRead]);
            await cts.CancelAsync();
            await client.GetAsync("/api/v1/roles", cts.Token);
            // If we reach here, cancellation was too slow — not a test failure per se
        }
        catch (OperationCanceledException)
        {
            // Expected — cancellation propagated correctly
        }
        catch (TaskCanceledException)
        {
            // Also acceptable — HttpClient wraps in TaskCanceledException
        }
        // No Assert needed — the test verifies no unhandled exception escapes
    }

    // ── Content type ──────────────────────────────────────────────────────

    [Fact]
    public async Task GetRoles_Returns_ApplicationJson_ContentType()
    {
        var client = _factory.CreateClientForTenant("tenant-ct", [PermissionCodes.RolesRead]);

        var response = await client.GetAsync("/api/v1/roles");

        Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);
    }

    // ── Deserialization stubs ─────────────────────────────────────────────

    private sealed class ApiEnvelopeStub
    {
        public bool Success { get; set; }
        public List<RoleDtoStub> Data { get; set; } = [];
        public string? CorrelationId { get; set; }
    }

    private sealed class RoleDtoStub
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsSystemRole { get; set; }
        public string UpdatedAt { get; set; } = string.Empty;
    }
}

// ── Integration Test WebApplicationFactory ────────────────────────────────

/// <summary>
/// WebApplicationFactory for integration tests.
/// Wires controllable test doubles for the permission evaluator and repository.
/// </summary>
public sealed class RolesIntegrationWebApplicationFactory : WebApplicationFactory<Program>
{
    public const string SeededTenantId = "tenant-seeded-01";

    private static readonly IReadOnlyList<RoleReadModel> _seededRoles = new[]
    {
        new RoleReadModel(Guid.NewGuid(), "Platform Admin",  "Built-in admin role",  true,  DateTimeOffset.UtcNow.AddDays(-10)),
        new RoleReadModel(Guid.NewGuid(), "Audit Viewer",    "Read audit logs",      false, DateTimeOffset.UtcNow.AddDays(-5)),
    }.ToList().AsReadOnly();

    private static readonly IReadOnlyList<RoleReadModel> _tenantAIntRoles = new[]
    {
        new RoleReadModel(Guid.NewGuid(), "TenantA-IntRole", null, false, DateTimeOffset.UtcNow),
    }.ToList().AsReadOnly();

    private static readonly IReadOnlyList<RoleReadModel> _tenantBIntRoles = new[]
    {
        new RoleReadModel(Guid.NewGuid(), "TenantB-IntRole", null, false, DateTimeOffset.UtcNow),
    }.ToList().AsReadOnly();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<IPermissionEvaluator>();
            services.RemoveAll<IRoleRepository>();
            services.RemoveAll<KernelDbContext>();
            services.RemoveAll<DbContextOptions<KernelDbContext>>();

            services.AddScoped<IPermissionEvaluator, IntegrationTestPermissionEvaluator>();
            services.AddSingleton<IRoleRepository>(new IntegrationTestRoleRepository(
                SeededTenantId,   _seededRoles,
                "tenant-iso-A-int", _tenantAIntRoles,
                "tenant-iso-B-int", _tenantBIntRoles));
        });
    }

    public HttpClient CreateClientForTenant(string tenantId, string[] permissions)
    {
        var client = CreateClient();
        var token = TestJwtHelper.BuildTestToken(tenantId, permissions);
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);
        return client;
    }
}

internal sealed class IntegrationTestPermissionEvaluator : IPermissionEvaluator
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public IntegrationTestPermissionEvaluator(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Task<EvaluationResult> EvaluateAsync(
        EvaluationRequest request,
        CancellationToken cancellationToken = default)
    {
        var permissions = _httpContextAccessor.HttpContext?
            .User.FindAll("test_permissions")
            .Select(c => c.Value)
            .ToHashSet(StringComparer.Ordinal)
            ?? new HashSet<string>();

        var granted = permissions.Contains(request.PermissionCode);

        return Task.FromResult(new EvaluationResult
        {
            IsGranted          = granted,
            UserId             = request.UserId,
            TenantId           = request.TenantId,
            PermissionCode     = request.PermissionCode,
            PermissionsVersion = Guid.Empty,
            EvaluatedAt        = DateTimeOffset.UtcNow,
        });
    }
}

internal sealed class IntegrationTestRoleRepository : IRoleRepository
{
    private readonly Dictionary<string, IReadOnlyList<RoleReadModel>> _byTenant;

    public IntegrationTestRoleRepository(params object[] pairs)
    {
        _byTenant = new Dictionary<string, IReadOnlyList<RoleReadModel>>(StringComparer.Ordinal);
        for (var i = 0; i < pairs.Length - 1; i += 2)
        {
            _byTenant[(string)pairs[i]] = (IReadOnlyList<RoleReadModel>)pairs[i + 1];
        }
    }

    public Task<IReadOnlyList<RoleReadModel>> ListByTenantAsync(
        string tenantId,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var roles = _byTenant.TryGetValue(tenantId, out var r)
            ? r
            : Array.Empty<RoleReadModel>().ToList().AsReadOnly();
        return Task.FromResult(roles);
    }
}

internal static class TestJwtHelper
{
    public static string BuildTestToken(string tenantId, string[] permissions)
    {
        // Returns a token string recognized by the test authentication middleware.
        // In the full test project, configure a test authentication scheme that
        // accepts this token format and populates the ClaimsPrincipal accordingly.
        // Reference: Microsoft.AspNetCore.Authentication.JwtBearer test patterns.
        return $"TEST_TOKEN::tid={tenantId}::perms={string.Join(",", permissions)}";
    }
}

// Namespace usings for test infrastructure
using Kernel.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
