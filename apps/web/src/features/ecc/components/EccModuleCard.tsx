// apps/web/src/features/ecc/components/EccModuleCard.tsx

import { makeStyles, mergeClasses, tokens, Text, Badge } from '@fluentui/react-components';
import type { ReactNode } from 'react';

const useStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: tokens.spacingVerticalS,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalM}`,
    minHeight: '140px',
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusLarge,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    boxShadow: `0 2px 8px ${tokens.colorNeutralShadowAmbient}`,
    cursor: 'pointer',
    transition: 'transform 150ms ease, box-shadow 150ms ease',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 6px 16px ${tokens.colorNeutralShadowAmbient}`,
    },
  },
  cardLocked: {
    ':hover': {
      boxShadow: `0 6px 16px ${tokens.colorNeutralShadowAmbient}`,
    },
  },
  icon: {
    fontSize: '48px',
    color: tokens.colorBrandForeground1,
  },
  title: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
});

export interface EccModuleCardProps {
  icon: ReactNode;
  name: string;
  isLocked: boolean;
  onClick: () => void;
}

export function EccModuleCard({ icon, name, isLocked, onClick }: EccModuleCardProps) {
  const styles = useStyles();

  return (
    <button
      type="button"
      className={mergeClasses(styles.card, isLocked ? styles.cardLocked : undefined)}
      onClick={onClick}
      aria-label={name}
    >
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      <Text className={styles.title}>{name}</Text>
      <Badge
        appearance={isLocked ? 'tint' : 'filled'}
        color={isLocked ? 'informative' : 'warning'}
      >
        {isLocked ? 'Locked' : 'Open'}
      </Badge>
    </button>
  );
}
