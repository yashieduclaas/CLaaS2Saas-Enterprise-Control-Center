using FluentAssertions;
using Kernel.Application.Abstractions;
using Kernel.Application.Audit;
using Kernel.Application.Authorization;
using Kernel.Application.Features.Users;
using Kernel.Domain.Entities;
using Kernel.Domain.Exceptions;
using Moq;
using Xunit;

namespace Kernel.Application.Tests.Features.Users;

// ============================================================
// AI-GENERATED CODE - DO NOT MODIFY WITHOUT PROMPT RE-EXECUTION
// FEAT-ID:    FEAT-NNN
// TASK-ID:    T-NNN
// PROMPT-ID:  PR-NNN-tests-users-enrich-handler
// Generated:  2026-03-25 | ChatGPT REVIEW: PENDING
// ============================================================

/// <summary>
/// Unit tests for <see cref="EnrichUserCommandHandler"/>.
/// </summary>
public sealed class EnrichUserCommandHandlerTests
{
    private readonly Mock<ITenantContext> _mockTenantContext;
    private readonly Mock<ICurrentPrincipalAccessor> _mockCurrentPrincipalAccessor;
    private readonly Mock<IPermissionEvaluator> _mockPermissionEvaluator;
    private readonly Mock<ISecurityUserRepository> _mockRepository;
    private readonly Mock<IAuditQueue> _mockAuditQueue;
    private readonly EnrichUserCommandHandler _handler;

    public EnrichUserCommandHandlerTests()
    {
        _mockTenantContext = new Mock<ITenantContext>();
        _mockCurrentPrincipalAccessor = new Mock<ICurrentPrincipalAccessor>();
        _mockPermissionEvaluator = new Mock<IPermissionEvaluator>();
        _mockRepository = new Mock<ISecurityUserRepository>();
        _mockAuditQueue = new Mock<IAuditQueue>();

        _handler = new EnrichUserCommandHandler(
            _mockTenantContext.Object,
            _mockCurrentPrincipalAccessor.Object,
            _mockPermissionEvaluator.Object,
            _mockRepository.Object,
            _mockAuditQueue.Object);
    }

    private void ArrangeValidAuth()
    {
        _mockTenantContext.Setup(x => x.IsResolved).Returns(true);
        _mockTenantContext.Setup(x => x.TenantId).Returns("tenant-1");
        _mockCurrentPrincipalAccessor.Setup(x => x.PrincipalId).Returns("principal-1");

        _mockPermissionEvaluator
            .Setup(x => x.EvaluateBatchAsync(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<IEnumerable<string>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(() => new Dictionary<string, bool>
            {
                { Permissions.UsersWrite, true },
                { Permissions.AdminGlobal, false }
            });
    }

    [Fact]
    public async Task Handle_ShouldCreateUser_WhenUserDoesNotExist()
    {
        // Arrange
        ArrangeValidAuth();

        var command = new EnrichUserCommand(
            entra_email_id: "newuser@example.com",
            display_name: "New User",
            org_role: "Engineer",
            manager_email_id: "manager@example.com",
            manager_name: "Manager Name",
            is_active: true);

        var newUser = new SecurityUser
        {
            SecurityUserPid = 1,
            EntraEmailId = "newuser@example.com",
            DisplayName = "New User",
            OrgRole = "Engineer",
            ManagerEmailId = "manager@example.com",
            ManagerName = "Manager Name",
            IsActive = true
        };

        _mockRepository
            .Setup(x => x.GetByEntraEmailIdAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((SecurityUser?)null);

        _mockRepository
            .Setup(x => x.AddAsync(It.IsAny<SecurityUser>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(newUser);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.security_user_pid.Should().Be(1);
        result.is_created.Should().BeTrue();
        _mockRepository.Verify(
            x => x.AddAsync(It.IsAny<SecurityUser>(), It.IsAny<CancellationToken>()),
            Times.Once);
        _mockAuditQueue.Verify(x => x.Enqueue(It.IsAny<AuditEntry>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldUpdateUser_WhenUserExists()
    {
        // Arrange
        ArrangeValidAuth();

        var command = new EnrichUserCommand(
            entra_email_id: "existing@example.com",
            display_name: "Updated Name",
            org_role: "Senior Engineer",
            manager_email_id: "newmanager@example.com",
            manager_name: "New Manager",
            is_active: true);

        var existingUser = new SecurityUser
        {
            SecurityUserPid = 42,
            EntraEmailId = "existing@example.com",
            DisplayName = "Old Name",
            OrgRole = null,
            ManagerEmailId = null,
            ManagerName = null,
            IsActive = true
        };

        _mockRepository
            .Setup(x => x.GetByEntraEmailIdAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingUser);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.security_user_pid.Should().Be(42);
        result.is_created.Should().BeFalse();
        _mockRepository.Verify(
            x => x.UpdateAsync(It.IsAny<SecurityUser>(), It.IsAny<CancellationToken>()),
            Times.Once);
        _mockAuditQueue.Verify(x => x.Enqueue(It.IsAny<AuditEntry>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldThrowPermissionDenied_WhenTenantNotResolved()
    {
        // Arrange
        _mockTenantContext.Setup(x => x.IsResolved).Returns(false);

        var command = new EnrichUserCommand(
            entra_email_id: "user@example.com",
            display_name: "User",
            org_role: null,
            manager_email_id: null,
            manager_name: null,
            is_active: true);

        // Act
        var act = () => _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<PermissionDeniedException>();
        _mockRepository.Verify(
            x => x.GetByEntraEmailIdAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Handle_ShouldThrowPermissionDenied_WhenCallerNotAuthorized()
    {
        // Arrange
        _mockTenantContext.Setup(x => x.IsResolved).Returns(true);
        _mockTenantContext.Setup(x => x.TenantId).Returns("tenant-1");
        _mockCurrentPrincipalAccessor.Setup(x => x.PrincipalId).Returns("principal-1");

        // Both permissions return false
        _mockPermissionEvaluator
            .Setup(x => x.EvaluateBatchAsync(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<IEnumerable<string>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Dictionary<string, bool>
            {
                { Permissions.UsersWrite, false },
                { Permissions.AdminGlobal, false }
            });

        var command = new EnrichUserCommand(
            entra_email_id: "user@example.com",
            display_name: "User",
            org_role: null,
            manager_email_id: null,
            manager_name: null,
            is_active: true);

        // Act
        var act = () => _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<PermissionDeniedException>();
        _mockRepository.Verify(
            x => x.GetByEntraEmailIdAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Handle_ShouldEnqueueAudit_OnSuccess()
    {
        // Arrange
        ArrangeValidAuth();

        var command = new EnrichUserCommand(
            entra_email_id: "audit@example.com",
            display_name: "Audit Test",
            org_role: null,
            manager_email_id: null,
            manager_name: null,
            is_active: true);

        var createdUser = new SecurityUser
        {
            SecurityUserPid = 99,
            EntraEmailId = "audit@example.com",
            DisplayName = "Audit Test",
            IsActive = true
        };

        _mockRepository
            .Setup(x => x.GetByEntraEmailIdAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((SecurityUser?)null);

        _mockRepository
            .Setup(x => x.AddAsync(It.IsAny<SecurityUser>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(createdUser);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _mockAuditQueue.Verify(
            x => x.Enqueue(It.Is<AuditEntry>(e =>
                e.entity_type == nameof(SecurityUser) &&
                e.entity_pid == 99 &&
                e.action_type == "CREATE")),
            Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldNormalizeEmail_ToLowercase()
    {
        // Arrange
        ArrangeValidAuth();

        var command = new EnrichUserCommand(
            entra_email_id: "USER@EXAMPLE.COM",
            display_name: "User",
            org_role: null,
            manager_email_id: "MANAGER@EXAMPLE.COM",
            manager_name: null,
            is_active: true);

        var createdUser = new SecurityUser
        {
            SecurityUserPid = 1,
            EntraEmailId = "user@example.com",
            DisplayName = "User",
            ManagerEmailId = "manager@example.com",
            IsActive = true
        };

        _mockRepository
            .Setup(x => x.GetByEntraEmailIdAsync("user@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync((SecurityUser?)null);

        _mockRepository
            .Setup(x => x.AddAsync(It.IsAny<SecurityUser>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(createdUser);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.security_user_pid.Should().Be(1);
        _mockRepository.Verify(
            x => x.GetByEntraEmailIdAsync("user@example.com", It.IsAny<CancellationToken>()),
            Times.Once);
    }
}
