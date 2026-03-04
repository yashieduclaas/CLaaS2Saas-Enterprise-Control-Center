// apps/web/src/features/user-role-assign/components/RoleBadge.tsx
// Vanilla spec — Role badge color combinations.

import { makeStyles } from '@fluentui/react-components';

const useStyles = makeStyles({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.3px',
    textTransform: 'uppercase' as const,
    whiteSpace: 'nowrap' as const,
  },
  globalAdmin: {
    background: 'rgba(220,53,69,0.1)',
    color: '#dc3545',
  },
  admin: {
    background: 'rgba(220,53,69,0.1)',
    color: '#dc3545',
  },
  contributor: {
    background: 'rgba(40,167,69,0.1)',
    color: '#28a745',
  },
  viewer: {
    background: 'rgba(255,193,7,0.1)',
    color: '#d39e00',
  },
  collaborator: {
    background: 'rgba(0,123,255,0.1)',
    color: '#007bff',
  },
  default: {
    background: 'rgba(108,117,125,0.1)',
    color: '#6c757d',
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
      case 'COLLABORATOR': return styles.collaborator;
      default: return styles.default;
    }
  })();

  return (
    <span className={`${styles.base} ${variantClass}`} title={roleCode}>
      {roleLabel}
    </span>
  );
}
