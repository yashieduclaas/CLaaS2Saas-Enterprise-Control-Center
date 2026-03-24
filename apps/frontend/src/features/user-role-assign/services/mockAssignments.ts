// apps/web/src/features/user-role-assign/services/mockAssignments.ts
// FEATURE FILE — Mock data service layer for User Role Assignment.
//
// Backend-ready contract:
//   getMockAssignments()     → GET  /api/security/role-assignments
//   updateRoleAssignment()   → PUT  /api/security/role-assignments/{id}
//
// When backend connects, replace each function body only. UI + hook layers are untouched.

import type { UserRoleAssignment, UpdateRoleAssignmentRequest } from '../types/security';

// ── Mutable in-memory store (simulates backend state within session) ──────────

let MOCK_STORE: UserRoleAssignment[] = [
    {
        id: '1',
        userId: 'usr-001',
        userName: 'Admin User',
        userEmail: 'admin@lithan.com',
        solutionCode: 'AIW',
        moduleCode: 'AIW',
        roleCode: 'GLOBAL_ADMIN',
        roleLabel: 'Global Administrator',
        assignedDate: '2025-01-15T09:30:00',
        disableDate: null,
        assignedBy: 'System',
        assignedByEmail: 'system@lithan.com',
        status: 'ACTIVE',
        reason: 'Initial system administrator assignment',
    },
    {
        id: '2',
        userId: 'usr-002',
        userName: 'Alice Johnson',
        userEmail: 'alice.johnson@lithan.com',
        solutionCode: 'AESS',
        moduleCode: 'AESS',
        roleCode: 'ADMIN',
        roleLabel: 'Administrator',
        assignedDate: '2025-02-10T14:20:00',
        disableDate: null,
        assignedBy: 'Admin User',
        assignedByEmail: 'admin@lithan.com',
        status: 'ACTIVE',
        reason: 'Module admin assignment for Agentic ERP & Shared Services',
    },
    {
        id: '3',
        userId: 'usr-003',
        userName: 'Bob Smith',
        userEmail: 'bob.smith@lithan.com',
        solutionCode: 'ADLT',
        moduleCode: 'ADLT',
        roleCode: 'CONTRIBUTOR',
        roleLabel: 'Contributor',
        assignedDate: '2025-03-01T10:15:00',
        disableDate: null,
        assignedBy: 'Admin User',
        assignedByEmail: 'admin@lithan.com',
        status: 'ACTIVE',
        reason: 'Talent module contributor access',
    },
    {
        id: '4',
        userId: 'usr-003',
        userName: 'Bob Smith',
        userEmail: 'bob.smith@lithan.com',
        solutionCode: 'ACRM',
        moduleCode: 'ACRM',
        roleCode: 'VIEWER',
        roleLabel: 'Viewer',
        assignedDate: '2025-03-01T10:15:00',
        disableDate: null,
        assignedBy: 'Admin User',
        assignedByEmail: 'admin@lithan.com',
        status: 'ACTIVE',
        reason: 'CRM & Marketer module read-only access',
    },
];

// ── Service functions ─────────────────────────────────────────────────────────

/**
 * Fetch all user role assignments.
 * Backend replacement: GET /api/security/role-assignments
 */
export async function getMockAssignments(): Promise<UserRoleAssignment[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [...MOCK_STORE];
}

/**
 * Update a role assignment.
 * Backend replacement: PUT /api/security/role-assignments/{id}
 *
 * Returns the full updated UserRoleAssignment (server merge pattern).
 * The UI never constructs a full record itself — it always trusts the server response.
 */
export async function updateRoleAssignment(
    payload: UpdateRoleAssignmentRequest,
): Promise<UserRoleAssignment> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const existing: UserRoleAssignment | undefined = MOCK_STORE.find(a => a.id === payload.id);
    if (!existing) throw new Error(`Assignment ${payload.id} not found`);

    const updated: UserRoleAssignment = {
        id: existing.id,
        userId: existing.userId,
        userName: existing.userName,
        userEmail: existing.userEmail,
        roleLabel: existing.roleLabel,
        assignedDate: existing.assignedDate,
        assignedBy: existing.assignedBy,
        assignedByEmail: existing.assignedByEmail,
        solutionCode: payload.solutionCode,
        moduleCode: payload.moduleCode,
        roleCode: payload.roleCode,
        status: payload.status,
        disableDate: payload.disableDate ?? null,
        reason: payload.reason,
    };

    MOCK_STORE = MOCK_STORE.map(a => (a.id === payload.id ? updated : a));
    return updated;
}

