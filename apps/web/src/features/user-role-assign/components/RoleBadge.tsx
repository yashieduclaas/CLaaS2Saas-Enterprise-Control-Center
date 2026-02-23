// apps/web/src/features/user-role-assign/components/RoleBadge.tsx
// FEATURE FILE — Renders a colour-coded badge for a role code.
// Add new roleCode entries here as new roles are defined in the system.

import { makeStyles } from '@fluentui/react-components';

const useStyles = makeStyles({
    base: {
        display: 'inline-flex',
        alignItems: 'center',
        paddingLeft: '8px',
        paddingRight: '8px',
        paddingTop: '3px',
        paddingBottom: '3px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: '600',
        letterSpacing: '0.3px',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
    },
    globalAdmin: {
        backgroundColor: 'var(--color-badge-magenta-bg)',
        color: 'var(--color-badge-magenta-text)',
        border: '1px solid var(--color-badge-admin-border)',
    },
    admin: {
        backgroundColor: 'var(--color-error-bg)',
        color: 'var(--color-danger-text)',
        border: '1px solid var(--color-danger-border)',
    },
    contributor: {
        backgroundColor: 'var(--color-success-bg)',
        color: 'var(--color-success-text)',
        border: '1px solid var(--color-success-border)',
    },
    viewer: {
        backgroundColor: 'var(--color-warning-bg)',
        color: 'var(--color-warning-text)',
        border: '1px solid var(--color-warning-border)',
    },
    default: {
        backgroundColor: 'var(--color-bg-muted)',
        color: 'var(--color-gray-700)',
        border: '1px solid var(--color-badge-neutral-border)',
    },
});

export interface RoleBadgeProps {
    roleCode: string;
    roleLabel: string;
}

export function RoleBadge({ roleCode, roleLabel }: RoleBadgeProps) {
    const styles = useStyles();

    const variantClass = (() => {
        switch (roleCode) {
            case 'GLOBAL_ADMIN': return styles.globalAdmin;
            case 'ADMIN': return styles.admin;
            case 'CONTRIBUTOR': return styles.contributor;
            case 'VIEWER': return styles.viewer;
            default: return styles.default;
        }
    })();

    return (
        <span className={`${styles.base} ${variantClass}`} title={roleCode}>
            {roleLabel}
        </span>
    );
}
