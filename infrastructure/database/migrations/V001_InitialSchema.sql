-- V001_InitialSchema.sql
-- Initial ECC security schema with SecurityDB_* table names.

CREATE TABLE SecurityDB_Security_User (
    user_id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    entra_object_id NVARCHAR(100) NOT NULL,
    display_name NVARCHAR(200) NOT NULL,
    email NVARCHAR(320) NOT NULL,
    is_active BIT NOT NULL DEFAULT(1),
    last_login_date DATETIMEOFFSET NULL,
    created_at DATETIMEOFFSET NOT NULL DEFAULT(SYSDATETIMEOFFSET()),
    created_by NVARCHAR(100) NOT NULL,
    updated_at DATETIMEOFFSET NULL,
    updated_by NVARCHAR(100) NULL
);

CREATE UNIQUE INDEX UX_SecurityUser_EntraObjectId ON SecurityDB_Security_User(entra_object_id);
CREATE INDEX IX_SecurityUser_Email ON SecurityDB_Security_User(email);

CREATE TABLE SecurityDB_Solution_Module (
    solution_module_id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    solution_code NVARCHAR(10) NOT NULL,
    solution_name NVARCHAR(100) NOT NULL,
    module_code NVARCHAR(10) NOT NULL,
    module_name NVARCHAR(100) NOT NULL,
    description NVARCHAR(500) NOT NULL,
    module_lead NVARCHAR(200) NULL,
    documentation_url NVARCHAR(500) NULL,
    module_version NVARCHAR(20) NULL,
    is_active BIT NOT NULL DEFAULT(1),
    created_at DATETIMEOFFSET NOT NULL DEFAULT(SYSDATETIMEOFFSET()),
    created_by NVARCHAR(100) NOT NULL,
    updated_at DATETIMEOFFSET NULL,
    updated_by NVARCHAR(100) NULL
);

CREATE UNIQUE INDEX UX_SolutionModule_Code ON SecurityDB_Solution_Module(solution_code, module_code);

CREATE TABLE SecurityDB_Security_Role_Permission (
    sec_role_id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    solution_module_id UNIQUEIDENTIFIER NOT NULL,
    role_code NVARCHAR(20) NOT NULL,
    role_name NVARCHAR(100) NOT NULL,
    can_create BIT NOT NULL DEFAULT(0),
    can_read BIT NOT NULL DEFAULT(0),
    can_update BIT NOT NULL DEFAULT(0),
    can_delete BIT NOT NULL DEFAULT(0),
    full_access_all_modules BIT NOT NULL DEFAULT(0),
    is_active BIT NOT NULL DEFAULT(1),
    created_at DATETIMEOFFSET NOT NULL DEFAULT(SYSDATETIMEOFFSET()),
    created_by NVARCHAR(100) NOT NULL,
    updated_at DATETIMEOFFSET NULL,
    updated_by NVARCHAR(100) NULL,
    CONSTRAINT FK_RolePermission_SolutionModule FOREIGN KEY (solution_module_id)
        REFERENCES SecurityDB_Solution_Module(solution_module_id)
);

CREATE UNIQUE INDEX UX_RolePermission_CodeModule ON SecurityDB_Security_Role_Permission(role_code, solution_module_id);

CREATE TABLE SecurityDB_Security_User_Role (
    user_role_id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    user_id UNIQUEIDENTIFIER NOT NULL,
    solution_module_id UNIQUEIDENTIFIER NOT NULL,
    sec_role_id UNIQUEIDENTIFIER NOT NULL,
    assigned_by_user_id UNIQUEIDENTIFIER NOT NULL,
    assigned_date DATETIMEOFFSET NOT NULL DEFAULT(SYSDATETIMEOFFSET()),
    disabled_date DATETIMEOFFSET NULL,
    is_active BIT NOT NULL DEFAULT(1),
    created_at DATETIMEOFFSET NOT NULL DEFAULT(SYSDATETIMEOFFSET()),
    created_by NVARCHAR(100) NOT NULL,
    updated_at DATETIMEOFFSET NULL,
    updated_by NVARCHAR(100) NULL,
    CONSTRAINT FK_UserRole_User FOREIGN KEY (user_id)
        REFERENCES SecurityDB_Security_User(user_id),
    CONSTRAINT FK_UserRole_SolutionModule FOREIGN KEY (solution_module_id)
        REFERENCES SecurityDB_Solution_Module(solution_module_id),
    CONSTRAINT FK_UserRole_RolePermission FOREIGN KEY (sec_role_id)
        REFERENCES SecurityDB_Security_Role_Permission(sec_role_id)
);

CREATE UNIQUE INDEX UX_UserRole_Active ON SecurityDB_Security_User_Role(user_id, solution_module_id, sec_role_id)
WHERE is_active = 1;

CREATE TABLE SecurityDB_Audit_Session (
    audit_session_id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    user_id UNIQUEIDENTIFIER NOT NULL,
    entra_email_id NVARCHAR(320) NOT NULL,
    session_start_time DATETIMEOFFSET NOT NULL,
    session_end_time DATETIMEOFFSET NULL,
    ip_address NVARCHAR(45) NULL,
    device_info NVARCHAR(500) NULL,
    location NVARCHAR(200) NULL,
    solution_module_id UNIQUEIDENTIFIER NULL,
    session_token_id NVARCHAR(200) NULL,
    is_success BIT NOT NULL,
    reason NVARCHAR(500) NULL,
    created_at DATETIMEOFFSET NOT NULL DEFAULT(SYSDATETIMEOFFSET()),
    created_by NVARCHAR(100) NOT NULL,
    updated_at DATETIMEOFFSET NULL,
    updated_by NVARCHAR(100) NULL,
    CONSTRAINT FK_AuditSession_User FOREIGN KEY (user_id)
        REFERENCES SecurityDB_Security_User(user_id),
    CONSTRAINT FK_AuditSession_SolutionModule FOREIGN KEY (solution_module_id)
        REFERENCES SecurityDB_Solution_Module(solution_module_id)
);

CREATE INDEX IX_AuditSession_UserId ON SecurityDB_Audit_Session(user_id);

CREATE TABLE SecurityDB_Audit_Action_Log (
    audit_action_id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    audit_session_id UNIQUEIDENTIFIER NOT NULL,
    user_id UNIQUEIDENTIFIER NOT NULL,
    action_timestamp DATETIMEOFFSET NOT NULL,
    solution_module_id UNIQUEIDENTIFIER NULL,
    action_name NVARCHAR(200) NOT NULL,
    permission_code NVARCHAR(50) NULL,
    action_status NVARCHAR(50) NOT NULL,
    additional_info NVARCHAR(2000) NULL,
    created_at DATETIMEOFFSET NOT NULL DEFAULT(SYSDATETIMEOFFSET()),
    created_by NVARCHAR(100) NOT NULL,
    updated_at DATETIMEOFFSET NULL,
    updated_by NVARCHAR(100) NULL,
    CONSTRAINT FK_AuditActionLog_AuditSession FOREIGN KEY (audit_session_id)
        REFERENCES SecurityDB_Audit_Session(audit_session_id)
);

CREATE INDEX IX_AuditActionLog_Session ON SecurityDB_Audit_Action_Log(audit_session_id);
CREATE INDEX IX_AuditActionLog_User ON SecurityDB_Audit_Action_Log(user_id);
