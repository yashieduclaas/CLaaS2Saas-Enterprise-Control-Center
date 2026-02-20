// apps/web/src/features/user-role-assign/types/security.ts
// FEATURE FILE — Data model for User Role Assignment.
// This is the single source of truth for this feature's data shape.
// Do NOT inline this type in any component.
// Do NOT mix UI model (UserRoleAssignment) with API payload (UpdateRoleAssignmentRequest).

// ── UI model — what the frontend displays ─────────────────────────────────────

export interface UserRoleAssignment {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    solutionCode: string;
    moduleCode: string;
    roleCode: string;
    roleLabel: string;
    assignedDate: string;        // ISO 8601
    disableDate?: string | null; // ISO 8601 or null
    assignedBy: string;
    assignedByEmail: string;
    status: 'ACTIVE' | 'INACTIVE';
    reason: string;
}

// ── API DTO — what is sent to PUT /api/security/role-assignments/{id} ─────────

export interface UpdateRoleAssignmentRequest {
    id: string;
    solutionCode: string;
    moduleCode: string;
    roleCode: string;
    status: 'ACTIVE' | 'INACTIVE';
    disableDate?: string | null;
    reason: string;
}

