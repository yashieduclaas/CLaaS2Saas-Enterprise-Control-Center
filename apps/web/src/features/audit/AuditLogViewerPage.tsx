// apps/web/src/features/audit/AuditLogViewerPage.tsx
// Audit Log Viewer — Session Logs & Action Logs tabs
// Enterprise shell spec — Griffel (makeStyles) + native table.

import { useState, useMemo } from 'react';
import { makeStyles, mergeClasses, Spinner } from '@fluentui/react-components';
import { usePermissionContext } from '@/rbac/PermissionContext';
import { PageSkeleton } from '@/app/PageSkeleton';
import { useAuditSessionsQuery } from './hooks/useAuditSessionsQuery';
import type { AuditSessionLog, SessionFilter } from './types/auditSession';

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
    // Page wrapper
    pageContent: {
        padding: '10px 18px',
        backgroundColor: '#EEE7E0',
        minHeight: '100%',
        fontFamily: 'Inter, system-ui, sans-serif',
    },

    // Header
    pageHeader: {
        marginBottom: '24px',
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
        color: '#6B7785',
        margin: 0,
    },

    // Tabs
    tabsRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '0',
        marginBottom: '20px',
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
        transition: 'color 0.15s ease, border-color 0.15s ease',
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
    tabDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: '#2F4A73',
        flexShrink: 0,
    },

    // Card
    card: {
         backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.06)',

        display: 'flex',
        flexDirection: 'column',
        gap: '16px',

        height: '520px', 
        overflow: 'hidden'
    },

    // Search
    searchWrap: {
        position: 'relative',
    },
    searchIcon: {
        position: 'absolute',
        left: '14px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#6B7785',
        fontSize: '16px',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
    },
    searchInput: {
        width: '100%',
        height: '44px',
        borderRadius: '8px',
        border: '1px solid #E6ECF3',
        backgroundColor: '#FFFFFF',
        paddingLeft: '42px',
        paddingRight: '16px',
        fontSize: '13px',
        color: '#1F2D3D',
        outline: 'none',
        boxSizing: 'border-box',
        fontFamily: 'Inter, system-ui, sans-serif',
    },

    // Filter pills
    filterRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
        backgroundColor: '#EEF1F5',
        padding: '6px',
        borderRadius: '8px',
        width: 'fit-content',
    },
    filterPill: {
        padding: '6px 16px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 500,
        background: '#F1F4F9',
        border: '1px solid transparent',
        cursor: 'pointer',
        color: '#6B7785',
        transition: 'all 0.15s ease',
        ':hover': {
            color: '#1F2D3D',
            background: '#E9EDF5',
        },
    },
    filterPillActive: {
        backgroundColor: '#FFFFFF',
        border: '1px solid #E6ECF3',
        color: '#193e6b',
        fontWeight: 600,
        borderRadius: '6px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    },

    // Table
    tableWrap: {
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
        scrollbarWidth: 'none',   // Firefox
        msOverflowStyle: 'none',  // IE / Edge
        '::-webkit-scrollbar': {
            display: 'none'       // Chrome / Safari
        }
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: 700,
        color: '#193E6B',
        textAlign: 'left',
        borderBottom: '1px solid #E6ECF3',
        whiteSpace: 'nowrap',
        backgroundColor: '#F8F6F3',
        position: 'sticky',
        top: 0,
        zIndex: 10
    },
    theadRow: {
    backgroundColor: '#F5F3F0',
},
    tr: {
        height: '64px',
        borderBottom: '1px solid #E6ECF3',
        ':hover': {
            backgroundColor: '#F7F3EE',
        },
    },
    trLast: {
        borderBottom: 'none',
    },
    td: {
        padding: '12px 16px',
        fontSize: '13px',
        color: '#1F2D3D',
        verticalAlign: 'middle',
    },

    // Cell components
    cellPrimary: {
        fontSize: '13px',
        fontWeight: 600,
        color: '#1F2D3D',
        display: 'block',
        whiteSpace: 'nowrap',
    },
    cellSecondary: {
        fontSize: '12px',
        color: '#6B7785',
        display: 'block',
        whiteSpace: 'nowrap',
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

    // Status badges
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
        padding: '4px 0',
        fontSize: '12px',
        fontWeight: 600,
        color: '#C62828',
    },
    badgeActive: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 600,
        backgroundColor: 'rgba(95,128,37,0.15)',
        color: '#5F8025',
    },

    // Footer
    footer: {
        fontSize: '12px',
        color: '#6B7785',
        paddingTop: '8px',
    },

    // Floating help button
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
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        ':hover': {
            transform: 'scale(1.08)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        },
    },

    // Action logs placeholder
    placeholderWrap: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px',
        gap: '12px',
        color: '#6B7785',
    },
    placeholderIcon: {
        fontSize: '48px',
        marginBottom: '8px',
    },
    placeholderTitle: {
        fontSize: '16px',
        fontWeight: 600,
        color: '#1F2D3D',
    },
    placeholderText: {
        fontSize: '13px',
        color: '#6B7785',
        textAlign: 'center',
    },
});

// ─── Sub-components ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AuditSessionLog['status'] }) {
    const styles = useStyles();
    if (status === 'Success') return <span className={styles.badgeSuccess}>Success</span>;
    if (status === 'Failed') return <span className={styles.badgeFailed}>Failed</span>;
    return <span className={styles.badgeActive}>Active</span>;
}

function DurationCell({ minutes, status }: { minutes: number | null; status: AuditSessionLog['status'] }) {
    const styles = useStyles();
    if (status === 'Active') {
        return <span className={styles.badgeActive}>Active</span>;
    }
    return <span>{formatDuration(minutes)}</span>;
}

// SVG Icons (inline, lightweight)
function IconSearch() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    );
}
function IconClock() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
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


function DeviceIcon({ type }: { type: AuditSessionLog['deviceType'] }) {
    if (type === 'Mobile') return <IconMobile />;
    return <IconMonitor />;
}

// ─── Session Table ──────────────────────────────────────────────────────────

function SessionLogsTable() {
    const styles = useStyles();
    const { data: sessions, isLoading, isError } = useAuditSessionsQuery();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<SessionFilter>('all');

    const filtered = useMemo(() => {
        if (!sessions) return [];
        return sessions.filter(
            (s) => matchesSearch(s, search) && matchesFilter(s, filter)
        );
    }, [sessions, search, filter]);

    const FILTERS: { key: SessionFilter; label: string }[] = [
        { key: 'all', label: 'All Sessions' },
        { key: 'successful', label: 'Successful Logins' },
        { key: 'failed', label: 'Failed Logins' },
        { key: 'active', label: 'Active Sessions' },
    ];

    return (
        <>
            {/* Scoped input styles that Griffel can't express */}
            <style>{`
                #audit-session-search:focus { border-color: #193E6B; box-shadow: 0 0 0 2px rgba(25,62,107,0.12); }
                #audit-session-search::placeholder { color: #9DA8B5; }
            `}</style>

            {/* Search */}
            <div className={styles.searchWrap}>
                <span className={styles.searchIcon}><IconSearch /></span>
                <input
                    id="audit-session-search"
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search by User, Email, IP Address, Device, Module, or Session Token..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search session logs"
                />
            </div>

            {/* Filter pills */}
            <div className={styles.filterRow} role="group" aria-label="Filter sessions">
                {FILTERS.map((f) => (
                    <button
                        key={f.key}
                        id={`filter-${f.key}`}
                        type="button"
                        className={mergeClasses(styles.filterPill, filter === f.key && styles.filterPillActive)}
                        onClick={() => setFilter(f.key)}
                        aria-pressed={filter === f.key}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className={styles.tableWrap}>
                {isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                        <Spinner label="Loading session logs…" size="medium" />
                    </div>
                ) : isError ? (
                    <div style={{ padding: '24px', color: '#C62828', fontSize: '14px' }}>
                        Failed to load session logs. Please try again.
                    </div>
                ) : (
                    <table className={styles.table} aria-label="Audit session log table">
                        <thead>
                            <tr>
                                <th className={styles.th}>User</th>
                                <th className={styles.th}>Module</th>
                                <th className={styles.th}>Session Start</th>
                                <th className={styles.th}>Duration</th>
                                <th className={styles.th}>IP Address</th>
                                <th className={styles.th}>Device</th>
                                <th className={styles.th} style={{ textAlign: 'right' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((session, idx) => (
                                <tr
                                    key={session.id}
                                    className={mergeClasses(styles.tr, idx === filtered.length - 1 && styles.trLast)}
                                >
                                    {/* User */}
                                    <td className={styles.td}>
                                        <span className={styles.cellPrimary}>{session.userName}</span>
                                        <span className={styles.cellSecondary}>{session.userEmail}</span>
                                    </td>

                                    {/* Module */}
                                    <td className={styles.td}>
                                        <span className={styles.cellPrimary}>{session.moduleName}</span>
                                        <span className={styles.cellSecondary}>{session.moduleCode}</span>
                                    </td>

                                    {/* Session Start */}
                                    <td className={styles.td}>
                                        <div className={styles.cellIconRow}>
                                            <span className={styles.cellIcon}><IconClock /></span>
                                            <span style={{ fontSize: '12px', color: '#193E6B', fontWeight: 500 }}>
                                                {formatSessionStart(session.sessionStart)}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Duration */}
                                    <td className={styles.td}>
                                        <DurationCell minutes={session.durationMinutes} status={session.status} />
                                    </td>

                                    {/* IP Address */}
                                    <td className={styles.td}>
                                        <div className={styles.cellIconRow}>
                                            <span className={styles.cellIcon}><IconNetwork /></span>
                                            <span style={{ fontSize: '13px', color: '#1F2D3D' }}>{session.ipAddress}</span>
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
                                    <td className={styles.td} style={{ textAlign: 'center' }}>
                                        <StatusBadge status={session.status} />
                                    </td>
                                </tr>
                            ))}
                            {!isLoading && !isError && filtered.length === 0 && (
                                <tr>
                                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#6B7785', fontSize: '13px' }}>
                                        No session logs match your search or filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Footer */}
            {!isLoading && !isError && (
                <div className={styles.footer} role="status" aria-live="polite">
                    Showing {filtered.length} of {sessions?.length ?? 0} session logs
                </div>
            )}
        </>
    );
}

// ─── Action Logs Panel ──────────────────────────────────────────────────────

import { actionLogs } from './data/mockActionLogs';
import type { ActionLog, ActionLogStatus } from './data/mockActionLogs';

// Additional Griffel styles injected once – action logs specifics
const useActionStyles = makeStyles({
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
        letterSpacing: '0.2px',
    },
    statusSuccess: {
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
    statusDenied: {
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: '12px',
        fontWeight: 600,
        color: '#C62828',
        padding: '4px 0',
    },
    statusError: {
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: '12px',
        fontWeight: 600,
        color: '#E65100',
        padding: '4px 0',
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

function PermissionBadge({ code }: { code: string }) {
    const s = useActionStyles();
    return <span className={s.permBadge}>{code}</span>;
}

function ActionStatusBadge({ status }: { status: ActionLogStatus }) {
    const s = useActionStyles();
    if (status === 'success') return <span className={s.statusSuccess}>Success</span>;
    if (status === 'denied') return <span className={s.statusDenied}>Denied</span>;
    return <span className={s.statusError}>Error</span>;
}

function ActionLogsPanel() {
    const styles = useStyles();
    const actionStyles = useActionStyles();
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return actionLogs;
        return actionLogs.filter(
            (log: ActionLog) =>
                log.name.toLowerCase().includes(q) ||
                log.action.toLowerCase().includes(q) ||
                log.permissionCode.toLowerCase().includes(q) ||
                log.status.toLowerCase().includes(q) ||
                log.module.toLowerCase().includes(q) ||
                log.details.toLowerCase().includes(q)
        );
    }, [search]);

    return (
        <>
            {/* Scoped styles for action-log search input */}
            <style>{`
                #action-log-search:focus { border-color: #193E6B; box-shadow: 0 0 0 2px rgba(25,62,107,0.12); }
                #action-log-search::placeholder { color: #9DA8B5; }
            `}</style>

            {/* Search */}
            <div className={styles.searchWrap}>
                <span className={styles.searchIcon}><IconSearch /></span>
                <input
                    id="action-log-search"
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search by User, Action, Permission Code, or Status..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search action logs"
                />
            </div>

            {/* Table */}
            <div className={styles.tableWrap}>
                <table className={styles.table} aria-label="Audit action log table">
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
                        {filtered.map((log: ActionLog, idx: number) => (
                            <tr
                                key={log.id}
                                className={mergeClasses(styles.tr, idx === filtered.length - 1 && styles.trLast)}
                            >
                                {/* User */}
                                <td className={styles.td}>
                                    <span className={styles.cellPrimary}>{log.name}</span>
                                    <span className={styles.cellSecondary}>{log.email}</span>
                                </td>

                                {/* Action */}
                                <td className={styles.td}>
                                    <span style={{ fontSize: '13px', color: '#1F2D3D', fontWeight: 500 }}>{log.action}</span>
                                </td>

                                {/* Permission Code */}
                                <td className={styles.td}>
                                    <PermissionBadge code={log.permissionCode} />
                                </td>

                                {/* Module */}
                                <td className={styles.td}>
                                    <span style={{ fontSize: '13px', color: '#1F2D3D' }}>{log.module}</span>
                                </td>

                                {/* Timestamp */}
                                <td className={styles.td}>
                                    <div className={styles.cellIconRow}>
                                        <span className={styles.cellIcon}><IconClock /></span>
                                        <span style={{ fontSize: '12px', color: '#193E6B', fontWeight: 500 }}>
                                            {log.timestamp}
                                        </span>
                                    </div>
                                </td>

                                {/* Status */}
                                <td className={styles.td}>
                                    <ActionStatusBadge status={log.status} />
                                </td>

                                {/* Details */}
                                <td className={styles.td}>
                                    <span className={actionStyles.detailsCell} title={log.details}>
                                        {log.details}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#6B7785', fontSize: '13px' }}>
                                    No action logs match your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className={styles.footer} role="status" aria-live="polite">
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
                <h1 className={styles.pageTitle}>Audit Log Viewer</h1>
                <p className={styles.pageSubtitle}>Monitor User Sessions, Login Attempts, and System Actions</p>
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
                     <span style={{ display: "flex", alignItems: "center" }}>
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
                    <span aria-hidden style={{ display: 'flex', alignItems: 'center', color: activeTab === 'actions' ? '#193E6B' : '#C0CAD4' }}>
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
                id="btn-floating-help"
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

// Legacy export alias so existing router import still resolves
export { AuditLogViewerPage as AuditActionsPage };
