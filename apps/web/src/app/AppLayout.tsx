import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { makeStyles, tokens, mergeClasses } from '@fluentui/react-components';
import { NavRail } from '@/navigation/NavRail';
import { TopBar } from './TopBar';

const RAIL_WIDTH_EXPANDED = '270px';
const RAIL_WIDTH_COLLAPSED = '64px';
const RAIL_TRANSITION = 'width 0.28s cubic-bezier(0.4, 0, 0.2, 1)';

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
    height: '100%',
    overflow: 'hidden',
  },
  railContainer: {
    position: 'relative',
    flexShrink: 0,
    transition: RAIL_TRANSITION,
    width: RAIL_WIDTH_EXPANDED,
  },
  railContainerCollapsed: {
    width: RAIL_WIDTH_COLLAPSED,
  },
  main: {
    flex: 1,
    overflow: 'hidden',
    height: '100vh',
    padding:'10px 18px',
   // padding: tokens.spacingVerticalXL,
    //paddingLeft: tokens.spacingHorizontalXL,
    //paddingRight: tokens.spacingHorizontalXL,
    backgroundColor: 'var(--color-bg-page)',
  },
});

export function AppLayout() {
  const styles = useStyles();
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(collapsed));
  }, [collapsed]);

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
