using ECC.Application.Services;
using ECC.Domain.Entities;
using ECC.Domain.Enums;
using ECC.Domain.Events;
using ECC.Domain.Exceptions;
using ECC.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace ECC.Application.Tests.Services;

public class IdentityServiceTests
{
    [Fact]
    public async Task ResolveUserProfile_ValidUser_ReturnsProfile()
    {
        var userRepository = new Mock<ISecurityUserRepository>();
        var userRoleRepository = new Mock<ISecurityUserRoleRepository>();
        var eventDispatcher = new Mock<IEventDispatcher>();
        var logger = new Mock<ILogger<IdentityService>>();

        var userId = Guid.NewGuid();
        var moduleId = Guid.NewGuid();

        var user = new SecurityUser
        {
            UserId = userId,
            EntraObjectId = "oid-123",
            DisplayName = "Test User",
            Email = "test@example.com",
            IsActive = true
        };

        userRepository.Setup(x => x.GetByEntraObjectIdAsync("oid-123"))
            .ReturnsAsync(user);

        userRoleRepository.Setup(x => x.GetActiveByUserIdAsync(userId))
            .ReturnsAsync(new List<SecurityUserRole>
            {
                new()
                {
                    UserRoleId = Guid.NewGuid(),
                    UserId = userId,
                    SolutionModuleId = moduleId,
                    IsActive = true,
                    SolutionModule = new SolutionModule
                    {
                        SolutionModuleId = moduleId,
                        SolutionCode = "AIW",
                        ModuleCode = "ECC",
                        ModuleName = "Enterprise Control Center"
                    },
                    RolePermission = new SecurityRolePermission
                    {
                        SecRoleId = Guid.NewGuid(),
                        RoleCode = "VIEWER",
                        RoleName = "Viewer",
                        CanRead = true
                    }
                }
            });

        var sut = new IdentityService(userRepository.Object, userRoleRepository.Object, eventDispatcher.Object, logger.Object);

        var result = await sut.ResolveUserProfileAsync("oid-123");

        Assert.Equal(userId, result.UserId);
        Assert.Single(result.AuthorizedModules);
        eventDispatcher.Verify(d => d.Dispatch(It.IsAny<UserResolvedEvent>()), Times.Once);
    }

    [Fact]
    public async Task ResolveUserProfile_UserNotFound_ThrowsIdentityNotFound()
    {
        var userRepository = new Mock<ISecurityUserRepository>();
        var userRoleRepository = new Mock<ISecurityUserRoleRepository>();
        var eventDispatcher = new Mock<IEventDispatcher>();
        var logger = new Mock<ILogger<IdentityService>>();

        userRepository.Setup(x => x.GetByEntraObjectIdAsync("missing-oid"))
            .ReturnsAsync((SecurityUser?)null);

        var sut = new IdentityService(userRepository.Object, userRoleRepository.Object, eventDispatcher.Object, logger.Object);

        var ex = await Assert.ThrowsAsync<AppException>(() => sut.ResolveUserProfileAsync("missing-oid"));

        Assert.Equal(ErrorCodes.IdentityNotFound, ex.ErrorCode);
    }

    [Fact]
    public async Task ResolveUserProfile_DeactivatedUser_ThrowsIdentityNotFound()
    {
        var userRepository = new Mock<ISecurityUserRepository>();
        var userRoleRepository = new Mock<ISecurityUserRoleRepository>();
        var eventDispatcher = new Mock<IEventDispatcher>();
        var logger = new Mock<ILogger<IdentityService>>();

        userRepository.Setup(x => x.GetByEntraObjectIdAsync("oid-123"))
            .ReturnsAsync(new SecurityUser
            {
                UserId = Guid.NewGuid(),
                EntraObjectId = "oid-123",
                DisplayName = "Inactive",
                Email = "inactive@example.com",
                IsActive = false
            });

        var sut = new IdentityService(userRepository.Object, userRoleRepository.Object, eventDispatcher.Object, logger.Object);

        var ex = await Assert.ThrowsAsync<AppException>(() => sut.ResolveUserProfileAsync("oid-123"));

        Assert.Equal(ErrorCodes.IdentityNotFound, ex.ErrorCode);
    }

    [Fact]
    public async Task ResolveUserProfile_EmptyInput_ThrowsValidationFailed()
    {
        var userRepository = new Mock<ISecurityUserRepository>();
        var userRoleRepository = new Mock<ISecurityUserRoleRepository>();
        var eventDispatcher = new Mock<IEventDispatcher>();
        var logger = new Mock<ILogger<IdentityService>>();

        var sut = new IdentityService(userRepository.Object, userRoleRepository.Object, eventDispatcher.Object, logger.Object);

        var ex = await Assert.ThrowsAsync<AppException>(() => sut.ResolveUserProfileAsync(""));

        Assert.Equal(ErrorCodes.ValidationFailed, ex.ErrorCode);
    }

    [Fact]
    public async Task ResolveUserProfile_UserNotFound_DoesNotDispatchEvent()
    {
        var userRepository = new Mock<ISecurityUserRepository>();
        var userRoleRepository = new Mock<ISecurityUserRoleRepository>();
        var eventDispatcher = new Mock<IEventDispatcher>();
        var logger = new Mock<ILogger<IdentityService>>();

        userRepository.Setup(x => x.GetByEntraObjectIdAsync("missing-oid"))
            .ReturnsAsync((SecurityUser?)null);

        var sut = new IdentityService(userRepository.Object, userRoleRepository.Object, eventDispatcher.Object, logger.Object);

        await Assert.ThrowsAsync<AppException>(() => sut.ResolveUserProfileAsync("missing-oid"));

        eventDispatcher.Verify(d => d.Dispatch(It.IsAny<UserResolvedEvent>()), Times.Never);
    }
}
