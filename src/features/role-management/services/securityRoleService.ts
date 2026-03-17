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
                    solutionCode: 'AESS',
                    solutionName: 'Agentic ERP & Shared Services',
                    moduleCode: 'AESS',
                    moduleName: 'Agentic ERP & Shared Services',
                    roleCode: 'COLLABORATOR',
                    roleName: 'Collaborator',
                    roleType: 'SYSTEM',
                    createdAt: new Date().toISOString(),
                },
                {
                    id: '2',
                    solutionCode: 'AIW',
                    solutionName: 'Agentic Intelligent Workplace',
                    moduleCode: 'AIW',
                    moduleName: 'Agentic Intelligent Workplace',
                    roleCode: 'CONTRIBUTOR',
                    roleName: 'Contributor',
                    roleType: 'SYSTEM',
                    createdAt: new Date().toISOString(),
                },
                {
                    id: '3',
                    solutionCode: 'ACRM',
                    solutionName: 'Agentic CRM & Marketer',
                    moduleCode: 'ACRM',
                    moduleName: 'Agentic CRM & Marketer',
                    roleCode: 'VIEWER',
                    roleName: 'Viewer',
                    roleType: 'SYSTEM',
                    createdAt: new Date().toISOString(),
                },
                {
                    id: '4',
                    solutionCode: 'ADLT',
                    solutionName: 'Adaptive Learning & Talent',
                    moduleCode: 'ADLT',
                    moduleName: 'Adaptive Learning & Talent',
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
                solutionName: payload.solutionCode,
                moduleCode: payload.moduleCode,
                moduleName: payload.moduleCode,
                roleCode: payload.roleCode,
                roleName: payload.roleName,
                roleType: payload.roleType,
                createdAt: new Date().toISOString(),
            });
        }, 500);
    });
}
