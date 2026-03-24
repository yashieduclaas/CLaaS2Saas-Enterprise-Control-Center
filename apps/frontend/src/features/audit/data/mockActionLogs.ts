// apps/web/src/features/audit/data/mockActionLogs.ts
// Mock action log data — replace with real API call when available.

export type ActionLogStatus = 'success' | 'denied' | 'error';

export interface ActionLog {
    id: number;
    name: string;
    email: string;
    action: string;
    permissionCode: string;
    module: string;
    timestamp: string;
    status: ActionLogStatus;
    details: string;
}

export const actionLogs: ActionLog[] = [
    {
        id: 1,
        name: 'Alice Johnson',
        email: 'alice.johnson@lithan.com',
        action: 'RoleAssignment',
        permissionCode: 'ROLE_ASSIGN',
        module: 'ADC / AGNT_HR',
        timestamp: 'Dec 14, 2025, 08:35:00 AM',
        status: 'success',
        details: 'Assigned Contributor role to Bob Smith',
    },
    {
        id: 2,
        name: 'Alice Johnson',
        email: 'alice.johnson@lithan.com',
        action: 'UserProfileUpdate',
        permissionCode: 'USER_UPDATE',
        module: 'ADC / AGNT_HR',
        timestamp: 'Dec 14, 2025, 09:10:00 AM',
        status: 'success',
        details: 'Updated org role for bob.smith@lithan.com',
    },
    {
        id: 3,
        name: 'Admin User',
        email: 'admin@lithan.com',
        action: 'ModuleRegistration',
        permissionCode: 'MODULE_CREATE',
        module: 'AIW / KNL',
        timestamp: 'Dec 13, 2025, 02:25:00 PM',
        status: 'success',
        details: 'Registered new module Agentic Procurement',
    },
    {
        id: 4,
        name: 'Bob Smith',
        email: 'bob.smith@lithan.com',
        action: 'CourseView',
        permissionCode: 'COURSE_READ',
        module: 'AIW / AGNT_TLNT',
        timestamp: 'Dec 14, 2025, 09:20:00 AM',
        status: 'denied',
        details: 'Attempted to access admin settings — insufficient permissions',
    },
];
