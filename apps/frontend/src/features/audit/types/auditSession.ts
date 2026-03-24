// apps/web/src/features/audit/types/auditSession.ts

export type SessionStatus = 'Success' | 'Failed' | 'Active';
export type SessionFilter = 'all' | 'successful' | 'failed' | 'active';

export interface AuditSessionLog {
    id: string;
    userName: string;
    userEmail: string;
    moduleName: string;
    moduleCode: string;
    sessionStart: string; // ISO string
    durationMinutes: number | null; // null = ongoing (Active)
    ipAddress: string;
    deviceBrowser: string;
    deviceOS: string;
    deviceType: 'Desktop' | 'Mobile' | 'Tablet';
    status: SessionStatus;
}
