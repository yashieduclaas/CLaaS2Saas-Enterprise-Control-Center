# CLaaS2SaaS Security Kernel — RBAC Permission Matrix

**Document Path:** `/architecture/security/rbac-permission-matrix.md`  
**Document ID:** DOC-C2S-SEC-RPM-001  
**Version:** 1.0 — Authoritative  
**Status:** APPROVED  
**Classification:** Internal  
**Audience:** Security administrators, platform engineers, QA engineers, AI code-generation agents  
**Last Updated:** February 2026

---

> ⚠️ **THIS DOCUMENT IS THE HUMAN-READABLE RBAC TRUTH.**
> The `PermissionCode` TypeScript union in `packages/contracts/rbac/index.ts` is the machine-authoritative source. This document is descriptive and must remain consistent with that source. In any conflict, the contracts package wins. Report conflicts as a Severity-1 defect.

---

## Table of Contents

1. [Role Definitions](#1-role-definitions)
2. [Permission Catalog Reference](#2-permission-catalog-reference)
3. [Role → Permission Matrix](#3-role--permission-matrix)
4. [GLOBAL_ADMIN Special Rules](#4-global_admin-special-rules)
5. [Separation of Duties Notes](#5-separation-of-duties-notes)
6. [Default Role Assignment Model](#6-default-role-assignment-model)
7. [Test Persona Mapping](#7-test-persona-mapping)

---

## 1. Role Definitions

The platform defines five named roles. These are system-level roles — not display labels. They map directly to the `SecurityRoleType` union in the contracts package.

### 1.1 GLOBAL_ADMIN

**Technical identifier:** `GLOBAL_ADMIN`  
**Scope:** All modules within the user's tenant  
**Purpose:** Break-glass elevated administration. Full permission set within the tenant boundary.

A GLOBAL_ADMIN can perform every privileged operation available in the system: creating and deleting roles, managing user assignments, viewing full audit history, and managing module configurations. They operate with elevated audit scrutiny. Every action they take is flagged `IsBreakGlass = true` in the audit log when the `ADMIN:GLOBAL` permission is exercised.

**Critical constraints:**
- GLOBAL_ADMIN **never** bypasses the tenant boundary. A GLOBAL_ADMIN of Tenant A has zero access to Tenant B.
- GLOBAL_ADMIN **always** goes through `IPermissionEvaluator`. No code path bypasses the evaluator for GLOBAL_ADMIN.
- GLOBAL_ADMIN **never** bypasses audit logging.
- GLOBAL_ADMIN assignment requires two-person authorization. One GLOBAL_ADMIN cannot unilaterally grant this role to another user.

### 1.2 SECURITY_ADMIN

**Technical identifier:** `SECURITY_ADMIN` (maps to `Admin` in role type union)  
**Scope:** All modules within the user's tenant, excluding GLOBAL_ADMIN-only operations  
**Purpose:** Day-to-day security administration. Manages roles, permissions, and user assignments across the tenant.

A SECURITY_ADMIN can create and manage roles, assign permissions to roles, and manage user role assignments across all modules in the tenant. They cannot assign `ADMIN:GLOBAL` permissions or perform break-glass operations. They can view audit logs but cannot export them.

### 1.3 MODULE_ADMIN

**Technical identifier:** `MODULE_ADMIN` (maps to `Collaborator` in role type union)  
**Scope:** Single module, assigned at module registration time  
**Purpose:** Module-level permission management. Manages role assignments for a specific module.

A MODULE_ADMIN has `ADMIN:MODULE_SCOPED` permission. Within their assigned module, they can assign roles to users and view module-level permission reports. They cannot create global roles, access other modules' configurations, or view audit logs outside their module scope.

### 1.4 HELP_DESK

**Technical identifier:** `HELP_DESK` (maps to `Contributor` in role type union)  
**Scope:** Read-only across assigned modules  
**Purpose:** Operational support. Views user assignments and access status to assist with access requests.

A HELP_DESK user can read role definitions, view user role assignments, and submit or review access requests on behalf of users. They cannot modify any permission data. They cannot view audit logs.

### 1.5 STANDARD_USER

**Technical identifier:** `STANDARD_USER` (maps to `Viewer` in role type union)  
**Scope:** Own profile and own permissions only  
**Purpose:** Self-service access management. Views own assignments and submits access requests.

A STANDARD_USER can view their own role assignments, submit access requests for roles they do not hold, and read module and role catalog information (names and descriptions only — not permission code internals). They cannot modify any data.

---

## 2. Permission Catalog Reference

### 2.1 Authoritative Source

The `PermissionCode` TypeScript string literal union defined in:

```
packages/contracts/rbac/index.ts
```

is the single authoritative source for all permission codes. The C# `PermissionCode` static class in `Kernel.Domain/ValueObjects/PermissionCode.cs` is derived from this union via the `tools/sync-permission-codes.ps1` sync script, which runs on every CI pass.

**This matrix documents the permissions that exist in that union as of v1.0.** Any permission added to the union in a future version must be documented here in a corresponding matrix update.

### 2.2 Complete Permission Catalog (v1.0)

#### Role Management Domain

| Code | Description | Sensitivity |
|---|---|---|
| `ROLE:CREATE` | Create a new security role definition | High |
| `ROLE:READ` | View role definitions, names, permission mappings | Low |
| `ROLE:UPDATE` | Modify an existing role's name, description, or permission set | High |
| `ROLE:DELETE` | Permanently deactivate a role definition | High |

#### User Management Domain

| Code | Description | Sensitivity |
|---|---|---|
| `USER:CREATE` | Provision a new user record in the security kernel | Medium |
| `USER:READ` | View user profiles, their role assignments, and access status | Medium |
| `USER:UPDATE` | Modify user profile data (display name, status flags) | Medium |
| `USER:DELETE` | Deactivate a user record | High |
| `USER:ASSIGN_ROLE` | Assign a security role to a user | High |
| `USER:REVOKE_ROLE` | Remove a security role from a user | High |

#### Module Management Domain

| Code | Description | Sensitivity |
|---|---|---|
| `MODULE:CREATE` | Register a new module or solution in the security catalog | High |
| `MODULE:READ` | View module and solution catalog entries | Low |
| `MODULE:UPDATE` | Modify module metadata (name, owner, version) | Medium |
| `MODULE:DELETE` | Deregister a module from the security catalog | High |

#### Audit Domain

| Code | Description | Sensitivity |
|---|---|---|
| `AUDIT:VIEW_SESSIONS` | View audit session records (who logged in, when) | Medium |
| `AUDIT:VIEW_ACTIONS` | View audit action records (who did what, when) | Medium |
| `AUDIT:EXPORT` | Export audit logs to CSV or external SIEM | High |

#### Access Request Domain

| Code | Description | Sensitivity |
|---|---|---|
| `ACCESS_REQUEST:SUBMIT` | Submit an access request for a role | Low |
| `ACCESS_REQUEST:REVIEW` | Review and process access requests submitted by others | Medium |
| `ACCESS_REQUEST:RESOLVE` | Approve or reject an access request | High |

#### Admin Domain

| Code | Description | Sensitivity |
|---|---|---|
| `ADMIN:MODULE_SCOPED` | Elevated administration within a single assigned module | High |
| `ADMIN:GLOBAL` | Break-glass full administration within the tenant boundary | Critical |

---

## 3. Role → Permission Matrix

### 3.1 Legend

| Symbol | Meaning |
|---|---|
| ✅ | Role holds this permission |
| ❌ | Role does not hold this permission |
| ⚠️ | Role holds this permission with scope restriction (see notes) |
| — | Not applicable |

### 3.2 Complete Matrix

| Permission Code | GLOBAL_ADMIN | SECURITY_ADMIN | MODULE_ADMIN | HELP_DESK | STANDARD_USER |
|---|:---:|:---:|:---:|:---:|:---:|
| **ROLE MANAGEMENT** | | | | | |
| `ROLE:CREATE` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `ROLE:READ` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `ROLE:UPDATE` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `ROLE:DELETE` | ✅ | ✅ | ❌ | ❌ | ❌ |
| **USER MANAGEMENT** | | | | | |
| `USER:CREATE` | ✅ | ✅ | ⚠️ (module only) | ❌ | ❌ |
| `USER:READ` | ✅ | ✅ | ⚠️ (module only) | ✅ | ⚠️ (self only) |
| `USER:UPDATE` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `USER:DELETE` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `USER:ASSIGN_ROLE` | ✅ | ✅ | ⚠️ (module only) | ❌ | ❌ |
| `USER:REVOKE_ROLE` | ✅ | ✅ | ⚠️ (module only) | ❌ | ❌ |
| **MODULE MANAGEMENT** | | | | | |
| `MODULE:CREATE` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `MODULE:READ` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `MODULE:UPDATE` | ✅ | ✅ | ⚠️ (own module) | ❌ | ❌ |
| `MODULE:DELETE` | ✅ | ❌ | ❌ | ❌ | ❌ |
| **AUDIT** | | | | | |
| `AUDIT:VIEW_SESSIONS` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `AUDIT:VIEW_ACTIONS` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `AUDIT:EXPORT` | ✅ | ❌ | ❌ | ❌ | ❌ |
| **ACCESS REQUESTS** | | | | | |
| `ACCESS_REQUEST:SUBMIT` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `ACCESS_REQUEST:REVIEW` | ✅ | ✅ | ⚠️ (module only) | ✅ | ❌ |
| `ACCESS_REQUEST:RESOLVE` | ✅ | ✅ | ⚠️ (module only) | ❌ | ❌ |
| **ADMIN** | | | | | |
| `ADMIN:MODULE_SCOPED` | ✅ | ❌ | ✅ | ❌ | ❌ |
| `ADMIN:GLOBAL` | ✅ | ❌ | ❌ | ❌ | ❌ |

### 3.3 Scope Restriction Notes

**⚠️ MODULE_ADMIN scope restrictions:**
- `USER:CREATE`, `USER:READ`, `USER:ASSIGN_ROLE`, `USER:REVOKE_ROLE` — restricted to users within the MODULE_ADMIN's registered module. The API enforces this via `IPermissionEvaluator` checking `ADMIN:MODULE_SCOPED` against the target resource's `moduleId`.
- `MODULE:UPDATE` — restricted to the module the MODULE_ADMIN is registered to. The evaluator checks that the target `moduleId` matches the admin's assignment.
- `ACCESS_REQUEST:REVIEW` and `ACCESS_REQUEST:RESOLVE` — restricted to requests within the MODULE_ADMIN's module.

**⚠️ STANDARD_USER scope restrictions:**
- `USER:READ` — restricted to own profile (`userId == authenticatedUserId`). Cannot read other users' profiles or assignments.

### 3.4 Machine-Readable Representation

For use in automated testing and AI agent context, the matrix above is expressed as a JSON structure. This is not authoritative — it is derived from the matrix above for machine consumption.

```json
{
  "GLOBAL_ADMIN": {
    "ROLE:CREATE": true, "ROLE:READ": true, "ROLE:UPDATE": true, "ROLE:DELETE": true,
    "USER:CREATE": true, "USER:READ": true, "USER:UPDATE": true, "USER:DELETE": true,
    "USER:ASSIGN_ROLE": true, "USER:REVOKE_ROLE": true,
    "MODULE:CREATE": true, "MODULE:READ": true, "MODULE:UPDATE": true, "MODULE:DELETE": true,
    "AUDIT:VIEW_SESSIONS": true, "AUDIT:VIEW_ACTIONS": true, "AUDIT:EXPORT": true,
    "ACCESS_REQUEST:SUBMIT": true, "ACCESS_REQUEST:REVIEW": true, "ACCESS_REQUEST:RESOLVE": true,
    "ADMIN:MODULE_SCOPED": true, "ADMIN:GLOBAL": true
  },
  "SECURITY_ADMIN": {
    "ROLE:CREATE": true, "ROLE:READ": true, "ROLE:UPDATE": true, "ROLE:DELETE": true,
    "USER:CREATE": true, "USER:READ": true, "USER:UPDATE": true, "USER:DELETE": true,
    "USER:ASSIGN_ROLE": true, "USER:REVOKE_ROLE": true,
    "MODULE:CREATE": true, "MODULE:READ": true, "MODULE:UPDATE": true, "MODULE:DELETE": false,
    "AUDIT:VIEW_SESSIONS": true, "AUDIT:VIEW_ACTIONS": true, "AUDIT:EXPORT": false,
    "ACCESS_REQUEST:SUBMIT": true, "ACCESS_REQUEST:REVIEW": true, "ACCESS_REQUEST:RESOLVE": true,
    "ADMIN:MODULE_SCOPED": false, "ADMIN:GLOBAL": false
  },
  "MODULE_ADMIN": {
    "ROLE:CREATE": false, "ROLE:READ": true, "ROLE:UPDATE": false, "ROLE:DELETE": false,
    "USER:CREATE": "module-scoped", "USER:READ": "module-scoped", "USER:UPDATE": false, "USER:DELETE": false,
    "USER:ASSIGN_ROLE": "module-scoped", "USER:REVOKE_ROLE": "module-scoped",
    "MODULE:CREATE": false, "MODULE:READ": true, "MODULE:UPDATE": "own-module", "MODULE:DELETE": false,
    "AUDIT:VIEW_SESSIONS": false, "AUDIT:VIEW_ACTIONS": false, "AUDIT:EXPORT": false,
    "ACCESS_REQUEST:SUBMIT": true, "ACCESS_REQUEST:REVIEW": "module-scoped", "ACCESS_REQUEST:RESOLVE": "module-scoped",
    "ADMIN:MODULE_SCOPED": true, "ADMIN:GLOBAL": false
  },
  "HELP_DESK": {
    "ROLE:CREATE": false, "ROLE:READ": true, "ROLE:UPDATE": false, "ROLE:DELETE": false,
    "USER:CREATE": false, "USER:READ": true, "USER:UPDATE": false, "USER:DELETE": false,
    "USER:ASSIGN_ROLE": false, "USER:REVOKE_ROLE": false,
    "MODULE:CREATE": false, "MODULE:READ": true, "MODULE:UPDATE": false, "MODULE:DELETE": false,
    "AUDIT:VIEW_SESSIONS": false, "AUDIT:VIEW_ACTIONS": false, "AUDIT:EXPORT": false,
    "ACCESS_REQUEST:SUBMIT": true, "ACCESS_REQUEST:REVIEW": true, "ACCESS_REQUEST:RESOLVE": false,
    "ADMIN:MODULE_SCOPED": false, "ADMIN:GLOBAL": false
  },
  "STANDARD_USER": {
    "ROLE:CREATE": false, "ROLE:READ": true, "ROLE:UPDATE": false, "ROLE:DELETE": false,
    "USER:CREATE": false, "USER:READ": "self-only", "USER:UPDATE": false, "USER:DELETE": false,
    "USER:ASSIGN_ROLE": false, "USER:REVOKE_ROLE": false,
    "MODULE:CREATE": false, "MODULE:READ": true, "MODULE:UPDATE": false, "MODULE:DELETE": false,
    "AUDIT:VIEW_SESSIONS": false, "AUDIT:VIEW_ACTIONS": false, "AUDIT:EXPORT": false,
    "ACCESS_REQUEST:SUBMIT": true, "ACCESS_REQUEST:REVIEW": false, "ACCESS_REQUEST:RESOLVE": false,
    "ADMIN:MODULE_SCOPED": false, "ADMIN:GLOBAL": false
  }
}
```

---

## 4. GLOBAL_ADMIN Special Rules

These rules are invariants, not guidelines. They are enforced by architecture and tooling.

### Rule GA-01 — Module Scope Bypass

GLOBAL_ADMIN bypasses module scoping. When `IPermissionEvaluator` evaluates a permission for a GLOBAL_ADMIN, it does not apply the `moduleId` restriction that applies to MODULE_ADMIN. A GLOBAL_ADMIN can perform `USER:ASSIGN_ROLE` for any module in the tenant.

**Implementation:** `IPermissionEvaluator.EvaluateAsync()` short-circuits to `Permit` for a principal holding `ADMIN:GLOBAL` without checking `moduleId` constraints.

### Rule GA-02 — Tenant Boundary Is Never Bypassed

GLOBAL_ADMIN **never** bypasses the tenant boundary. The `tid` claim in the JWT is always the operative tenant. EF global query filters are always active. A GLOBAL_ADMIN of Tenant A has zero access to Tenant B data, schema, or audit logs.

**Implementation:** `TenantMiddleware` applies before `IPermissionEvaluator` is ever called. The `tenantId` is always injected into the evaluator from the middleware — not from any user input.

### Rule GA-03 — Audit Is Never Bypassed

Every API call made by a GLOBAL_ADMIN is recorded in `AuditActionLog`. When the `ADMIN:GLOBAL` permission is the basis of the authorization decision, the entry carries `IsBreakGlass = true`. There is no code path to suppress this.

**Implementation:** `AuditMiddleware` runs on every non-GET request after authorization completes. It reads the authorization result, checks if `ADMIN:GLOBAL` was the evaluated code, and sets the `IsBreakGlass` flag accordingly.

### Rule GA-04 — Always Through IPermissionEvaluator

GLOBAL_ADMIN does not receive special treatment at the controller or handler layer. The same `[Authorize(Policy = "...")]` attribute applies. The evaluator evaluates the policy. For a GLOBAL_ADMIN, the evaluation returns `Permit` — but it still evaluates. No controller contains a `if (isGlobalAdmin) { skipCheck(); }` path.

### Rule GA-05 — Two-Person Grant Rule

`ADMIN:GLOBAL` cannot be self-assigned. It cannot be granted by a single `SECURITY_ADMIN` or even a single `GLOBAL_ADMIN`. The assignment workflow requires:
1. A request submitted through the `ACCESS_REQUEST` workflow.
2. Review and approval by a designated GLOBAL_ADMIN.
3. A second confirmation acknowledgment by a second authorized GLOBAL_ADMIN.

The workflow enforces this programmatically. Manual API calls to assign `ADMIN:GLOBAL` without the workflow are rejected at the command handler level.

---

## 5. Separation of Duties Notes

### 5.1 High-Risk Permission Combinations

The following combinations of permissions within a single role assignment represent SoD risks. At MVP, these are documented as monitoring targets, not hard technical blocks. Technical SoD enforcement is planned for MMP phase.

| Combination | Risk | Current Mitigation |
|---|---|---|
| `USER:ASSIGN_ROLE` + `ROLE:CREATE` | User can create an arbitrary role and self-assign it | Only GLOBAL_ADMIN and SECURITY_ADMIN hold both. These roles are high-trust and audited. |
| `AUDIT:VIEW_ACTIONS` + `AUDIT:EXPORT` + `USER:DELETE` | User can take destructive action and potentially suppress evidence | AUDIT:EXPORT requires GLOBAL_ADMIN only. Audit log is append-only and not deletable via API. |
| `ADMIN:GLOBAL` + any write permission | Full tenant administration scope | GLOBAL_ADMIN assignment requires two-person rule. All actions flagged IsBreakGlass. |

### 5.2 Incompatible Role Combinations (Future MMP SoD Engine)

The SoD Compliance Engine (planned for MMP) will programmatically block the following role combinations on a single user account:

- `GLOBAL_ADMIN` + `SECURITY_ADMIN` on the same account (GLOBAL_ADMIN already subsumes SECURITY_ADMIN; dual assignment is administratively redundant and a SoD audit risk).
- `MODULE_ADMIN` for Module X + `STANDARD_USER` for Module X (conflicting trust levels for same module; MODULE_ADMIN subsumes all STANDARD_USER capabilities for their module).

### 5.3 Break-Glass Monitoring

Any `AuditActionLog` entry with `IsBreakGlass = true` triggers an automated SIEM alert. The alert includes:
- The `userId` (Entra Object ID)
- The `tenantId`
- The operation performed
- The timestamp
- The resource affected

The alert is non-suppressible from application code. Quarterly access recertification must review all `IsBreakGlass` activity and confirm each event was justified.

### 5.4 High-Risk Permissions (Enhanced Monitoring)

The following permissions are designated high-risk and generate enhanced audit telemetry regardless of break-glass status:

- `USER:ASSIGN_ROLE` — every assignment logged with before/after role set
- `USER:REVOKE_ROLE` — every revocation logged with before/after role set
- `ROLE:DELETE` — logged with full role definition snapshot before deletion
- `ADMIN:GLOBAL` — all uses flagged `IsBreakGlass`
- `AUDIT:EXPORT` — full audit record of what was exported, by whom, and when

---

## 6. Default Role Assignment Model

### 6.1 New User Provisioning

A new user is provisioned in the Security Kernel when an administrator assigns them a role for the first time. The provisioning process:

1. `UserCreateHandler` checks if a `SecurityUser` record exists for the user's Entra Object ID (`oid`) within the current tenant (`tid`).
2. If no record exists, the handler creates a `SecurityUser` record using the `oid` as the primary identifier, the `tid` as the tenant scope, and the `displayName` and `email` from the Entra profile.
3. The role assignment is then created as a `UserRoleAssignment` record.
4. The user is **not** provisioned with any default role. Provisioning is role-assignment-driven, not time-driven.

### 6.2 Default Role at Provisioning

**There is no default role.** A newly provisioned user has zero permissions until an administrator explicitly assigns a role. This is the least-privilege default.

The STANDARD_USER role is not automatically assigned. It is manually assigned by a SECURITY_ADMIN or MODULE_ADMIN as the minimum access grant.

### 6.3 Tenant Scoping Rules

Every `UserRoleAssignment` record carries:
- `UserId` — the Entra Object ID of the user
- `RoleId` — the ID of the assigned role
- `TenantId` — the tenant within which the assignment is valid
- `ModuleId` — the module scope (null for global roles like SECURITY_ADMIN)
- `AssignedByUserId` — the Entra Object ID of the administrator who made the assignment
- `AssignedAt` — UTC timestamp of assignment
- `IsActive` — boolean; inactive assignments are equivalent to no assignment

A user can have different roles in different tenants. Role assignments do not transfer across tenants.

### 6.4 Least-Privilege Guidance

For module onboarding, apply roles in this order:
1. Assign `STANDARD_USER` first. Confirm the user can access module read operations.
2. Escalate to `HELP_DESK` only if operational support access is required.
3. Escalate to `MODULE_ADMIN` only if the user is responsible for managing that module's access.
4. Never assign `SECURITY_ADMIN` or `GLOBAL_ADMIN` without documented justification and manager approval.

---

## 7. Test Persona Mapping

These canonical test personas are used in automated integration tests, RBAC matrix tests, and AI agent context. They are provisioned in the development and staging environments only. They must never exist in production.

### 7.1 Canonical Test Users

| Persona | Environment Variable | Role | Username Convention | Purpose |
|---|---|---|---|---|
| Global Admin | `TEST_USER_GLOBAL_ADMIN` | `GLOBAL_ADMIN` | `test-global-admin@claas2saas-dev.onmicrosoft.com` | Tests requiring full tenant administration access |
| Security Admin | `TEST_USER_SECURITY_ADMIN` | `SECURITY_ADMIN` | `test-security-admin@claas2saas-dev.onmicrosoft.com` | Tests requiring tenant-wide role/user management |
| Module Admin | `TEST_USER_MODULE_ADMIN` | `MODULE_ADMIN` | `test-module-admin@claas2saas-dev.onmicrosoft.com` | Tests requiring module-scoped administration |
| Help Desk | `TEST_USER_HELP_DESK` | `HELP_DESK` | `test-helpdesk@claas2saas-dev.onmicrosoft.com` | Tests for read-only support workflows |
| Standard User | `TEST_USER_STANDARD` | `STANDARD_USER` | `test-standard-user@claas2saas-dev.onmicrosoft.com` | Tests for end-user self-service flows |
| No Role | `TEST_USER_NO_ROLE` | None assigned | `test-no-role@claas2saas-dev.onmicrosoft.com` | Tests for unauthorized access rejection |

### 7.2 Persona Contract

Test personas are loaded from the `MockAuthProvider` when `VITE_AUTH_MODE=mock`. The mock token for each persona must include:
- `oid`: a stable, deterministic GUID specific to each persona (hard-coded in `MockAuthProvider`)
- `tid`: the development tenant ID (from `VITE_TEST_TENANT_ID`)
- `displayName`: the persona name (e.g., "Test Global Admin")
- `email`: the username convention above

**The mock token must NOT include a `roles` claim.** Permission evaluation must go through the `PermissionContext` → API → `IPermissionEvaluator` path, even in mock mode. The mock token proves identity; the `IPermissionEvaluator` determines permissions from the seeded database.

### 7.3 RBAC Matrix Test Coverage Requirements

Every permission code in the catalog must have a corresponding RBAC matrix test in `tests/rbac-matrix/`. Each test verifies:
1. **Positive case:** A persona that should hold the permission can perform the operation. Expected: `200 OK` or `201 Created`.
2. **Negative case:** A persona that should not hold the permission is rejected. Expected: `403 Forbidden`.
3. **Tenant isolation case:** A valid persona from Tenant A cannot access Tenant B resources. Expected: `403 Forbidden`.

Tests must use the canonical persona credentials from Section 7.1. Using ad-hoc test accounts in automated tests is prohibited.

---

*This document is maintained by the CLaaS2SaaS Platform Security team. Changes to permission codes require a contracts package version bump and a corresponding update to this matrix. Version history is maintained in Git.*
