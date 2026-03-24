// apps/web/src/features/user-role-assign/services/assignmentService.ts
// SERVICE LAYER — Create Role Assignment.
//
// Backend-ready contract:
//   createAssignment()  →  POST /api/assignments
//
// Only THIS function body changes when the backend is connected.
// No hook, modal, or page changes required.
//
// Backend replacement:
//   import { apiClient } from '@/api/client';
//   const response = await apiClient.post<AssignableUserRoleAssignment>(
//     '/api/assignments', payload
//   );
//   return response.data;

import type {
    CreateUserRoleAssignmentRequest,
    AssignableUserRoleAssignment,
} from '../types/assignment';

/**
 * Create a new role assignment.
 * Mock: simulates 500ms network latency + server-side field generation.
 */
export async function createAssignment(
    payload: CreateUserRoleAssignmentRequest,
): Promise<AssignableUserRoleAssignment> {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                id: crypto.randomUUID(),
                userId: payload.userId,
                userName: 'Mock User',           // server would resolve from userId
                userEmail: 'mock@educlaas.com',   // server would resolve from userId
                solutionCode: payload.solutionCode,
                moduleCode: payload.moduleCode,
                roleCode: payload.roleCode,
                roleName: payload.roleCode,      // server would resolve from roleCode
                assignmentDate: payload.assignmentDate,
                assignedBy: 'System',              // server-generated from session
                status: payload.status,
                reason: payload.reason,
                disableDate: payload.disableDate ?? null,
            });
        }, 500);
    });
}
