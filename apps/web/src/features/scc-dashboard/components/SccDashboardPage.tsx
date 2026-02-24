// features/scc-dashboard/components/SccDashboardPage.tsx
// Security Control Center — Dashboard page.
// Renders inside AppLayout <main>. No sidebar/header modifications.

import { makeStyles, Skeleton, SkeletonItem, Text } from '@fluentui/react-components';
import { AppIcon } from '@/components/AppIcon';
import { useDashboardData } from '../hooks/useDashboardData';
import type { AuditLog, AccessMetricItem, RoleDistributionItem } from '../types/dashboard';

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const useStyles = makeStyles({
    page: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        minHeight: '100%',
    },

    // ── Header ─────────────────────────────────────────────────────────────────
    headerRow: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    headerLeft: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    titleRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    pageTitle: {
        fontSize: '22px',
        fontWeight: '600',
        color: 'var(--color-heading)',
        lineHeight: '1.2',
    },
    pageSubtitle: {
        fontSize: '14px',
        color: 'var(--color-text-muted)',
    },

    // ── Compliance ring ────────────────────────────────────────────────────────
    complianceRing: {
        width: '80px',
        height: '80px',
        flexShrink: '0',
    },
    complianceSvg: {
        width: '80px',
        height: '80px',
    },

    // ── KPI row ───────────────────────────────────────────────────────────────
    kpiRow: {
        display: 'flex',
        gap: '24px',
        flexWrap: 'wrap',
    },
    kpiCard: {
        flex: '1 1 0',
        minWidth: '160px',
        backgroundColor: 'var(--color-bg-surface)',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    kpiIconBox: {
        width: '44px',
        height: '44px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: '0',
    },
    kpiInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
    },
    kpiValue: {
        fontSize: '28px',
        fontWeight: '700',
        color: 'var(--color-heading)',
        lineHeight: '1',
    },
    kpiLabel: {
        fontSize: '13px',
        fontWeight: '600',
        color: 'var(--color-text-secondary)',
    },
    kpiSubtext: {
        fontSize: '11px',
        color: 'var(--color-text-muted-light)',
    },

    // ── Second row ────────────────────────────────────────────────────────────
    metricsRow: {
        display: 'flex',
        gap: '24px',
        flexWrap: 'wrap',
    },
    card: {
        flex: '1 1 0',
        minWidth: '280px',
        backgroundColor: 'var(--color-bg-surface)',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    cardTitle: {
        fontSize: '12px',
        fontWeight: '700',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--color-text-secondary)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },

    // ── Role distribution ─────────────────────────────────────────────────────
    roleRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    roleLabel: {
        fontSize: '12px',
        color: 'var(--color-text-secondary)',
        minWidth: '130px',
        flexShrink: '0',
    },
    roleBarTrack: {
        flex: '1',
        height: '8px',
        borderRadius: '4px',
        backgroundColor: 'var(--color-border)',
        overflow: 'hidden',
    },
    roleBarFill: {
        height: '8px',
        borderRadius: '4px',
        backgroundColor: 'var(--color-brand-primary-alt)',
        transition: 'width 0.4s ease',
    },
    roleCount: {
        fontSize: '12px',
        fontWeight: '600',
        color: 'var(--color-text-secondary)',
        minWidth: '16px',
        textAlign: 'right',
    },

    // ── Access metrics ────────────────────────────────────────────────────────
    metricItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    metricLabelRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    metricLabel: {
        fontSize: '12px',
        color: 'var(--color-text-secondary)',
    },
    metricPct: {
        fontSize: '12px',
        fontWeight: '700',
    },
    metricBarTrack: {
        height: '8px',
        borderRadius: '4px',
        backgroundColor: 'var(--color-border)',
        overflow: 'hidden',
    },
    metricBarFill: {
        height: '8px',
        borderRadius: '4px',
        transition: 'width 0.4s ease',
    },

    // ── Audit table ───────────────────────────────────────────────────────────
    auditCard: {
        backgroundColor: 'var(--color-bg-surface)',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    auditHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    viewAll: {
        fontSize: '13px',
        color: 'var(--color-info-teal)',
        fontWeight: '600',
        cursor: 'pointer',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        ':hover': {
            textDecoration: 'underline',
        },
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    tableHead: {
        borderBottom: '1px solid var(--color-border)',
    },
    th: {
        fontSize: '11px',
        fontWeight: '700',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: 'var(--color-text-muted-light)',
        textAlign: 'left',
        paddingBottom: '10px',
        paddingRight: '16px',
    },
    tr: {
        borderBottom: '1px solid var(--color-border-light)',
    },
    td: {
        fontSize: '13px',
        color: 'var(--color-text-secondary)',
        paddingTop: '12px',
        paddingBottom: '12px',
        paddingRight: '16px',
        verticalAlign: 'top',
    },
    tdEmail: {
        fontSize: '13px',
        color: 'var(--color-info-teal)',
        fontWeight: '500',
        paddingTop: '12px',
        paddingBottom: '12px',
        paddingRight: '16px',
        verticalAlign: 'top',
    },
    tdTimestamp: {
        fontSize: '12px',
        color: 'var(--color-text-muted)',
        paddingTop: '12px',
        paddingBottom: '12px',
        paddingRight: '16px',
        verticalAlign: 'top',
        whiteSpace: 'nowrap',
    },
    tdDetails: {
        fontSize: '12px',
        color: 'var(--color-text-muted)',
        paddingTop: '12px',
        paddingBottom: '12px',
        verticalAlign: 'top',
        maxWidth: '280px',
    },

    // ── Status badges ─────────────────────────────────────────────────────────
    badgeSuccess: {
        display: 'inline-block',
        backgroundColor: 'var(--color-success-bg)',
        color: 'var(--color-success-text)',
        fontSize: '11px',
        fontWeight: '700',
        letterSpacing: '0.04em',
        padding: '3px 10px',
        borderRadius: '999px',
        whiteSpace: 'nowrap',
    },
    badgeDenied: {
        display: 'inline-block',
        backgroundColor: 'var(--color-danger-bg)',
        color: 'var(--color-danger-text)',
        fontSize: '11px',
        fontWeight: '700',
        letterSpacing: '0.04em',
        padding: '3px 10px',
        borderRadius: '999px',
        whiteSpace: 'nowrap',
    },

    // ── Skeleton ──────────────────────────────────────────────────────────────
    skeletonPage: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
    },
    skeletonRow: {
        display: 'flex',
        gap: '24px',
    },
    skeletonCard: {
        flex: '1 1 0',
        borderRadius: '12px',
        overflow: 'hidden',
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// Compliance Ring (SVG)
// ─────────────────────────────────────────────────────────────────────────────
function ComplianceRing({ score }: { score: number }) {
    const styles = useStyles();
    const r = 34;
    const circumference = 2 * Math.PI * r;
    const filled = (score / 100) * circumference;
    const gap = circumference - filled;

    return (
        <div className={styles.complianceRing} role="img" aria-label={`Compliance score: ${score}%`}>
            <svg viewBox="0 0 80 80" className={styles.complianceSvg}>
                {/* Track */}
                <circle cx="40" cy="40" r={r} fill="none" stroke="var(--color-border)" strokeWidth="7" />
                {/* Progress */}
                <circle
                    cx="40"
                    cy="40"
                    r={r}
                    fill="none"
                    stroke="var(--color-success-green)"
                    strokeWidth="7"
                    strokeDasharray={`${filled} ${gap}`}
                    strokeLinecap="round"
                    transform="rotate(-90 40 40)"
                />
                {/* Score number */}
                <text
                    x="40"
                    y="37"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="18"
                    fontWeight="700"
                    fill="var(--color-heading)"
                >
                    {score}
                </text>
                {/* Label */}
                <text
                    x="40"
                    y="51"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="8"
                    fontWeight="600"
                    fill="var(--color-text-muted)"
                    letterSpacing="0.08em"
                >
                    COMPLIANCE
                </text>
            </svg>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI Card
// ─────────────────────────────────────────────────────────────────────────────
interface KpiCardProps {
    iconName: string;
    iconBg: string;
    iconColor: string;
    value: number;
    label: string;
    subtext: string;
}

function KpiCard({ iconName, iconBg, iconColor, value, label, subtext }: KpiCardProps) {
    const styles = useStyles();
    return (
        <div className={styles.kpiCard}>
            <div className={styles.kpiIconBox} style={{ backgroundColor: iconBg }}>
                <span style={{ color: iconColor, display: 'inline-flex' }}>
                    <AppIcon name={iconName as never} size={22} />
                </span>
            </div>
            <div className={styles.kpiInfo}>
                <span className={styles.kpiValue}>{value}</span>
                <span className={styles.kpiLabel}>{label}</span>
                <span className={styles.kpiSubtext}>{subtext}</span>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Role Distribution Card
// ─────────────────────────────────────────────────────────────────────────────
function RoleDistributionCard({ roles }: { roles: RoleDistributionItem[] }) {
    const styles = useStyles();
    return (
        <div className={styles.card}>
            <div className={styles.cardTitle}>
                <AppIcon name="users" size={16} />
                Role Distribution
            </div>
            {roles.map((role) => {
                const pct = Math.round((role.count / role.maxCount) * 100);
                return (
                    <div key={role.roleName} className={styles.roleRow}>
                        <span className={styles.roleLabel}>{role.roleName}</span>
                        <div className={styles.roleBarTrack}>
                            <div className={styles.roleBarFill} style={{ width: `${pct}%` }} />
                        </div>
                        <span className={styles.roleCount}>{role.count}</span>
                    </div>
                );
            })}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Access Metrics Card
// ─────────────────────────────────────────────────────────────────────────────
function AccessMetricsCard({ metrics }: { metrics: AccessMetricItem[] }) {
    const styles = useStyles();
    return (
        <div className={styles.card}>
            <div className={styles.cardTitle}>
                <AppIcon name="chart" size={16} />
                Access Metrics
            </div>
            {metrics.map((m) => (
                <div key={m.label} className={styles.metricItem}>
                    <div className={styles.metricLabelRow}>
                        <span className={styles.metricLabel}>{m.label}</span>
                        <span className={styles.metricPct} style={{ color: m.color }}>
                            {m.percentage}%
                        </span>
                    </div>
                    <div className={styles.metricBarTrack}>
                        <div
                            className={styles.metricBarFill}
                            style={{ width: `${m.percentage}%`, backgroundColor: m.color }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: AuditLog['status'] }) {
    const styles = useStyles();
    return (
        <span className={status === 'SUCCESS' ? styles.badgeSuccess : styles.badgeDenied}>
            {status}
        </span>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Audit Activity Table
// ─────────────────────────────────────────────────────────────────────────────
function AuditActivityCard({ logs }: { logs: AuditLog[] }) {
    const styles = useStyles();
    return (
        <div className={styles.auditCard}>
            <div className={styles.auditHeader}>
                <div className={styles.cardTitle}>
                    <AppIcon name="clipboardTaskList" size={16} />
                    Recent Audit Activity
                </div>
                <a className={styles.viewAll} href="/audit" aria-label="View all audit logs">
                    View All <AppIcon name="arrowRight" size={14} />
                </a>
            </div>

            <table className={styles.table} aria-label="Recent audit activity">
                <thead className={styles.tableHead}>
                    <tr>
                        <th className={styles.th}>Timestamp</th>
                        <th className={styles.th}>User</th>
                        <th className={styles.th}>Action</th>
                        <th className={styles.th}>Status</th>
                        <th className={styles.th}>Details</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log) => (
                        <tr key={log.id} className={styles.tr}>
                            <td className={styles.tdTimestamp}>{log.timestamp}</td>
                            <td className={styles.tdEmail}>{log.userEmail}</td>
                            <td className={styles.td}>{log.action}</td>
                            <td className={styles.td}>
                                <StatusBadge status={log.status} />
                            </td>
                            <td className={styles.tdDetails}>{log.details}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Loading Skeleton
// ─────────────────────────────────────────────────────────────────────────────
function DashboardSkeleton() {
    const styles = useStyles();
    return (
        <div className={styles.skeletonPage}>
            <Skeleton>
                <SkeletonItem shape="rectangle" style={{ height: '48px', width: '320px', borderRadius: '8px' }} />
            </Skeleton>
            <div className={styles.skeletonRow}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={styles.skeletonCard}>
                        <Skeleton>
                            <SkeletonItem shape="rectangle" style={{ height: '90px', borderRadius: '12px' }} />
                        </Skeleton>
                    </div>
                ))}
            </div>
            <div className={styles.skeletonRow}>
                {[1, 2].map((i) => (
                    <div key={i} className={styles.skeletonCard}>
                        <Skeleton>
                            <SkeletonItem shape="rectangle" style={{ height: '220px', borderRadius: '12px' }} />
                        </Skeleton>
                    </div>
                ))}
            </div>
            <Skeleton>
                <SkeletonItem shape="rectangle" style={{ height: '280px', borderRadius: '12px' }} />
            </Skeleton>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export function SccDashboardPage() {
    const styles = useStyles();
    const { data, isLoading, isError } = useDashboardData();

    if (isLoading) return <DashboardSkeleton />;

    if (isError || !data) {
        return (
            <div className={styles.page}>
                <Text style={{ color: 'var(--color-danger-text)' }}>
                    Failed to load dashboard data. Please refresh the page.
                </Text>
            </div>
        );
    }

    const { kpi, roleDistribution, accessMetrics, auditLogs } = data;

    return (
        <div className={styles.page} id="scc-dashboard">
            {/* ── Page Header ──────────────────────────────────────────────────── */}
            <div className={styles.headerRow}>
                <div className={styles.headerLeft}>
                    <div className={styles.titleRow}>
                        <span style={{ color: 'var(--color-brand-primary-alt)', display: 'inline-flex' }}>
                            <AppIcon name="shieldCheck" size={24} />
                        </span>
                        <h1 className={styles.pageTitle}>Security Control Center</h1>
                    </div>
                    <p className={styles.pageSubtitle}>
                        Security Analytics Overview — Users, Roles, Sessions &amp; Audit Activity
                    </p>
                </div>
                <ComplianceRing score={kpi.complianceScore} />
            </div>

            {/* ── KPI Cards ────────────────────────────────────────────────────── */}
            <div className={styles.kpiRow}>
                <KpiCard
                    iconName="users"
                    iconBg="var(--color-info-teal-bg)"
                    iconColor="var(--color-info-teal)"
                    value={kpi.activeUsers}
                    label="Active Users"
                    subtext={`${kpi.activeUsers} total registered`}
                />
                <KpiCard
                    iconName="personStar"
                    iconBg="var(--color-warning-bg)"
                    iconColor="var(--color-warning-text)"
                    value={kpi.roleAssignments}
                    label="Role Assignments"
                    subtext="4 roles defined"
                />
                <KpiCard
                    iconName="success"
                    iconBg="var(--color-success-bg)"
                    iconColor="var(--color-success-text)"
                    value={kpi.successfulSessions}
                    label="Successful Sessions"
                    subtext="92% success rate"
                />
                <KpiCard
                    iconName="warning"
                    iconBg="var(--color-danger-bg)"
                    iconColor="var(--color-danger-text)"
                    value={kpi.anomaliesDetected}
                    label="Anomalies Detected"
                    subtext="1 failed logins · 1 denied actions"
                />
            </div>

            {/* ── Role Distribution + Access Metrics ───────────────────────────── */}
            <div className={styles.metricsRow}>
                <RoleDistributionCard roles={roleDistribution} />
                <AccessMetricsCard metrics={accessMetrics} />
            </div>

            {/* ── Recent Audit Activity ─────────────────────────────────────────── */}
            <AuditActivityCard logs={auditLogs} />
        </div>
    );
}
