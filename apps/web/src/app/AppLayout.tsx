import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { makeStyles, tokens, mergeClasses } from '@fluentui/react-components';
import { NavRail } from '@/navigation/NavRail';
import { TopBar } from './TopBar';

const RAIL_WIDTH_EXPANDED = '240px';
const RAIL_WIDTH_COLLAPSED = '56px';

const useStyles = makeStyles({
  shell: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    minHeight: '100vh',
    overflow: 'hidden',
    backgroundColor: 'var(--color-bg-page)',
  },
  body: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  railContainer: {
    position: 'relative',
    flexShrink: 0,
    transition: 'width 150ms ease',
    width: RAIL_WIDTH_EXPANDED,
  },
  railContainerCollapsed: {
    width: RAIL_WIDTH_COLLAPSED,
  },
  main: {
    flex: 1,
    overflowY: 'auto',
    padding: tokens.spacingVerticalXL,
    paddingLeft: tokens.spacingHorizontalXL,
    paddingRight: tokens.spacingHorizontalXL,
    backgroundColor: 'var(--color-bg-page)',
  },
});

export function AppLayout() {
  const styles = useStyles();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={styles.shell}>
      <TopBar />
      <div className={styles.body}>
        <div
          className={mergeClasses(
            styles.railContainer,
            collapsed && styles.railContainerCollapsed
          )}
        >
          <NavRail
            collapsed={collapsed}
            onCollapseClick={() => setCollapsed((c) => !c)}
          />
        </div>
        <main className={styles.main} id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
