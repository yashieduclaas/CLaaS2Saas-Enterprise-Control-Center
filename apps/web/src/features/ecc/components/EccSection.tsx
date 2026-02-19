// apps/web/src/features/ecc/components/EccSection.tsx

import { makeStyles, tokens, Text } from '@fluentui/react-components';
import { Divider } from '@fluentui/react-components';
import type { ReactNode } from 'react';

const useStyles = makeStyles({
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  icon: {
    fontSize: '20px',
    color: tokens.colorNeutralForeground2,
  },
  title: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: tokens.spacingHorizontalL,
  },
});

export interface EccSectionProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}

export function EccSection({ icon, title, children }: EccSectionProps) {
  const styles = useStyles();

  return (
    <section className={styles.section} aria-labelledby={`ecc-section-${title.replace(/\s+/g, '-').toLowerCase()}`}>
      <div className={styles.header}>
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
        <Text as="h2" id={`ecc-section-${title.replace(/\s+/g, '-').toLowerCase()}`} className={styles.title}>
          {title}
        </Text>
      </div>
      <Divider />
      <div className={styles.grid} role="list">
        {children}
      </div>
    </section>
  );
}
