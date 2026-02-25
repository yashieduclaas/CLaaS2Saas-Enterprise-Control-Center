// apps/web/src/features/user-role-assign/components/AssignmentTable.tsx
// FEATURE FILE — Table for displaying User Role Assignments.
// Vanilla table spec — identical base table styles.

import { useState } from 'react';
import { makeStyles } from '@fluentui/react-components';
import { getModuleName } from '@/constants/modules';
import { EditRegular, DeleteRegular, CalendarRegular } from '@fluentui/react-icons';
import { RoleBadge } from './RoleBadge';
import { StatusBadge } from './StatusBadge';
import { EditRoleAssignmentModal } from './EditRoleAssignmentModal';
import type { UserRoleAssignment } from '../types/security';

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

const useStyles = makeStyles({
  tableWrapper: {
    padding: '25px',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
    overflowX: 'auto' as const,
  },
  dataTable: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  th: {
    padding: '15px 12px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#193e6b',
    textAlign: 'left' as const,
    borderBottom: '1px solid rgba(0,0,0,0.05)',
  },
  td: {
    padding: '15px 12px',
    fontSize: '14px',
    color: '#333333',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
  },
  tr: {
    ':hover': {
      backgroundColor: 'rgba(0,0,0,0.02)',
    },
  },
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
  dash: {
    color: '#999999',
  },
  actionsCell: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  iconBtn: {
    padding: '6px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666666',
    ':hover': {
      background: 'rgba(0,0,0,0.05)',
    },
  },
  roleBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  roleLabel: {
    fontSize: '11px',
    color: '#666666',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '48px 24px',
    color: '#666666',
    fontSize: '14px',
  },
});

export interface AssignmentTableProps {
  assignments: UserRoleAssignment[];
  onUpdated: (updated: UserRoleAssignment) => void;
  onDelete: (id: string) => void;
}

export function AssignmentTable({ assignments, onUpdated, onDelete }: AssignmentTableProps) {
  const styles = useStyles();
  const [editing, setEditing] = useState<UserRoleAssignment | null>(null);

  return (
    <>
      <div className={styles.tableWrapper}>
        <table className={styles.dataTable} aria-label="User role assignments table">
          <thead>
            <tr>
              <th className={styles.th}>Actions</th>
              <th className={styles.th}>User</th>
              <th className={styles.th}>Solution / Module</th>
              <th className={styles.th}>Role</th>
              <th className={styles.th}>Assigned Date</th>
              <th className={styles.th}>Disable Date</th>
              <th className={styles.th}>Assigned By</th>
              <th className={styles.th}>Status</th>
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
              assignments.map((row) => (
                <tr key={row.id} className={styles.tr}>
                  <td className={styles.td}>
                    <div className={styles.actionsCell}>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => setEditing(row)}
                        aria-label={`Edit assignment for ${row.userName}`}
                      >
                        <EditRegular fontSize={16} />
                      </button>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => { console.log('Delete', row.id); onDelete(row.id); }}
                        aria-label={`Delete assignment for ${row.userName}`}
                      >
                        <DeleteRegular fontSize={16} />
                      </button>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.userBlock}>
                      <span className={styles.userName}>{row.userName}</span>
                      <span className={styles.userEmail}>{row.userEmail}</span>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.solutionBlock}>
                      <span className={styles.solutionCode}>{row.solutionCode}</span>
                      <span className={styles.moduleCode}>{getModuleName(row.moduleCode)}</span>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.roleBlock}>
                      <RoleBadge roleCode={row.roleCode} roleLabel={row.roleCode.replace('_', ' ')} />
                      <span className={styles.roleLabel}>{row.roleLabel}</span>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.dateBlock}>
                      <span className={styles.dateIcon}><CalendarRegular fontSize={14} /></span>
                      {formatDate(row.assignedDate)}
                    </div>
                  </td>
                  <td className={styles.td}>
                    {row.disableDate ? (
                      <div className={styles.dateBlock}>
                        <span className={styles.dateIcon}><CalendarRegular fontSize={14} /></span>
                        {formatDate(row.disableDate)}
                      </div>
                    ) : (
                      <span className={styles.dash}>—</span>
                    )}
                  </td>
                  <td className={styles.td}>{row.assignedBy}</td>
                  <td className={styles.td}>
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <EditRoleAssignmentModal
        open={!!editing}
        assignment={editing}
        onClose={() => setEditing(null)}
        onUpdated={(updated) => {
          onUpdated(updated);
          setEditing(null);
        }}
      />
    </>
  );
}
