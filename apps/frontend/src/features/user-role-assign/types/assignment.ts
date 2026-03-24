// apps/web/src/features/user-role-assign/types/assignment.ts
// TYPE CONTRACT — Assign Role to User feature.
//
// Rule: NEVER reuse UserRoleAssignment (UI model) as the POST request body.
//       Use CreateUserRoleAssignmentRequest (DTO) for API payloads.
//       Fields like id, assignedBy, userName, userEmail are server-generated.

// ── UI model — what the frontend displays in the table ───────────────────────

export interface AssignableUserRoleAssignment {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    solutionCode: string;
    moduleCode: string;
    roleCode: string;
    roleName: string;
    assignmentDate: string;          // ISO 8601
    assignedBy: string;              // server-generated
    status: 'Active' | 'Inactive';
    reason: string;
    disableDate?: string | null;
}

// ── API DTO — body sent to POST /api/assignments ──────────────────────────────
// No id, no assignedBy, no userName, no userEmail — these are server-owned.

export interface CreateUserRoleAssignmentRequest {
    userId: string;
    solutionCode: string;
    moduleCode: string;
    roleCode: string;
    assignmentDate: string;          // ISO 8601
    status: 'Active' | 'Inactive';
    reason: string;
    disableDate?: string | null;
}
