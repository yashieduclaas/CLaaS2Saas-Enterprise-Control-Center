// apps/web/src/features/audit/AuditLogViewerPage.tsx
// Audit Log Viewer — Session Logs & Action Logs tabs
// UI matched to UserRoleAssignmentPage style.

import { useState, useMemo } from 'react';
import { makeStyles, mergeClasses, Spinner } from '@fluentui/react-components';
import {
    SearchRegular,
    ListRegular,
    CheckmarkCircleRegular,
    DismissCircleRegular,
    CalendarRegular,
} from '@fluentui/react-icons';
import { usePermissionContext } from '@/rbac/PermissionContext';
import { PageSkeleton } from '@/app/PageSkeleton';
import { useAuditSessionsQuery } from './hooks/useAuditSessionsQuery';
import type { AuditSessionLog, SessionFilter } from './types/auditSession';
import { actionLogs } from './data/mockActionLogs';
import type { ActionLog, ActionLogStatus } from './data/mockActionLogs';

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatSessionStart(isoString: string): string {
    const d = new Date(isoString);
    return d.toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    });
}

function formatDuration(minutes: number | null): string {
    if (minutes === null) return 'Active';
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function matchesSearch(session: AuditSessionLog, query: string): boolean {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
        session.userName.toLowerCase().includes(q) ||
        session.userEmail.toLowerCase().includes(q) ||
        session.ipAddress.toLowerCase().includes(q) ||
        session.deviceBrowser.toLowerCase().includes(q) ||
        session.deviceOS.toLowerCase().includes(q) ||
        session.moduleName.toLowerCase().includes(q) ||
        session.moduleCode.toLowerCase().includes(q)
    );
}

function matchesFilter(session: AuditSessionLog, filter: SessionFilter): boolean {
    if (filter === 'all') return true;
    if (filter === 'successful') return session.status === 'Success';
    if (filter === 'failed') return session.status === 'Failed';
    if (filter === 'active') return session.status === 'Active';
    return true;
}

// ─── Styles ────────────────────────────────────────────────────────────────

const useStyles = makeStyles({

    // ── Page ──
    pageContent: {
        padding: '10px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
    },
    pageHeader: {
        marginBottom: '0px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '16px',
    },
    titleSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    pageTitle: {
        fontSize: '24px',
        fontWeight: 600,
        color: '#193e6b',
        margin: 0,
        lineHeight: 1.3,
    },
    pageSubtitle: {
        fontSize: '14px',
        color: '#666666',
        margin: 0,
    },

    // ── Tabs ──
    tabsRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '0',
        marginBottom: '0px',
        borderBottom: '1px solid #E2E6EA',
    },
    tab: {
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: 500,
        color: '#6B7785',
        background: 'none',
        border: 'none',
        borderBottom: '2px solid transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '-1px',
        ':hover': {
            color: '#2F4A73',
        },
    },
    tabActive: {
        color: '#193E6B',
        fontWeight: 600,
        borderBottom: '3px solid #1F6FD9',
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        boxShadow: '0 -1px 0 #FFFFFF',
    },

    // ── Card ──
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        overflow: 'hidden',
    },

    // ── Filter wrapper ──
    filterWrapper: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        backgroundColor: '#ffffff',
    },

    // ── Search row — icon bahar, input wrapper alag ──
    searchRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
    },
    searchIcon: {
        color: '#9ca3af',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
    },
    searchInputWrapper: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        height: '40px',
        padding: '0 14px',
        backgroundColor: '#ffffff',
        boxSizing: 'border-box',
    },
    searchInput: {
        flex: 1,
        border: 'none',
        outline: 'none',
        background: 'transparent',
        fontSize: '14px',
        color: '#374151',
        padding: '0',
        height: '100%',
        fontFamily: 'inherit',
        WebkitAppearance: 'none',
        appearance: 'none',
        '::placeholder': {
            color: '#9ca3af',
            fontSize: '14px',
        },
    },

    // ── Tab row ──
    tabRow: {
        display: 'inline-flex',
        backgroundColor: '#f1f3f5',
        borderRadius: '10px',
        padding: '4px',
        gap: '4px',
        width: 'fit-content',
    },
    filterTab: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 14px',
        fontSize: '14px',
        color: '#555',
        cursor: 'pointer',
        fontFamily: 'inherit',
        border: 'none',
        borderRadius: '8px',
        background: 'transparent',
        ':hover': {
            backgroundColor: '#e9ecef',
        },
    },
    filterTabActive: {
        backgroundColor: '#ffffff',
        color: '#193e6b',
        fontWeight: 600,
        boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
    },
    tabIcon: {
        display: 'flex',
        alignItems: 'center',
        color: '#276dab',
    },

    // ── Table wrapper ──
    tableWrapper: {
        padding: '10px 25px 25px 25px',
        marginTop: '-20px',
        borderRadius: '8px',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
        height: '420px',
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        '::-webkit-scrollbar': {
            display: 'none',
        },
    },
    dataTable: {
        width: '100%',
        borderCollapse: 'collapse' as const,
        tableLayout: 'auto' as const,
    },
    th: {
        padding: '15px 12px',
        fontSize: '14px',
        fontWeight: 600,
        color: '#193e6b',
        textAlign: 'left',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        whiteSpace: 'nowrap',
        backgroundColor: '#f5f6f8',
        position: 'sticky',
        top: 0,
        zIndex: 20,
    },
    td: {
        padding: '13px 12px',
        fontSize: '14px',
        color: '#333333',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
    },
    tr: {
        ':hover': {
            backgroundColor: 'rgba(0,0,0,0.02)',
        },
    },

    // ── Cell blocks ──
    userBlock: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
    },
    userName: {
        fontWeight: 600,
        color: '#333333',
    },
    userEmail: {
        fontSize: '12px',
        color: '#666666',
    },
    solutionBlock: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
    },
    solutionCode: {
        fontWeight: 600,
        color: '#333333',
    },
    moduleCode: {
        fontSize: '12px',
        color: '#666666',
    },
    dateBlock: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: '#333333',
        fontSize: '14px',
        whiteSpace: 'nowrap' as const,
    },
    dateIcon: {
        color: '#666666',
        flexShrink: 0,
    },
    cellIconRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        whiteSpace: 'nowrap',
    },
    cellIcon: {
        color: '#6B7785',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
    },

    // ── Status badges ──
    badgeSuccess: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 600,
        backgroundColor: 'rgba(95,128,37,0.15)',
        color: '#5F8025',
        whiteSpace: 'nowrap',
    },
    badgeFailed: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 600,
        backgroundColor: 'rgba(198,40,40,0.10)',
        color: '#C62828',
        whiteSpace: 'nowrap',
    },
    badgeActive: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 600,
        backgroundColor: 'rgba(25,62,107,0.10)',
        color: '#193e6b',
        whiteSpace: 'nowrap',
    },

    // ── Footer ──
    footer: {
        padding: '12px 24px',
        borderTop: '1px solid rgba(0,0,0,0.05)',
        fontSize: '12px',
        color: '#666666',
    },

    // ── Empty state ──
    emptyState: {
        textAlign: 'center' as const,
        padding: '48px 24px',
        color: '#666666',
        fontSize: '14px',
    },

    // ── Floating help button ──
    floatingBtn: {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        backgroundColor: '#193E6B',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(25,62,107,0.35)',
        zIndex: 100,
        ':hover': {
            transform: 'scale(1.08)',
        },
    },

    // ── Action log specific ──
    permBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 600,
        backgroundColor: '#EEF2F6',
        color: '#425466',
        whiteSpace: 'nowrap',
    },
    detailsCell: {
        fontSize: '12px',
        color: '#6B7785',
        maxWidth: '240px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
});

// ─── SVG Icons ─────────────────────────────────────────────────────────────

function IconClock() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
    );
}
function IconBolt() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    );
}
function IconHelpCircle() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    );
}
function IconNetwork() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="6" height="6" rx="1" /><rect x="16" y="2" width="6" height="6" rx="1" />
            <rect x="9" y="16" width="6" height="6" rx="1" /><line x1="5" y1="8" x2="5" y2="12" />
            <line x1="19" y1="8" x2="19" y2="12" /><line x1="5" y1="12" x2="12" y2="19" />
            <line x1="19" y1="12" x2="12" y2="19" />
        </svg>
    );
}
function IconMonitor() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
    );
}
function IconMobile() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
    );
}
function DeviceIcon({ type }: { type: AuditSessionLog['deviceType'] }) {
    if (type === 'Mobile') return <IconMobile />;
    return <IconMonitor />;
}

// ─── Status Badge ──────────────────────────────────────────────────────────

function SessionStatusBadge({ status }: { status: AuditSessionLog['status'] }) {
    const styles = useStyles();
    if (status === 'Success') return <span className={styles.badgeSuccess}>Success</span>;
    if (status === 'Failed')  return <span className={styles.badgeFailed}>Failed</span>;
    return <span className={styles.badgeActive}>Active</span>;
}

// ─── Session Filter Tabs config ────────────────────────────────────────────

const SESSION_FILTERS: { key: SessionFilter; label: string; icon: React.ReactNode }[] = [
    { key: 'all',        label: 'All Sessions',      icon: <ListRegular fontSize={16} /> },
    { key: 'successful', label: 'Successful Logins', icon: <CheckmarkCircleRegular fontSize={16} /> },
    { key: 'failed',     label: 'Failed Logins',     icon: <DismissCircleRegular fontSize={16} /> },
    { key: 'active',     label: 'Active Sessions',   icon: <CheckmarkCircleRegular fontSize={16} /> },
];

// ─── Session Logs Table ────────────────────────────────────────────────────

function SessionLogsTable() {
    const styles = useStyles();
    const { data: sessions, isLoading, isError } = useAuditSessionsQuery();
    const [search, setSearch]   = useState('');
    const [filter, setFilter]   = useState<SessionFilter>('all');
    const [focused, setFocused] = useState(false); // ✅ focus state

    const filtered = useMemo(() => {
        if (!sessions) return [];
        return sessions.filter(
            (s) => matchesSearch(s, search) && matchesFilter(s, filter)
        );
    }, [sessions, search, filter]);

    return (
        <>
            {/* ── Filter wrapper ── */}
            <div className={styles.filterWrapper}>

                {/* ── Search bar ── */}
                <div className={styles.searchRow}>
                    {/* Icon — bahar */}
                    <span className={styles.searchIcon}>
                        <SearchRegular fontSize={18} />
                    </span>
                    {/* Input wrapper — border yahan */}
                    <div
                        className={styles.searchInputWrapper}
                        style={focused ? {
                            border: '1px solid #c7d2fe',
                            boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.2)',
                        } : undefined}
                    >
                        <input
                            className={styles.searchInput}
                            type="search"
                            placeholder="Search by User, Email, IP Address, Device, or Module..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onFocus={() => setFocused(true)}
                            onBlur={() => setFocused(false)}
                            aria-label="Search session logs"
                        />
                    </div>
                </div>

                {/* Filter pill tabs */}
                <div className={styles.tabRow} role="tablist" aria-label="Filter by session status">
                    {SESSION_FILTERS.map((f) => (
                        <button
                            key={f.key}
                            type="button"
                            role="tab"
                            aria-selected={filter === f.key}
                            className={mergeClasses(
                                styles.filterTab,
                                filter === f.key && styles.filterTabActive
                            )}
                            onClick={() => setFilter(f.key)}
                        >
                            <span className={styles.tabIcon}>{f.icon}</span>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Table ── */}
            <div className={styles.tableWrapper}>
                {isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                        <Spinner label="Loading session logs…" size="medium" />
                    </div>
                ) : isError ? (
                    <div style={{ padding: '24px', color: '#C62828', fontSize: '14px' }}>
                        Failed to load session logs. Please try again.
                    </div>
                ) : (
                    <table className={styles.dataTable} aria-label="Audit session log table">
                        <thead>
                            <tr>
                                <th className={styles.th}>User</th>
                                <th className={styles.th}>Module</th>
                                <th className={styles.th}>Session Start</th>
                                <th className={styles.th}>Duration</th>
                                <th className={styles.th}>IP Address</th>
                                <th className={styles.th}>Device</th>
                                <th className={styles.th}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className={styles.emptyState}>
                                        No session logs match your search or filter.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((session) => (
                                    <tr key={session.id} className={styles.tr}>

                                        {/* User */}
                                        <td className={styles.td}>
                                            <div className={styles.userBlock}>
                                                <span className={styles.userName}>{session.userName}</span>
                                                <span className={styles.userEmail}>{session.userEmail}</span>
                                            </div>
                                        </td>

                                        {/* Module */}
                                        <td className={styles.td}>
                                            <div className={styles.solutionBlock}>
                                                <span className={styles.solutionCode}>{session.moduleName}</span>
                                                <span className={styles.moduleCode}>{session.moduleCode}</span>
                                            </div>
                                        </td>

                                        {/* Session Start */}
                                        <td className={styles.td}>
                                            <div className={styles.dateBlock}>
                                                <span className={styles.dateIcon}>
                                                    <CalendarRegular fontSize={14} />
                                                </span>
                                                {formatSessionStart(session.sessionStart)}
                                            </div>
                                        </td>

                                        {/* Duration */}
                                        <td className={styles.td}>
                                            {session.status === 'Active'
                                                ? <span className={styles.badgeActive}>Active</span>
                                                : <span>{formatDuration(session.durationMinutes)}</span>
                                            }
                                        </td>

                                        {/* IP Address */}
                                        <td className={styles.td}>
                                            <div className={styles.cellIconRow}>
                                                <span className={styles.cellIcon}><IconNetwork /></span>
                                                <span style={{ fontSize: '13px', color: '#1F2D3D' }}>
                                                    {session.ipAddress}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Device */}
                                        <td className={styles.td}>
                                            <div className={styles.cellIconRow}>
                                                <span className={styles.cellIcon}>
                                                    <DeviceIcon type={session.deviceType} />
                                                </span>
                                                <span style={{ fontSize: '12px', color: '#1F2D3D' }}>
                                                    {session.deviceBrowser} / {session.deviceOS} / {session.deviceType}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className={styles.td}>
                                            <SessionStatusBadge status={session.status} />
                                        </td>

                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Footer */}
            {!isLoading && !isError && (
                <div className={styles.footer}>
                    Showing {filtered.length} of {sessions?.length ?? 0} session logs
                </div>
            )}
        </>
    );
}

// ─── Action Logs Panel ──────────────────────────────────────────────────────

const ACTION_FILTERS: { key: ActionLogStatus | 'all'; label: string; icon: React.ReactNode }[] = [
    { key: 'all',     label: 'All Actions', icon: <ListRegular fontSize={16} /> },
    { key: 'success', label: 'Success',     icon: <CheckmarkCircleRegular fontSize={16} /> },
    { key: 'denied',  label: 'Denied',      icon: <DismissCircleRegular fontSize={16} /> },
    { key: 'error',   label: 'Error',       icon: <DismissCircleRegular fontSize={16} /> },
];

function ActionStatusBadge({ status }: { status: ActionLogStatus }) {
    const styles = useStyles();
    if (status === 'success') return <span className={styles.badgeSuccess}>Success</span>;
    if (status === 'denied')  return <span className={styles.badgeFailed}>Denied</span>;
    return <span className={styles.badgeFailed}>Error</span>;
}

function ActionLogsPanel() {
    const styles = useStyles();
    const [search, setSearch]   = useState('');
    const [filter, setFilter]   = useState<ActionLogStatus | 'all'>('all');
    const [focused, setFocused] = useState(false); // ✅ focus state

    const filtered = useMemo(() => {
        let result = actionLogs;
        if (filter !== 'all') {
            result = result.filter((log: ActionLog) => log.status === filter);
        }
        const q = search.toLowerCase().trim();
        if (q) {
            result = result.filter(
                (log: ActionLog) =>
                    log.name.toLowerCase().includes(q) ||
                    log.action.toLowerCase().includes(q) ||
                    log.permissionCode.toLowerCase().includes(q) ||
                    log.status.toLowerCase().includes(q) ||
                    log.module.toLowerCase().includes(q) ||
                    log.details.toLowerCase().includes(q)
            );
        }
        return result;
    }, [search, filter]);

    return (
        <>
            {/* ── Filter wrapper ── */}
            <div className={styles.filterWrapper}>

                {/* ── Search bar ── */}
                <div className={styles.searchRow}>
                    {/* Icon — bahar */}
                    <span className={styles.searchIcon}>
                        <SearchRegular fontSize={18} />
                    </span>
                    {/* Input wrapper — border yahan */}
                    <div
                        className={styles.searchInputWrapper}
                        style={focused ? {
                            border: '1px solid #c7d2fe',
                            boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.2)',
                        } : undefined}
                    >
                        <input
                            className={styles.searchInput}
                            type="search"
                            placeholder="Search by User, Action, Permission Code, or Status..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onFocus={() => setFocused(true)}
                            onBlur={() => setFocused(false)}
                            aria-label="Search action logs"
                        />
                    </div>
                </div>

                {/* Filter pill tabs */}
                <div className={styles.tabRow} role="tablist" aria-label="Filter by action status">
                    {ACTION_FILTERS.map((f) => (
                        <button
                            key={f.key}
                            type="button"
                            role="tab"
                            aria-selected={filter === f.key}
                            className={mergeClasses(
                                styles.filterTab,
                                filter === f.key && styles.filterTabActive
                            )}
                            onClick={() => setFilter(f.key)}
                        >
                            <span className={styles.tabIcon}>{f.icon}</span>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Table ── */}
            <div className={styles.tableWrapper}>
                <table className={styles.dataTable} aria-label="Audit action log table">
                    <thead>
                        <tr>
                            <th className={styles.th}>User</th>
                            <th className={styles.th}>Action</th>
                            <th className={styles.th}>Permission Code</th>
                            <th className={styles.th}>Module</th>
                            <th className={styles.th}>Timestamp</th>
                            <th className={styles.th}>Status</th>
                            <th className={styles.th}>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={7} className={styles.emptyState}>
                                    No action logs match your search.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((log: ActionLog) => (
                                <tr key={log.id} className={styles.tr}>

                                    {/* User */}
                                    <td className={styles.td}>
                                        <div className={styles.userBlock}>
                                            <span className={styles.userName}>{log.name}</span>
                                            <span className={styles.userEmail}>{log.email}</span>
                                        </div>
                                    </td>

                                    {/* Action */}
                                    <td className={styles.td}>
                                        <span style={{ fontSize: '13px', color: '#1F2D3D', fontWeight: 500 }}>
                                            {log.action}
                                        </span>
                                    </td>

                                    {/* Permission Code */}
                                    <td className={styles.td}>
                                        <span className={styles.permBadge}>{log.permissionCode}</span>
                                    </td>

                                    {/* Module */}
                                    <td className={styles.td}>
                                        <span style={{ fontSize: '13px', color: '#1F2D3D' }}>{log.module}</span>
                                    </td>

                                    {/* Timestamp */}
                                    <td className={styles.td}>
                                        <div className={styles.dateBlock}>
                                            <span className={styles.dateIcon}>
                                                <CalendarRegular fontSize={14} />
                                            </span>
                                            {log.timestamp}
                                        </div>
                                    </td>

                                    {/* Status */}
                                    <td className={styles.td}>
                                        <ActionStatusBadge status={log.status} />
                                    </td>

                                    {/* Details */}
                                    <td className={styles.td}>
                                        <span className={styles.detailsCell} title={log.details}>
                                            {log.details}
                                        </span>
                                    </td>

                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className={styles.footer}>
                Showing {filtered.length} of {actionLogs.length} action logs
            </div>
        </>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

type ActiveTab = 'sessions' | 'actions';

export function AuditLogViewerPage() {
    const { isLoading: permLoading } = usePermissionContext();
    if (permLoading) return <PageSkeleton />;
    return <AuditLogViewerContent />;
}

function AuditLogViewerContent() {
    const styles = useStyles();
    const [activeTab, setActiveTab] = useState<ActiveTab>('sessions');

    return (
        <div className={styles.pageContent}>

            {/* ── Page Header ── */}
            <div className={styles.pageHeader}>
                <div className={styles.titleSection}>
                    <h1 className={styles.pageTitle}>Audit Log Viewer</h1>
                    <p className={styles.pageSubtitle}>
                        Monitor User Sessions, Login Attempts, and System Actions
                    </p>
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className={styles.tabsRow} role="tablist" aria-label="Audit log tabs">
                <button
                    id="tab-session-logs"
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'sessions'}
                    aria-controls="panel-session-logs"
                    className={mergeClasses(styles.tab, activeTab === 'sessions' && styles.tabActive)}
                    onClick={() => setActiveTab('sessions')}
                >
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                        <IconClock />
                    </span>
                    Session Logs
                </button>
                <button
                    id="tab-action-logs"
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'actions'}
                    aria-controls="panel-action-logs"
                    className={mergeClasses(styles.tab, activeTab === 'actions' && styles.tabActive)}
                    onClick={() => setActiveTab('actions')}
                >
                    <span style={{ display: 'flex', alignItems: 'center', color: activeTab === 'actions' ? '#193E6B' : '#C0CAD4' }}>
                        <IconBolt />
                    </span>
                    Action Logs
                </button>
            </div>

            {/* ── Card ── */}
            <div
                id={activeTab === 'sessions' ? 'panel-session-logs' : 'panel-action-logs'}
                role="tabpanel"
                aria-labelledby={activeTab === 'sessions' ? 'tab-session-logs' : 'tab-action-logs'}
                className={styles.card}
            >
                {activeTab === 'sessions' ? <SessionLogsTable /> : <ActionLogsPanel />}
            </div>

            {/* ── Floating Help Button ── */}
            <button
                type="button"
                className={styles.floatingBtn}
                aria-label="Help"
                title="Help"
            >
                <IconHelpCircle />
            </button>

        </div>
    );
}

// Legacy export alias
export { AuditLogViewerPage as AuditActionsPage };