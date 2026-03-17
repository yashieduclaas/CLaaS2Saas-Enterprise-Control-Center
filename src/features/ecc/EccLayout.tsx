// apps/web/src/features/ecc/EccLayout.tsx
// Standalone layout for ECC — no NavRail, full width.
// Uses the same TopBar as AppLayout for consistent header styling.

import type { PropsWithChildren } from 'react';
import {
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { TopBar } from '@/app/TopBar';

const useStyles = makeStyles({
  layout: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: 'var(--color-bg-page)',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: tokens.spacingVerticalXL,
    overflowY: 'auto',
    backgroundColor: 'var(--color-bg-page)',
  },
  content: {
    width: '100%',
    maxWidth: '960px',
  },
});

export function EccLayout({ children }: PropsWithChildren) {
  const styles = useStyles();

  return (
    <div className={styles.layout}>
      <TopBar />
      <main className={styles.main} id="main-content" tabIndex={-1}>
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}
