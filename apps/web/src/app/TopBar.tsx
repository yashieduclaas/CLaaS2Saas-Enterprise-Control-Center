// apps/web/src/app/TopBar.tsx
// PLATFORM FILE — Header matching enterprise shell spec.

import { useNavigate } from 'react-router-dom';
import { makeStyles, tokens, Input } from '@fluentui/react-components';
import {
  SearchRegular,
  GlobeRegular,
  AlertRegular,
  SettingsRegular,
  FlashRegular,
} from '@fluentui/react-icons';
import { getRoutePath } from '@/rbac/RoutePermissionMap';
import { DemoUserSwitcher } from '@/dev/DemoUserSwitcher';

const useStyles = makeStyles({
  bar: {
    display: 'flex',
    alignItems: 'center',
    height: '56px',
    paddingLeft: tokens.spacingHorizontalL,
    paddingRight: tokens.spacingHorizontalL,
    backgroundColor: 'var(--color-brand-primary)',
    flexShrink: 0,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    textDecoration: 'none',
    backgroundColor: 'transparent',
    border: 'none',
    padding: 0,
    margin: 0,
  },
  logo: {
    height: '32px',
    width: 'auto',
    display: 'block',
    background: 'transparent',
  },
  divider: {
    width: '1px',
    height: '24px',
    backgroundColor: tokens.colorNeutralStroke1,
    opacity: 0.5,
  },
  moduleLabel: {
    color: tokens.colorNeutralForegroundOnBrand,
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightRegular,
  },
  center: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
  },
  searchInput: {
    width: '400px',
    maxWidth: '420px',
    minWidth: '380px',
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalL,
  },
  envBlock: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
  },
  envLabel: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
    fontWeight: tokens.fontWeightRegular,
    textTransform: 'uppercase' as const,
  },
  envValue: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForegroundOnBrand,
  },
  iconButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    border: 'none',
    background: 'transparent',
    borderRadius: tokens.borderRadiusMedium,
    cursor: 'pointer',
    color: tokens.colorNeutralForegroundOnBrand,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3Hover,
    },
  },
  bellWrapper: {
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    width: '8px',
    height: '8px',
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorPaletteRedBackground3,
  },
  profileCircle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorPaletteYellowBackground1,
    color: tokens.colorNeutralForegroundOnBrand,
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
  },
  envWithGlobe: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  globeIcon: {
    color: tokens.colorNeutralForegroundOnBrand,
  },
});

const isDemoMode = (import.meta.env['VITE_AUTH_MODE'] as string | undefined) === 'demo';

export function TopBar() {
  const styles = useStyles();
  const navigate = useNavigate();

  const handleBrandClick = () => {
    navigate(getRoutePath('ecc'));
  };

  return (
    <header className={styles.bar} role="banner">
      <div className={styles.left}>
        <button type="button" className={styles.brand} onClick={handleBrandClick} aria-label="Go to Enterprise Control Centre">
          <img src="/logo.png" alt="CLaaS2SaaS" className={styles.logo} />
        </button>
        <div className={styles.divider} aria-hidden />
        <span className={styles.moduleLabel}>Kernel Apps</span>
      </div>

      <div className={styles.center}>
        <Input
          className={styles.searchInput}
          placeholder="Search Modules..."
          contentBefore={<SearchRegular fontSize={16} />}
          appearance="filled-lighter"
          aria-label="Search Modules"
        />
      </div>

      <div className={styles.right}>
        <div className={styles.envWithGlobe}>
          <span className={styles.globeIcon}><GlobeRegular fontSize={18} /></span>
          <div className={styles.envBlock}>
            <span className={styles.envLabel}>ENVIRONMENT</span>
            <span className={styles.envValue}>CLaaS2SaaS default</span>
          </div>
        </div>

        <span className={styles.bellWrapper}>

          <button type="button" className={styles.iconButton} aria-label="Notifications">
            <AlertRegular fontSize={20} />
            <span className={styles.bellBadge} aria-hidden />
          </button>
        </span>

        <button type="button" className={styles.iconButton} aria-label="Settings">
          <SettingsRegular fontSize={20} />
        </button>

        <button type="button" className={styles.iconButton} aria-label="Copilot">
          <FlashRegular fontSize={20} />
        </button>

        <div className={styles.profileCircle} aria-hidden>AJ</div>

        {isDemoMode && <DemoUserSwitcher />}
      </div>
    </header>
  );
}
