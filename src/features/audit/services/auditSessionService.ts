// apps/web/src/features/audit/services/auditSessionService.ts
// Mock service — wire to real API endpoint when available.

import type { AuditSessionLog } from '../types/auditSession';

const MOCK_SESSIONS: AuditSessionLog[] = [
    {
        id: 'sess-001',
        userName: 'Alice Johnson',
        userEmail: 'alice.johnson@ithan.com',
        moduleName: 'ABC',
        moduleCode: 'AGNT_HR',
        sessionStart: '2025-12-14T08:30:00.000Z',
        durationMinutes: 255, // 4h 15m
        ipAddress: '192.168.1.105',
        deviceBrowser: 'Chrome 120.0.0',
        deviceOS: 'Windows 10',
        deviceType: 'Desktop',
        status: 'Success',
    },
    {
        id: 'sess-002',
        userName: 'Bob Smith',
        userEmail: 'bob.smith@ithan.com',
        moduleName: 'AfW',
        moduleCode: 'AGNT_TLNT',
        sessionStart: '2025-12-14T09:15:00.000Z',
        durationMinutes: null, // Active
        ipAddress: '192.168.1.142',
        deviceBrowser: 'Safari 17.1',
        deviceOS: 'macOS 14.1',
        deviceType: 'Desktop',
        status: 'Active',
    },
    {
        id: 'sess-003',
        userName: 'Alice Johnson',
        userEmail: 'alice.johnson@ithan.com',
        moduleName: 'ABC',
        moduleCode: 'AGNT_HR',
        sessionStart: '2025-12-14T07:00:00.000Z',
        durationMinutes: 2,
        ipAddress: '201.45.67.89',
        deviceBrowser: 'Chrome 120.0.0',
        deviceOS: 'Android 14',
        deviceType: 'Mobile',
        status: 'Failed',
    },
    {
        id: 'sess-004',
        userName: 'Admin User',
        userEmail: 'admin@ithan.com',
        moduleName: 'AfW',
        moduleCode: 'KRL',
        sessionStart: '2025-12-13T14:20:00.000Z',
        durationMinutes: 250, // 4h 10m
        ipAddress: '192.168.1.98',
        deviceBrowser: 'Firefox 121.0',
        deviceOS: 'Ubuntu 22.04',
        deviceType: 'Desktop',
        status: 'Success',
    },
    {
        id: 'sess-005',
        userName: 'Admin User',
        userEmail: 'admin@ithan.com',
        moduleName: 'AfW',
        moduleCode: 'KRL',
        sessionStart: '2026-02-16T17:50:09.000Z',
        durationMinutes: null, // Active
        ipAddress: '192.168.1.43',
        deviceBrowser: 'Mozilla/5.0',
        deviceOS: 'Windows NT 10.0; Win64',
        deviceType: 'Desktop',
        status: 'Active',
    },
];

export const auditSessionService = {
    getSessions: async (): Promise<AuditSessionLog[]> => {
        // Simulate network delay
        await new Promise((r) => setTimeout(r, 400));
        return MOCK_SESSIONS;
    },
};
