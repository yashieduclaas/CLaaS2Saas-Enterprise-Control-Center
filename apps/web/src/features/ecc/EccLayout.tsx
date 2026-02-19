// apps/web/src/features/ecc/EccLayout.tsx
// Standalone layout for ECC — no NavRail, full width, custom top bar.

import type { PropsWithChildren } from 'react';
import {
  makeStyles,
  tokens,
  Input,
  Badge,
} from '@fluentui/react-components';
import { AppIcon } from '@/components/AppIcon';

const useStyles = makeStyles({
  layout: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalXL}`,
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    flexShrink: 0,
  },
  topBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
  },
  topBarCenter: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    maxWidth: '400px',
    marginLeft: tokens.spacingHorizontalXL,
    marginRight: tokens.spacingHorizontalXL,
  },
  topBarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  envBadge: {
    fontSize: tokens.fontSizeBase100,
    fontWeight: tokens.fontWeightSemibold,
  },
  searchInput: { width: '100%' },
  topBarIcon: { fontSize: tokens.fontSizeBase500 },
  avatarCircle: {
    width: tokens.spacingVerticalXXL,
    height: tokens.spacingVerticalXXL,
    minWidth: tokens.spacingVerticalXXL,
    minHeight: tokens.spacingVerticalXXL,
    borderRadius: '50%',
    backgroundColor: tokens.colorNeutralForegroundOnBrand,
    opacity: 0.3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.colorBrandBackground,
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: tokens.spacingVerticalXL,
    overflowY: 'auto',
  },
  content: {
    width: '100%',
    maxWidth: '960px',
  },
});

const envLabel = (import.meta.env['VITE_AUTH_MODE'] as string | undefined) === 'demo' ? 'Demo' : 'Production';

export function EccLayout({ children }: PropsWithChildren) {
  const styles = useStyles();

  return (
    <div className={styles.layout}>
      <header className={styles.topBar} role="banner">
        <div className={styles.topBarLeft}>
          CLaaS2SaaS | Enterprise Control Centre
        </div>
        <div className={styles.topBarCenter}>
          <Input
            className={styles.searchInput}
            placeholder="Search..."
            contentBefore={<AppIcon name="search" size={20} />}
            appearance="filled-darker"
            aria-label="Search"
          />
        </div>
        <div className={styles.topBarRight}>
          <Badge className={styles.envBadge} appearance="filled" color="informative">
            {envLabel}
          </Badge>
          <AppIcon name="personCircle" size={20} className={styles.topBarIcon} />
          <div className={styles.avatarCircle} aria-hidden>
            <AppIcon name="personCircle" size={20} />
          </div>
        </div>
      </header>
      <main className={styles.main} id="main-content" tabIndex={-1}>
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}
