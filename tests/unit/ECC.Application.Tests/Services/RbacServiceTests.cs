using ECC.Application.DTOs.Rbac;
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

public class RbacServiceTests
{
    [Fact]
    public async Task AssignRole_ValidRequest_ReturnsResultAndDispatchesEvent()
    {
        var userRepository = new Mock<ISecurityUserRepository>();
        var userRoleRepository = new Mock<ISecurityUserRoleRepository>();
        var rolePermissionRepository = new Mock<ISecurityRolePermissionRepository>();
        var moduleRepository = new Mock<ISolutionModuleRepository>();
        var eventDispatcher = new Mock<IEventDispatcher>();
        var logger = new Mock<ILogger<RbacService>>();

        var targetUser = new SecurityUser { UserId = Guid.NewGuid(), EntraObjectId = "target-oid", IsActive = true };
        var assignerUser = new SecurityUser { UserId = Guid.NewGuid(), EntraObjectId = "assigner-oid", IsActive = true };
        var module = new SolutionModule { SolutionModuleId = Guid.NewGuid(), SolutionCode = "AIW", ModuleCode = "ECC" };
        var role = new SecurityRolePermission { SecRoleId = Guid.NewGuid(), RoleCode = RoleCodes.Viewer, IsActive = true };

        userRepository.Setup(x => x.GetByEntraObjectIdAsync("target-oid")).ReturnsAsync(targetUser);
        userRepository.Setup(x => x.GetByEntraObjectIdAsync("assigner-oid")).ReturnsAsync(assignerUser);
        moduleRepository.Setup(x => x.GetByCodesAsync("AIW", "ECC")).ReturnsAsync(module);
        rolePermissionRepository.Setup(x => x.GetByRoleCodeAndModuleIdAsync(RoleCodes.Viewer, module.SolutionModuleId)).ReturnsAsync(role);
        userRoleRepository.Setup(x => x.ExistsActiveAssignmentAsync(targetUser.UserId, module.SolutionModuleId, role.SecRoleId)).ReturnsAsync(false);
        userRoleRepository.Setup(x => x.CreateAsync(It.IsAny<SecurityUserRole>())).ReturnsAsync((SecurityUserRole r) => r);

        var sut = new RbacService(
            userRepository.Object,
            userRoleRepository.Object,
            rolePermissionRepository.Object,
            moduleRepository.Object,
            eventDispatcher.Object,
            logger.Object);

        var result = await sut.AssignRoleAsync(new AssignRoleRequestDto
        {
            TargetEntraObjectId = "target-oid",
            SolutionCode = "AIW",
            ModuleCode = "ECC",
            RoleCode = RoleCodes.Viewer,
        }, "assigner-oid");

        Assert.Equal(targetUser.UserId, result.UserId);
        Assert.Equal(RoleCodes.Viewer, result.RoleCode);
        eventDispatcher.Verify(d => d.Dispatch(It.IsAny<RoleAssignedEvent>()), Times.Once);
    }

    [Fact]
    public async Task AssignRole_AdminAssigningAdmin_WithoutGlobalAdmin_ThrowsInsufficientAuthority()
    {
        var userRepository = new Mock<ISecurityUserRepository>();
        var userRoleRepository = new Mock<ISecurityUserRoleRepository>();
        var rolePermissionRepository = new Mock<ISecurityRolePermissionRepository>();
        var moduleRepository = new Mock<ISolutionModuleRepository>();
        var eventDispatcher = new Mock<IEventDispatcher>();
        var logger = new Mock<ILogger<RbacService>>();

        var targetUser = new SecurityUser { UserId = Guid.NewGuid(), EntraObjectId = "target-oid", IsActive = true };
        var assignerUser = new SecurityUser { UserId = Guid.NewGuid(), EntraObjectId = "assigner-oid", IsActive = true };
        var module = new SolutionModule { SolutionModuleId = Guid.NewGuid(), SolutionCode = "AIW", ModuleCode = "ECC" };
        var role = new SecurityRolePermission { SecRoleId = Guid.NewGuid(), RoleCode = RoleCodes.Admin, IsActive = true };

        userRepository.Setup(x => x.GetByEntraObjectIdAsync("target-oid")).ReturnsAsync(targetUser);
        userRepository.Setup(x => x.GetByEntraObjectIdAsync("assigner-oid")).ReturnsAsync(assignerUser);
        moduleRepository.Setup(x => x.GetByCodesAsync("AIW", "ECC")).ReturnsAsync(module);
        rolePermissionRepository.Setup(x => x.GetByRoleCodeAndModuleIdAsync(RoleCodes.Admin, module.SolutionModuleId)).ReturnsAsync(role);
        userRoleRepository.Setup(x => x.GetActiveByUserIdAsync(assignerUser.UserId))
            .ReturnsAsync(new List<SecurityUserRole>
            {
                new()
                {
                    UserRoleId = Guid.NewGuid(),
                    UserId = assignerUser.UserId,
                    SecRoleId = Guid.NewGuid(),
                    SolutionModuleId = module.SolutionModuleId,
                    IsActive = true,
                    RolePermission = new SecurityRolePermission { FullAccessAllModules = false },
                    SolutionModule = module,
                    User = assignerUser
                }
            });

        var sut = new RbacService(
            userRepository.Object,
            userRoleRepository.Object,
            rolePermissionRepository.Object,
            moduleRepository.Object,
            eventDispatcher.Object,
            logger.Object);

        var ex = await Assert.ThrowsAsync<AppException>(() => sut.AssignRoleAsync(new AssignRoleRequestDto
        {
            TargetEntraObjectId = "target-oid",
            SolutionCode = "AIW",
            ModuleCode = "ECC",
            RoleCode = RoleCodes.Admin,
        }, "assigner-oid"));

        Assert.Equal(ErrorCodes.InsufficientAuthority, ex.ErrorCode);
    }

    [Fact]
    public async Task AssignRole_DuplicateActiveAssignment_ThrowsRoleAlreadyActive()
    {
        var userRepository = new Mock<ISecurityUserRepository>();
        var userRoleRepository = new Mock<ISecurityUserRoleRepository>();
        var rolePermissionRepository = new Mock<ISecurityRolePermissionRepository>();
        var moduleRepository = new Mock<ISolutionModuleRepository>();
        var eventDispatcher = new Mock<IEventDispatcher>();
        var logger = new Mock<ILogger<RbacService>>();

        var targetUser = new SecurityUser { UserId = Guid.NewGuid(), EntraObjectId = "target-oid", IsActive = true };
        var assignerUser = new SecurityUser { UserId = Guid.NewGuid(), EntraObjectId = "assigner-oid", IsActive = true };
        var module = new SolutionModule { SolutionModuleId = Guid.NewGuid(), SolutionCode = "AIW", ModuleCode = "ECC" };
        var role = new SecurityRolePermission { SecRoleId = Guid.NewGuid(), RoleCode = RoleCodes.Viewer, IsActive = true };

        userRepository.Setup(x => x.GetByEntraObjectIdAsync("target-oid")).ReturnsAsync(targetUser);
        userRepository.Setup(x => x.GetByEntraObjectIdAsync("assigner-oid")).ReturnsAsync(assignerUser);
        moduleRepository.Setup(x => x.GetByCodesAsync("AIW", "ECC")).ReturnsAsync(module);
        rolePermissionRepository.Setup(x => x.GetByRoleCodeAndModuleIdAsync(RoleCodes.Viewer, module.SolutionModuleId)).ReturnsAsync(role);
        userRoleRepository.Setup(x => x.ExistsActiveAssignmentAsync(targetUser.UserId, module.SolutionModuleId, role.SecRoleId))
            .ReturnsAsync(true);

        var sut = new RbacService(
            userRepository.Object,
            userRoleRepository.Object,
            rolePermissionRepository.Object,
            moduleRepository.Object,
            eventDispatcher.Object,
            logger.Object);

        var ex = await Assert.ThrowsAsync<AppException>(() => sut.AssignRoleAsync(new AssignRoleRequestDto
        {
            TargetEntraObjectId = "target-oid",
            SolutionCode = "AIW",
            ModuleCode = "ECC",
            RoleCode = RoleCodes.Viewer,
        }, "assigner-oid"));

        Assert.Equal(ErrorCodes.RoleAlreadyActive, ex.ErrorCode);
    }
}
