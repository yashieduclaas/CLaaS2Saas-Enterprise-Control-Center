// apps/web/src/features/ecc/components/EccKernelCard.tsx

import { makeStyles, tokens, Text, Badge } from '@fluentui/react-components';
import type { ReactNode } from 'react';

const useStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingVerticalL,
    paddingLeft: tokens.spacingHorizontalL,
    paddingRight: tokens.spacingHorizontalL,
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusLarge,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    boxShadow: `0 2px 8px ${tokens.colorNeutralShadowAmbient}`,
    cursor: 'pointer',
    transition: 'transform 150ms ease, box-shadow 150ms ease',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: `0 6px 16px ${tokens.colorNeutralShadowAmbient}`,
    },
  },
  icon: {
    fontSize: '48px',
    color: tokens.colorBrandForeground1,
  },
  title: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  badge: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
  },
});

export interface EccKernelCardProps {
  icon: ReactNode;
  name: string;
  onClick: () => void;
}

export function EccKernelCard({ icon, name, onClick }: EccKernelCardProps) {
  const styles = useStyles();

  return (
    <button
      type="button"
      className={styles.card}
      onClick={onClick}
      aria-label={name}
    >
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      <Text className={styles.title}>{name}</Text>
      <Badge className={styles.badge} appearance="filled" color="warning">
        Open
      </Badge>
    </button>
  );
}
