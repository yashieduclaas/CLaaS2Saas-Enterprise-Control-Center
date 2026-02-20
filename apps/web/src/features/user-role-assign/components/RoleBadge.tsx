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
        backgroundColor: '#fce4ec',
        color: '#c2185b',
        border: '1px solid #f48fb1',
    },
    admin: {
        backgroundColor: '#fdecea',
        color: '#b71c1c',
        border: '1px solid #ef9a9a',
    },
    contributor: {
        backgroundColor: '#e8f5e9',
        color: '#2e7d32',
        border: '1px solid #a5d6a7',
    },
    viewer: {
        backgroundColor: '#fffde7',
        color: '#f57f17',
        border: '1px solid #fff176',
    },
    default: {
        backgroundColor: '#f5f5f5',
        color: '#616161',
        border: '1px solid #e0e0e0',
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
