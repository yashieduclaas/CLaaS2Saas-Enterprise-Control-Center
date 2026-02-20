// apps/web/src/features/user-role-assign/components/AssignmentTable.tsx
// FEATURE FILE — Table for displaying User Role Assignments.
// Columns: Actions | User | Solution/Module | Role | Assigned Date | Disable Date | Assigned By | Status
//
// Owns: which row is being edited (local editing state)
// Delegates: list-level state update to parent via onUpdated prop

import { useState } from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';
import { EditRegular, DeleteRegular, CalendarRegular } from '@fluentui/react-icons';
import { RoleBadge } from './RoleBadge';
import { StatusBadge } from './StatusBadge';
import { EditRoleAssignmentModal } from './EditRoleAssignmentModal';
import type { UserRoleAssignment } from '../types/security';

// ── Date formatting ──────────────────────────────────────────────────────────

function formatDate(iso: string): string {
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    }).format(new Date(iso));
}

// ── Styles ───────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    headerRow: {
        borderBottom: `2px solid ${tokens.colorNeutralStroke2}`,
        backgroundColor: tokens.colorNeutralBackground3,
    },
    headerCell: {
        padding: tokens.spacingVerticalM,
        paddingLeft: tokens.spacingHorizontalL,
        paddingRight: tokens.spacingHorizontalL,
        fontSize: tokens.fontSizeBase200,
        fontWeight: tokens.fontWeightSemibold,
        color: tokens.colorNeutralForeground2,
        textAlign: 'left',
        verticalAlign: 'middle',
        whiteSpace: 'nowrap',
        textTransform: 'uppercase',
        letterSpacing: '0.4px',
    },
    row: {
        borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
        ':hover': {
            backgroundColor: tokens.colorNeutralBackground1Hover,
        },
    },
    cell: {
        padding: tokens.spacingVerticalM,
        paddingLeft: tokens.spacingHorizontalL,
        paddingRight: tokens.spacingHorizontalL,
        fontSize: tokens.fontSizeBase300,
        color: tokens.colorNeutralForeground1,
        verticalAlign: 'middle',
    },
    userBlock: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
    },
    userName: {
        fontWeight: tokens.fontWeightSemibold,
        color: tokens.colorNeutralForeground1,
    },
    userEmail: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3,
    },
    solutionBlock: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
    },
    solutionCode: {
        fontWeight: tokens.fontWeightSemibold,
        color: tokens.colorNeutralForeground1,
    },
    moduleCode: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3,
    },
    dateBlock: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: tokens.colorNeutralForeground2,
        fontSize: tokens.fontSizeBase200,
        whiteSpace: 'nowrap',
    },
    dateIcon: {
        color: tokens.colorNeutralForeground3,
        flexShrink: 0,
    },
    dash: {
        color: tokens.colorNeutralForeground4,
    },
    actionsCell: {
        display: 'flex',
        gap: tokens.spacingHorizontalXS,
        alignItems: 'center',
    },
    iconButton: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '30px',
        height: '30px',
        borderRadius: tokens.borderRadiusMedium,
        border: 'none',
        background: 'transparent',
        color: tokens.colorNeutralForeground2,
        cursor: 'pointer',
        ':hover': {
            backgroundColor: tokens.colorNeutralBackground1Hover,
            color: tokens.colorNeutralForeground1,
        },
    },
    emptyState: {
        textAlign: 'center',
        padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalM}`,
        color: tokens.colorNeutralForeground3,
        fontSize: tokens.fontSizeBase300,
    },
});

// ── Component ─────────────────────────────────────────────────────────────────

export interface AssignmentTableProps {
    assignments: UserRoleAssignment[];
    /** Called with the immutably updated record after a successful edit save. */
    onUpdated: (updated: UserRoleAssignment) => void;
    onDelete: (id: string) => void;
}

export function AssignmentTable({ assignments, onUpdated, onDelete }: AssignmentTableProps) {
    const styles = useStyles();

    // Local state: which assignment is being edited
    const [editing, setEditing] = useState<UserRoleAssignment | null>(null);

    return (
        <>
            <table className={styles.table} aria-label="User role assignments table">
                <thead>
                    <tr className={styles.headerRow}>
                        <th className={styles.headerCell}>Actions</th>
                        <th className={styles.headerCell}>User</th>
                        <th className={styles.headerCell}>Solution / Module</th>
                        <th className={styles.headerCell}>Role</th>
                        <th className={styles.headerCell}>Assigned Date</th>
                        <th className={styles.headerCell}>Disable Date</th>
                        <th className={styles.headerCell}>Assigned By</th>
                        <th className={styles.headerCell}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {assignments.length === 0 ? (
                        <tr>
                            <td colSpan={8} className={styles.emptyState}>
                                No assignments found.
                            </td>
                        </tr>
                    ) : (
                        assignments.map(row => (
                            <tr key={row.id} className={styles.row}>
                                {/* Actions */}
                                <td className={styles.cell}>
                                    <div className={styles.actionsCell}>
                                        <button
                                            type="button"
                                            className={styles.iconButton}
                                            onClick={() => setEditing(row)}
                                            aria-label={`Edit assignment for ${row.userName}`}
                                        >
                                            <EditRegular fontSize={16} />
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.iconButton}
                                            onClick={() => { console.log('Delete', row.id); onDelete(row.id); }}
                                            aria-label={`Delete assignment for ${row.userName}`}
                                        >
                                            <DeleteRegular fontSize={16} />
                                        </button>
                                    </div>
                                </td>

                                {/* User */}
                                <td className={styles.cell}>
                                    <div className={styles.userBlock}>
                                        <span className={styles.userName}>{row.userName}</span>
                                        <span className={styles.userEmail}>{row.userEmail}</span>
                                    </div>
                                </td>

                                {/* Solution / Module */}
                                <td className={styles.cell}>
                                    <div className={styles.solutionBlock}>
                                        <span className={styles.solutionCode}>{row.solutionCode}</span>
                                        <span className={styles.moduleCode}>{row.moduleCode}</span>
                                    </div>
                                </td>

                                {/* Role */}
                                <td className={styles.cell}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <RoleBadge roleCode={row.roleCode} roleLabel={row.roleCode.replace('_', ' ')} />
                                        <span style={{ fontSize: '11px', color: '#757575' }}>{row.roleLabel}</span>
                                    </div>
                                </td>

                                {/* Assigned Date */}
                                <td className={styles.cell}>
                                    <div className={styles.dateBlock}>
                                        <span className={styles.dateIcon}><CalendarRegular fontSize={14} /></span>
                                        {formatDate(row.assignedDate)}
                                    </div>
                                </td>

                                {/* Disable Date */}
                                <td className={styles.cell}>
                                    {row.disableDate ? (
                                        <div className={styles.dateBlock}>
                                            <span className={styles.dateIcon}><CalendarRegular fontSize={14} /></span>
                                            {formatDate(row.disableDate)}
                                        </div>
                                    ) : (
                                        <span className={styles.dash}>—</span>
                                    )}
                                </td>

                                {/* Assigned By */}
                                <td className={styles.cell}>{row.assignedBy}</td>

                                {/* Status */}
                                <td className={styles.cell}>
                                    <StatusBadge status={row.status} />
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Edit modal — rendered outside <table> to avoid invalid DOM nesting */}
            <EditRoleAssignmentModal
                open={!!editing}
                assignment={editing}
                onClose={() => setEditing(null)}
                onUpdated={updated => {
                    onUpdated(updated);
                    setEditing(null);
                }}
            />
        </>
    );
}
