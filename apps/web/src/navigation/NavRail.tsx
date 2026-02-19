// apps/web/src/navigation/NavRail.tsx
// PLATFORM FILE - ROUTE_MAP driven. No hardcoded NAV_ITEMS.

import { useState } from 'react';
import { makeStyles, tokens, Tooltip, mergeClasses } from '@fluentui/react-components';
import { AppIcon, type IconName } from '@/components/AppIcon';
import { NavLink, useLocation } from 'react-router-dom';
import { usePermission } from '@/rbac/usePermission';
import { ROUTE_MAP, type RouteKey } from '@/rbac/RoutePermissionMap';
import type { RouteMapEntry } from '@claas2saas/contracts/routes';
import type { PermissionCode } from '@claas2saas/contracts/rbac';

const PAGE_ICON_NAMES: Partial<Record<RouteKey, IconName>> = {
  'kernel-dashboard': 'shieldCheck',
  'scc-dashboard': 'chart',
  'audit-logs': 'clipboardTaskList',
  'module-mgmt': 'apps',
  'role-mgmt': 'personStar',
  'user-profile': 'people',
  'user-role-assign': 'personArrowRight',
  'admin-access-requests': 'key',
};

type GroupId = 'scc' | 'acc' | 'helpdesk';

interface NavGroupDef {
  id: GroupId;
  label: string;
  iconName: IconName;
  navSections: string[];
}

const NAV_GROUPS: NavGroupDef[] = [
  { id: 'scc', label: 'SCC', iconName: 'shieldCheck', navSections: ['monitoring', 'security'] },
  { id: 'acc', label: 'ACC', iconName: 'settings', navSections: ['governance'] },
  { id: 'helpdesk', label: 'Helpdesk', iconName: 'headset', navSections: [] },
];

const useStyles = makeStyles({
  rail: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
    paddingTop: tokens.spacingVerticalS,
    paddingBottom: tokens.spacingVerticalL,
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
  },
  groupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `0 ${tokens.spacingHorizontalM}`,
    minHeight: '40px',
    width: '100%',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: tokens.colorNeutralForeground1,
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    textAlign: 'left',
    borderRadius: tokens.borderRadiusMedium,
    margin: `2px ${tokens.spacingHorizontalXS}`,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3Hover,
    },
  },
  groupHeaderIcon: {
    fontSize: '20px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupHeaderLabel: {
    flex: 1,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  groupHeaderLabelHidden: {
    display: 'none',
  },
  chevron: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    transform: 'rotate(0deg)',
    transition: 'transform 0.15s ease',
  },
  chevronCollapsed: {
    transform: 'rotate(-90deg)',
  },
  groupItems: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: tokens.spacingVerticalXS,
    gap: tokens.spacingVerticalXS,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    paddingLeft: 'calc(2 * 8px + 20px + 8px)',
    color: tokens.colorNeutralForeground2,
    textDecoration: 'none',
    borderRadius: tokens.borderRadiusMedium,
    margin: `0 ${tokens.spacingHorizontalXS}`,
    cursor: 'pointer',
    minHeight: '32px',
    fontSize: tokens.fontSizeBase200,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3Hover,
      color: tokens.colorNeutralForeground1,
    },
  },
  navItemActive: {
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorBrandForeground1,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3Hover,
      color: tokens.colorBrandForeground1,
    },
  },
  navIcon: {
    width: '16px',
    height: '16px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& svg': {
      width: '16px',
      height: '16px',
    },
  },
  navLabel: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  navLabelHidden: {
    display: 'none',
  },
});

interface NavItemConditionalProps {
  entry: RouteMapEntry;
  collapsed: boolean;
}

function NavItemConditional({ entry, collapsed }: NavItemConditionalProps) {
  const styles = useStyles();
  const location = useLocation();
  const hasPermission = usePermission(entry.requiredPermission as PermissionCode | null);

  if (entry.requiredPermission && !hasPermission) return null;

  const isActive =
    location.pathname === entry.path || location.pathname.startsWith(entry.path + '/');

  const iconName = PAGE_ICON_NAMES[entry.pageKey as RouteKey];

  const navItemEl = (
    <NavLink
      to={entry.path}
      className={mergeClasses(styles.navItem, isActive && styles.navItemActive)}
      aria-current={isActive ? 'page' : undefined}
      aria-label={collapsed ? entry.label : undefined}
    >
      <span className={styles.navIcon}>
        {iconName && <AppIcon name={iconName} size={16} filled={isActive} />}
      </span>
      <span className={mergeClasses(styles.navLabel, collapsed && styles.navLabelHidden)}>
        {entry.label}
      </span>
    </NavLink>
  );

  if (collapsed) {
    return (
      <Tooltip content={entry.label} relationship="label" showDelay={300} positioning="after">
        {navItemEl}
      </Tooltip>
    );
  }

  return navItemEl;
}

interface NavGroupProps {
  group: NavGroupDef;
  entries: RouteMapEntry[];
  collapsed: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

function NavGroup({ group, entries, collapsed, isExpanded, onToggle }: NavGroupProps) {
  const styles = useStyles();
  const { iconName, label } = group;

  const headerButton = (
    <button
      type="button"
      className={styles.groupHeader}
      onClick={onToggle}
      aria-expanded={isExpanded}
      aria-label={collapsed ? label : undefined}
    >
      <span className={styles.groupHeaderIcon}>
        <AppIcon name={iconName} size={20} />
      </span>
      <span
        className={mergeClasses(
          styles.groupHeaderLabel,
          collapsed && styles.groupHeaderLabelHidden
        )}
      >
        {label}
      </span>
      <span className={mergeClasses(styles.chevron, !isExpanded && styles.chevronCollapsed)}>
        <AppIcon name="chevronDown" size={16} />
      </span>
    </button>
  );

  return (
    <div className={styles.group}>
      {collapsed ? (
        <Tooltip content={label} relationship="label" showDelay={300} positioning="after">
          {headerButton}
        </Tooltip>
      ) : (
        headerButton
      )}
      {isExpanded && (
        <div className={styles.groupItems}>
          {entries.map((entry) => (
            <NavItemConditional key={entry.pageKey} entry={entry} collapsed={collapsed} />
          ))}
        </div>
      )}
    </div>
  );
}

interface NavRailProps {
  collapsed: boolean;
  width: string;
}

export function NavRail({ collapsed, width }: NavRailProps) {
  const styles = useStyles();
  const navEntries = ROUTE_MAP.filter((e) => e.showInNav);

  const [sccExpanded, setSccExpanded] = useState(true);
  const [accExpanded, setAccExpanded] = useState(true);
  const [helpdeskExpanded, setHelpdeskExpanded] = useState(true);

  const expansion: Record<GroupId, boolean> = {
    scc: sccExpanded,
    acc: accExpanded,
    helpdesk: helpdeskExpanded,
  };

  const handleToggle = (id: GroupId) => {
    if (id === 'scc') setSccExpanded((v) => !v);
    else if (id === 'acc') setAccExpanded((v) => !v);
    else setHelpdeskExpanded((v) => !v);
  };

  return (
    <nav className={styles.rail} style={{ width }} aria-label="Primary navigation">
      {NAV_GROUPS.map((group) => {
        const entries = navEntries.filter((e) =>
          e.navSection && group.navSections.includes(e.navSection)
        );
        return (
          <NavGroup
            key={group.id}
            group={group}
            entries={entries}
            collapsed={collapsed}
            isExpanded={expansion[group.id]}
            onToggle={() => handleToggle(group.id)}
          />
        );
      })}
    </nav>
  );
}
