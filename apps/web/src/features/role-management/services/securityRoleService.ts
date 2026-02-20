// apps/web/src/features/role-management/services/securityRoleService.ts
// SERVICE LAYER — Security Role API calls.
//
// Backend-ready contract:
//   createSecurityRole()  →  POST /api/security/roles
//
// When backend is ready, ONLY replace the function body.
// No changes required in hook, modal, or parent page.

import type { CreateSecurityRoleRequest, SecurityRole } from '../types/securityRole';

/**
 * Create a new security role.
 *
 * Backend replacement (when ready):
 *   import { apiClient } from '@/api/client';
 *   const response = await apiClient.post<SecurityRole>('/api/security/roles', payload);
 *   return response.data;
 */
export async function createSecurityRole(
    payload: CreateSecurityRoleRequest,
): Promise<SecurityRole> {
    // Mock: simulate network latency + server-side ID generation
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                id: crypto.randomUUID(),
                solutionCode: payload.solutionCode,
                moduleCode: payload.moduleCode,
                roleCode: payload.roleCode,
                roleName: payload.roleName,
                roleType: payload.roleType,
                createdAt: new Date().toISOString(),
            });
        }, 500);
    });
}
