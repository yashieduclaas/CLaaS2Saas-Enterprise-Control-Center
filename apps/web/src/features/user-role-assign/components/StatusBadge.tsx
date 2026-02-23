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
        backgroundColor: 'var(--color-success-bg)',
        color: 'var(--color-success-text)',
        border: '1px solid var(--color-success-border)',
    },
    inactive: {
        backgroundColor: 'var(--color-bg-muted)',
        color: 'var(--color-gray-600)',
        border: '1px solid var(--color-badge-neutral-border)',
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
