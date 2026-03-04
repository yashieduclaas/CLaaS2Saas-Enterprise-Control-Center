// apps/web/src/features/user-role-assign/components/StatusBadge.tsx
// Vanilla spec — Active/Inactive badge styles.

import { makeStyles } from '@fluentui/react-components';
import type { UserRoleAssignment } from '../types/security';

const useStyles = makeStyles({
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
    display: 'inline-flex',
    alignItems: 'center',
  },
  active: {
    background: 'rgba(40,167,69,0.1)',
    color: '#28a745',
  },
  inactive: {
    background: 'rgba(220,53,69,0.1)',
    color: '#dc3545',
  },
});

export interface StatusBadgeProps {
  status: UserRoleAssignment['status'];
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = useStyles();
  const isActive = status === 'ACTIVE';

  return (
    <span className={`${styles.statusBadge} ${isActive ? styles.active : styles.inactive}`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}
