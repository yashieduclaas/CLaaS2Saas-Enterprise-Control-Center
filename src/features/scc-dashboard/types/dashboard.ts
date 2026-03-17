// features/scc-dashboard/types/dashboard.ts

export interface DashboardKpi {
    activeUsers: number;
    roleAssignments: number;
    successfulSessions: number;
    anomaliesDetected: number;
    complianceScore: number;
}

export interface RoleDistributionItem {
    roleName: string;
    count: number;
    maxCount: number;
}

export interface AccessMetricItem {
    label: string;
    percentage: number;
    color: string;
}

export interface AuditLog {
    id: string;
    timestamp: string;
    userEmail: string;
    action: string;
    status: 'SUCCESS' | 'DENIED';
    details: string;
}

export interface DashboardData {
    kpi: DashboardKpi;
    roleDistribution: RoleDistributionItem[];
    accessMetrics: AccessMetricItem[];
    auditLogs: AuditLog[];
}
