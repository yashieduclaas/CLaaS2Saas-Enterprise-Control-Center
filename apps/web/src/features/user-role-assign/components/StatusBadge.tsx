// apps/web/src/features/user-role-assign/components/StatusBadge.tsx
// FEATURE FILE — Renders a pill badge for assignment status.

import { makeStyles } from '@fluentui/react-components';
import type { UserRoleAssignment } from '../types/security';

const useStyles = makeStyles({
    base: {
        display: 'inline-flex',
        alignItems: 'center',
        paddingLeft: '10px',
        paddingRight: '10px',
        paddingTop: '3px',
        paddingBottom: '3px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: '500',
        whiteSpace: 'nowrap',
    },
    active: {
        backgroundColor: '#e8f5e9',
        color: '#2e7d32',
        border: '1px solid #a5d6a7',
    },
    inactive: {
        backgroundColor: '#f5f5f5',
        color: '#757575',
        border: '1px solid #e0e0e0',
    },
});

export interface StatusBadgeProps {
    status: UserRoleAssignment['status'];
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const styles = useStyles();
    const isActive = status === 'ACTIVE';

    return (
        <span className={`${styles.base} ${isActive ? styles.active : styles.inactive}`}>
            {isActive ? 'Active' : 'Inactive'}
        </span>
    );
}
