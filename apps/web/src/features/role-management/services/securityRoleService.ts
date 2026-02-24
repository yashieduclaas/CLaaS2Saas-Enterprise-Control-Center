// apps/web/src/features/role-management/services/securityRoleService.ts
// SERVICE LAYER — Security Role API calls.
//
// Backend-ready contract:
//   getRoles()            →  GET  /api/security/roles
//   createSecurityRole()  →  POST /api/security/roles
//
// When backend is ready, ONLY replace the function body.
// No changes required in hook, modal, or parent page.

import type { CreateSecurityRoleRequest, SecurityRole } from '../types/securityRole';

/**
 * Fetch all security roles.
 * Backend replacement: return (await apiClient.get<SecurityRole[]>('/api/security/roles')).data;
 */
export async function getRoles(): Promise<SecurityRole[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: '1',
                    solutionCode: 'ADC',
                    solutionName: 'Adaptive CLaaS',
                    moduleCode: 'AGNT_HR',
                    moduleName: 'Agentic HR',
                    roleCode: 'COLLABORATOR',
                    roleName: 'Collaborator',
                    roleType: 'SYSTEM',
                    createdAt: new Date().toISOString(),
                },
                {
                    id: '2',
                    solutionCode: 'AIW',
                    solutionName: 'Agentic Intelligent Workplace',
                    moduleCode: 'AGNT_TLNT',
                    moduleName: 'Agentic Talents',
                    roleCode: 'CONTRIBUTOR',
                    roleName: 'Contributor',
                    roleType: 'SYSTEM',
                    createdAt: new Date().toISOString(),
                },
                {
                    id: '3',
                    solutionCode: 'ACM',
                    solutionName: 'Agentic CRM & Marketer',
                    moduleCode: 'AGNT_CRCLM',
                    moduleName: 'CLaaS Curriculum',
                    roleCode: 'VIEWER',
                    roleName: 'Viewer',
                    roleType: 'SYSTEM',
                    createdAt: new Date().toISOString(),
                },
                {
                    id: '4',
                    solutionCode: 'AIW',
                    solutionName: 'Agentic Intelligent Workplace',
                    moduleCode: 'KNL',
                    moduleName: 'Kernel Apps',
                    roleCode: 'GLOBAL_ADMIN',
                    roleName: 'Global Administrator',
                    roleType: 'SYSTEM',
                    createdAt: new Date().toISOString(),
                },
            ]);
        }, 400);
    });
}

/**
 * Create a new security role.
 * Backend replacement: return (await apiClient.post<SecurityRole>('/api/security/roles', payload)).data;
 */
export async function createSecurityRole(
    payload: CreateSecurityRoleRequest,
): Promise<SecurityRole> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                id: crypto.randomUUID(),
                solutionCode: payload.solutionCode,
                solutionName: payload.solutionCode,   // backend will return full name
                moduleCode: payload.moduleCode,
                moduleName: payload.moduleCode,         // backend will return full name
                roleCode: payload.roleCode,
                roleName: payload.roleName,
                roleType: payload.roleType,
                createdAt: new Date().toISOString(),
            });
        }, 500);
    });
}
