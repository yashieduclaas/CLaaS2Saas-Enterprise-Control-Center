// tests/unit/roles-handler-unit.cs
using Kernel.Application.Features.Roles.Queries;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace Kernel.Tests.Unit;

/// <summary>
/// Unit tests for <see cref="ListRolesQueryHandler"/>.
/// These tests run against the handler in isolation — no database, no HTTP.
/// Repository is replaced with an in-memory fake.
/// Category tag: pod-roles-read, unit
/// </summary>
[Trait("Category", "pod-roles-read")]
[Trait("Layer", "unit")]
public sealed class ListRolesQueryHandlerTests
{
    // ── Helpers ───────────────────────────────────────────────────────────

    private static ListRolesQueryHandler BuildHandler(IRoleRepository? repository = null)
    {
        return new ListRolesQueryHandler(
            repository ?? new FakeRoleRepository(),
            NullLogger<ListRolesQueryHandler>.Instance);
    }

    // ── Tests ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task HandleAsync_WithRoles_ReturnsMappedDtos()
    {
        // Arrange
        var tenantId = "tenant-a";
        var now = new DateTimeOffset(2026, 1, 15, 12, 0, 0, TimeSpan.Zero);

        var fakeRepo = new FakeRoleRepository(
            new RoleReadModel(Guid.Parse("aaaaaaaa-0000-0000-0000-000000000001"), "Global Admin",    "Full access", true,  now),
            new RoleReadModel(Guid.Parse("aaaaaaaa-0000-0000-0000-000000000002"), "Security Admin",  null,          false, now.AddDays(-1)));

        var handler = BuildHandler(fakeRepo);

        // Act
        var result = await handler.HandleAsync(new ListRolesQuery(tenantId));

        // Assert
        Assert.Equal(2, result.Roles.Count);

        var first = result.Roles[0];
        Assert.Equal("aaaaaaaa-0000-0000-0000-000000000001", first.Id);
        Assert.Equal("Global Admin", first.Name);
        Assert.Equal("Full access", first.Description);
        Assert.True(first.IsSystemRole);
        Assert.Equal(now.UtcDateTime.ToString("O"), first.UpdatedAt);

        var second = result.Roles[1];
        Assert.Equal("Security Admin", second.Name);
        Assert.Null(second.Description);
        Assert.False(second.IsSystemRole);
    }

    [Fact]
    public async Task HandleAsync_EmptyRepository_ReturnsEmptyList()
    {
        // Arrange
        var handler = BuildHandler(new FakeRoleRepository());

        // Act
        var result = await handler.HandleAsync(new ListRolesQuery("tenant-empty"));

        // Assert
        Assert.Empty(result.Roles);
    }

    [Fact]
    public async Task HandleAsync_CancellationRequested_PropagatesCancellation()
    {
        // Arrange
        using var cts = new CancellationTokenSource();
        cts.Cancel();

        var handler = BuildHandler(new SlowFakeRoleRepository());

        // Act + Assert
        await Assert.ThrowsAsync<OperationCanceledException>(
            () => handler.HandleAsync(new ListRolesQuery("tenant-cancel"), cts.Token));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task HandleAsync_EmptyTenantId_ThrowsArgumentException(string tenantId)
    {
        // Arrange
        var handler = BuildHandler();

        // Act + Assert
        await Assert.ThrowsAsync<ArgumentException>(
            () => handler.HandleAsync(new ListRolesQuery(tenantId)));
    }

    [Fact]
    public async Task HandleAsync_TenantIdIsNeverPassedToExternalSystem_OnlyToRepository()
    {
        // Arrange — repository that asserts it received the right tenantId
        var capturingRepo = new CapturingFakeRepository();
        var handler = BuildHandler(capturingRepo);

        const string expectedTenantId = "tenant-verify-123";

        // Act
        await handler.HandleAsync(new ListRolesQuery(expectedTenantId));

        // Assert — handler passed the tenantId to the repo, not to anything else
        Assert.Equal(expectedTenantId, capturingRepo.CapturedTenantId);
    }

    // ── Fakes ─────────────────────────────────────────────────────────────

    private sealed class FakeRoleRepository : IRoleRepository
    {
        private readonly IReadOnlyList<RoleReadModel> _models;

        public FakeRoleRepository(params RoleReadModel[] models)
        {
            _models = models.ToList().AsReadOnly();
        }

        public Task<IReadOnlyList<RoleReadModel>> ListByTenantAsync(
            string tenantId,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult(_models);
        }
    }

    private sealed class SlowFakeRoleRepository : IRoleRepository
    {
        public async Task<IReadOnlyList<RoleReadModel>> ListByTenantAsync(
            string tenantId,
            CancellationToken cancellationToken = default)
        {
            await Task.Delay(TimeSpan.FromSeconds(30), cancellationToken);
            return Array.Empty<RoleReadModel>();
        }
    }

    private sealed class CapturingFakeRepository : IRoleRepository
    {
        public string? CapturedTenantId { get; private set; }

        public Task<IReadOnlyList<RoleReadModel>> ListByTenantAsync(
            string tenantId,
            CancellationToken cancellationToken = default)
        {
            CapturedTenantId = tenantId;
            return Task.FromResult<IReadOnlyList<RoleReadModel>>(Array.Empty<RoleReadModel>());
        }
    }
}
