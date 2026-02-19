// apps/web/src/app/TopBar.tsx
// PLATFORM FILE.

import { makeStyles, tokens, Text } from '@fluentui/react-components';
import { DemoUserSwitcher } from '@/dev/DemoUserSwitcher';

const useStyles = makeStyles({
  bar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '48px',
    padding: `0 ${tokens.spacingHorizontalL}`,
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    flexShrink: 0,
  },
  brand: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase400,
    color: tokens.colorBrandForeground1,
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
});

const isDemoMode = (import.meta.env['VITE_AUTH_MODE'] as string | undefined) === 'demo';

export function TopBar() {
  const styles = useStyles();

  return (
    <header className={styles.bar} role="banner">
      <Text className={styles.brand}>CLaaS2SaaS · Security Kernel</Text>
      <div className={styles.right}>
        {isDemoMode && <DemoUserSwitcher />}
      </div>
    </header>
  );
}
