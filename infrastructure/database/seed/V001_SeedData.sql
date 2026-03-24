-- V001_SeedData.sql
-- Seed default modules and standard RBAC roles.

DECLARE @SystemUser NVARCHAR(100) = 'system-seed';

DECLARE @SM_AIW_ECC UNIQUEIDENTIFIER = NEWID();
DECLARE @SM_ADC_CLM UNIQUEIDENTIFIER = NEWID();
DECLARE @SM_ADC_CMD UNIQUEIDENTIFIER = NEWID();
DECLARE @SM_ADC_CMT UNIQUEIDENTIFIER = NEWID();

INSERT INTO SecurityDB_Solution_Module (
    solution_module_id, solution_code, solution_name, module_code, module_name,
    description, is_active, created_at, created_by
)
VALUES
(@SM_AIW_ECC, 'AIW', 'Agentic Intelligent Workplace', 'ECC', 'Enterprise Control Center', 'Enterprise control plane', 1, SYSDATETIMEOFFSET(), @SystemUser),
(@SM_ADC_CLM, 'ADC', 'Agentic Digital Core', 'CLM', 'Contract Lifecycle Management', 'Contract lifecycle module', 1, SYSDATETIMEOFFSET(), @SystemUser),
(@SM_ADC_CMD, 'ADC', 'Agentic Digital Core', 'CMD', 'Command Center', 'Command orchestration module', 1, SYSDATETIMEOFFSET(), @SystemUser),
(@SM_ADC_CMT, 'ADC', 'Agentic Digital Core', 'CMT', 'Commitment Tracking', 'Commitment management module', 1, SYSDATETIMEOFFSET(), @SystemUser);

DECLARE @Roles TABLE (
    role_code NVARCHAR(20),
    role_name NVARCHAR(100),
    can_create BIT,
    can_read BIT,
    can_update BIT,
    can_delete BIT,
    full_access_all_modules BIT
);

INSERT INTO @Roles(role_code, role_name, can_create, can_read, can_update, can_delete, full_access_all_modules)
VALUES
('VIEWER', 'Viewer', 0, 1, 0, 0, 0),
('CONTRIBUTOR', 'Contributor', 1, 1, 1, 0, 0),
('COLLABORATOR', 'Collaborator', 1, 1, 1, 1, 0),
('ADMIN', 'Admin', 1, 1, 1, 1, 0),
('GLOBAL_ADMIN', 'Global Admin', 1, 1, 1, 1, 1);

INSERT INTO SecurityDB_Security_Role_Permission (
    sec_role_id, solution_module_id, role_code, role_name,
    can_create, can_read, can_update, can_delete, full_access_all_modules,
    is_active, created_at, created_by
)
SELECT NEWID(), m.solution_module_id, r.role_code, r.role_name,
       r.can_create, r.can_read, r.can_update, r.can_delete, r.full_access_all_modules,
       1, SYSDATETIMEOFFSET(), @SystemUser
FROM SecurityDB_Solution_Module m
CROSS JOIN @Roles r
WHERE m.solution_module_id IN (@SM_AIW_ECC, @SM_ADC_CLM, @SM_ADC_CMD, @SM_ADC_CMT);
