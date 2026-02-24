// features/scc-dashboard/services/dashboardService.ts
// Pure data layer — no React, no UI logic.
// Replace mock with: return apiClient.get('/scc/dashboard');

import type { DashboardData } from '../types/dashboard';

const MOCK_DELAY_MS = 600;

const mockData: DashboardData = {
    kpi: {
        activeUsers: 3,
        roleAssignments: 3,
        successfulSessions: 12,
        anomaliesDetected: 2,
        complianceScore: 88,
    },
    roleDistribution: [
        { roleName: 'Collaborator', count: 1, maxCount: 4 },
        { roleName: 'Contributor', count: 1, maxCount: 4 },
        { roleName: 'Viewer', count: 1, maxCount: 4 },
        { roleName: 'Global Administrator', count: 1, maxCount: 4 },
    ],
    accessMetrics: [
        { label: 'Session Success Rate', percentage: 92, color: 'var(--color-success-green)' },
        { label: 'Action Success Rate', percentage: 75, color: 'var(--color-info-teal)' },
        { label: 'Users with Roles', percentage: 67, color: 'var(--color-warning-text)' },
        { label: 'Active Modules Coverage', percentage: 25, color: 'var(--color-chart-purple)' },
    ],
    auditLogs: [
        {
            id: '1',
            timestamp: '14 Dec 2025 09:20',
            userEmail: 'bob.smith@lithan.com',
            action: 'CourseView',
            status: 'DENIED',
            details: 'Attempted to access admin settings — insufficient permissions',
        },
        {
            id: '2',
            timestamp: '14 Dec 2025 09:10',
            userEmail: 'alice.johnson@lithan.com',
            action: 'UserProfileUpdate',
            status: 'SUCCESS',
            details: 'Updated org_role for bob.smith@lithan.com',
        },
        {
            id: '3',
            timestamp: '14 Dec 2025 08:35',
            userEmail: 'alice.johnson@lithan.com',
            action: 'RoleAssignment',
            status: 'SUCCESS',
            details: 'Assigned Contributor role to Bob Smith for AGNT_TLNT',
        },
        {
            id: '4',
            timestamp: '13 Dec 2025 14:25',
            userEmail: 'admin@lithan.com',
            action: 'ModuleRegistration',
            status: 'SUCCESS',
            details: 'Registered new module Agentic Procurement under AES',
        },
    ],
};

export async function getDashboardData(): Promise<DashboardData> {
    // Simulate network latency
    await new Promise<void>((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
    // TODO: replace with → return apiClient.get('/scc/dashboard');
    return mockData;
}
