// apps/web/src/features/role-management/types/securityRole.ts
// TYPE CONTRACT — Security Role feature data models.
//
// Rule: NEVER reuse UI model (SecurityRole) as the API request body.
//       Use the DTO (CreateSecurityRoleRequest) for POST payloads.

// ── UI model — what the frontend displays ─────────────────────────────────────

export interface SecurityRole {
    id: string;
    solutionCode: string;
    moduleCode: string;
    roleCode: string;
    roleName: string;
    roleType: 'SYSTEM' | 'CUSTOM';
    createdAt: string;
}

// ── API DTO — sent to POST /api/security/roles ────────────────────────────────
// Zero UI-only fields here. Only what the backend needs.

export interface CreateSecurityRoleRequest {
    solutionCode: string;
    moduleCode: string;
    roleCode: string;
    roleName: string;
    roleType: 'SYSTEM' | 'CUSTOM';
}
