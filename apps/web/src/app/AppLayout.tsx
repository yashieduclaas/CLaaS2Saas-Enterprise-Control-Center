import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { makeStyles, tokens, Button } from '@fluentui/react-components';
import { AppIcon } from '@/components/AppIcon';
import { NavRail } from '@/navigation/NavRail';
import { TopBar } from './TopBar';

const RAIL_WIDTH_EXPANDED = '240px';
const RAIL_WIDTH_COLLAPSED = '56px';

const useStyles = makeStyles({
  shell: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  body: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    overflowY: 'auto',
    padding: tokens.spacingVerticalXL,
    paddingLeft: tokens.spacingHorizontalXL,
    paddingRight: tokens.spacingHorizontalXL,
  },
  toggleButton: {
    position: 'absolute',
    top: tokens.spacingVerticalS,
    left: tokens.spacingHorizontalS,
    zIndex: 10,
  },
});

export function AppLayout() {
  const styles = useStyles();
  const [collapsed, setCollapsed] = useState(false);
  const railWidth = collapsed ? RAIL_WIDTH_COLLAPSED : RAIL_WIDTH_EXPANDED;

  return (
    <div className={styles.shell}>
      <TopBar />
      <div className={styles.body}>
        <div style={{ position: 'relative', width: railWidth, transition: 'width 150ms ease', flexShrink: 0 }}>
          <Button
            className={styles.toggleButton}
            appearance="subtle"
            size="small"
            icon={collapsed ? <AppIcon name="navigation" size={20} /> : <AppIcon name="dismiss" size={20} />}
            aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((c) => !c)}
          />
          <NavRail collapsed={collapsed} width={railWidth} />
        </div>
        <main className={styles.main} id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
