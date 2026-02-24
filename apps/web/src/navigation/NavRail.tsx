// apps/web/src/navigation/NavRail.tsx
// PLATFORM FILE — Sidebar matching enterprise shell spec.

import { useState } from 'react';
import { makeStyles, tokens, mergeClasses, Tooltip } from '@fluentui/react-components';
import { NavLink, useLocation } from 'react-router-dom';
import { usePermission } from '@/rbac/usePermission';
import { getRouteEntry } from '@/rbac/RoutePermissionMap';
import type { RouteKey } from '@/rbac/RoutePermissionMap';
import type { PermissionCode } from '@claas2saas/contracts/rbac';
import {
  ShieldCheckmarkRegular,
  SettingsRegular,
  HeadsetRegular,
  GridRegular,
  AppsRegular,
  PersonRegular,
  PersonArrowRightRegular,
  ClipboardTaskList16Regular,
  ScalesRegular,
  WrenchRegular,
  DataTrendingRegular,
  RocketRegular,
  KeyRegular,
  TicketDiagonalRegular,
  BookRegular,
  BotRegular,
  ChevronDownRegular,
  ChevronLeftRegular,
} from '@fluentui/react-icons';

interface NavItemDef {
  label: string;
  path: string;
  pageKey?: RouteKey;
  icon: React.ReactNode;
}

interface NavGroupDef {
  id: string;
  label: string;
  groupIcon: React.ReactNode;
  items: NavItemDef[];
  /** If set, clicking group header navigates here (e.g. /scc for SCC root landing) */
  headerNavPath?: string;
}

const SCC_ITEMS: NavItemDef[] = [
  { label: 'Dashboard', path: '/kernel', pageKey: 'kernel-dashboard', icon: <GridRegular fontSize={16} /> },
  { label: 'Module Management', path: '/modules', pageKey: 'module-mgmt', icon: <AppsRegular fontSize={16} /> },
  { label: 'User Profile Enrichment', path: '/users', pageKey: 'user-profile', icon: <PersonRegular fontSize={16} /> },
  { label: 'Security Role Management', path: '/roles', pageKey: 'role-mgmt', icon: <ShieldCheckmarkRegular fontSize={16} /> },
  { label: 'User Role Assignment', path: '/assignments', pageKey: 'user-role-assign', icon: <PersonArrowRightRegular fontSize={16} /> },
  { label: 'Audit Logs', path: '/audit', pageKey: 'audit-logs', icon: <ClipboardTaskList16Regular fontSize={16} /> },
];

const ACC_ITEMS: NavItemDef[] = [
  { label: 'Governance & Compliance', path: '/access-requests', pageKey: 'admin-access-requests', icon: <ScalesRegular fontSize={16} /> },
  { label: 'Workflow Automation', path: '/workflow', icon: <WrenchRegular fontSize={16} /> },
  { label: 'Analytics & KPIs', path: '/analytics', icon: <DataTrendingRegular fontSize={16} /> },
  { label: 'Deployment & Release', path: '/deployment', icon: <RocketRegular fontSize={16} /> },
];

const HELPDESK_ITEMS: NavItemDef[] = [
  { label: 'Access Requests', path: '/access-requests', pageKey: 'admin-access-requests', icon: <KeyRegular fontSize={16} /> },
  { label: 'Issue Ticketing', path: '/tickets', icon: <TicketDiagonalRegular fontSize={16} /> },
  { label: 'Knowledge Base', path: '/knowledge', icon: <BookRegular fontSize={16} /> },
  { label: 'AI Assistant', path: '/assistant', icon: <BotRegular fontSize={16} /> },
];

const NAV_GROUPS: NavGroupDef[] = [
  { id: 'scc', label: 'SCC', groupIcon: <ShieldCheckmarkRegular fontSize={20} />, items: SCC_ITEMS, headerNavPath: '/scc' },
  { id: 'acc', label: 'ACC', groupIcon: <SettingsRegular fontSize={20} />, items: ACC_ITEMS },
  { id: 'helpdesk', label: 'Helpdesk', groupIcon: <HeadsetRegular fontSize={20} />, items: HELPDESK_ITEMS },
];

const useStyles = makeStyles({
  rail: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
    paddingTop: tokens.spacingVerticalM,
    paddingBottom: tokens.spacingVerticalXL,
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
  },
  groupDivider: {
    height: '1px',
    backgroundColor: tokens.colorNeutralStroke2,
    marginTop: tokens.spacingVerticalS,
    marginBottom: tokens.spacingVerticalS,
    marginLeft: tokens.spacingHorizontalM,
    marginRight: tokens.spacingHorizontalM,
  },
  groupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    minHeight: '40px',
    width: '100%',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: tokens.colorNeutralForeground1,
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    textAlign: 'left',
    borderRadius: tokens.borderRadiusMedium,
    margin: `0 ${tokens.spacingHorizontalXS}`,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3Hover,
    },
  },
  groupHeaderIcon: {
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
    transition: 'transform 0.15s ease',
  },
  chevronExpanded: {
    transform: 'rotate(0deg)',
  },
  chevronCollapsed: {
    transform: 'rotate(-90deg)',
  },
  groupItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    paddingLeft: tokens.spacingHorizontalM,
    paddingRight: tokens.spacingHorizontalM,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    paddingLeft: 'calc(20px + 8px + 8px)',
    color: tokens.colorNeutralForeground2,
    textDecoration: 'none',
    borderRadius: tokens.borderRadiusMedium,
    margin: `0 ${tokens.spacingHorizontalXS}`,
    cursor: 'pointer',
    minHeight: '40px',
    fontSize: tokens.fontSizeBase300,
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
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  navLabelHidden: {
    display: 'none',
  },
  collapseButton: {
    marginTop: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    marginLeft: tokens.spacingHorizontalS,
    marginRight: 'auto',
    marginBottom: tokens.spacingVerticalM,
    border: 'none',
    background: 'none',
    borderRadius: tokens.borderRadiusMedium,
    cursor: 'pointer',
    color: tokens.colorNeutralForeground2,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3Hover,
      color: tokens.colorNeutralForeground1,
    },
  },
});

function NavItem({ item, collapsed }: { item: NavItemDef; collapsed: boolean }) {
  const styles = useStyles();
  const location = useLocation();

  const requiredPermission: PermissionCode | null = item.pageKey
    ? (getRouteEntry(item.pageKey).requiredPermission as PermissionCode | null)
    : null;
  const hasPermission = usePermission(requiredPermission);

  if (requiredPermission !== null && !hasPermission) return null;

  const isActive =
    location.pathname === item.path || location.pathname.startsWith(item.path + '/');

  const linkEl = (
    <NavLink
      to={item.path}
      className={mergeClasses(styles.navItem, isActive && styles.navItemActive)}
      aria-current={isActive ? 'page' : undefined}
      aria-label={collapsed ? item.label : undefined}
    >
      <span className={styles.navIcon}>{item.icon}</span>
      <span className={mergeClasses(styles.navLabel, collapsed && styles.navLabelHidden)}>
        {item.label}
      </span>
    </NavLink>
  );

  if (collapsed) {
    return (
      <Tooltip content={item.label} relationship="label" showDelay={300} positioning="after">
        {linkEl}
      </Tooltip>
    );
  }
  return linkEl;
}

interface NavGroupProps {
  group: NavGroupDef;
  collapsed: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

function NavGroup({ group, collapsed, isExpanded, onToggle }: NavGroupProps) {
  const styles = useStyles();
  const hasHeaderNav = Boolean(group.headerNavPath);

  const headerContent = (
    <>
      <span className={styles.groupHeaderIcon}>{group.groupIcon}</span>
      <span
        className={mergeClasses(
          styles.groupHeaderLabel,
          collapsed && styles.groupHeaderLabelHidden
        )}
      >
        {group.label}
      </span>
      <span
        className={mergeClasses(
          styles.chevron,
          isExpanded ? styles.chevronExpanded : styles.chevronCollapsed
        )}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(); }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
        role="button"
        tabIndex={0}
        aria-label={isExpanded ? 'Collapse' : 'Expand'}
      >
        <ChevronDownRegular fontSize={16} />
      </span>
    </>
  );

  const headerButton = hasHeaderNav ? (
    <NavLink
      to={group.headerNavPath!}
      className={styles.groupHeader}
      style={{ textDecoration: 'none' }}
      aria-label={collapsed ? group.label : undefined}
    >
      {headerContent}
    </NavLink>
  ) : (
    <button
      type="button"
      className={styles.groupHeader}
      onClick={onToggle}
      aria-expanded={isExpanded}
      aria-label={collapsed ? group.label : undefined}
    >
      {headerContent}
    </button>
  );

  return (
    <div className={styles.group}>
      {collapsed ? (
        <Tooltip content={group.label} relationship="label" showDelay={300} positioning="after">
          {headerButton}
        </Tooltip>
      ) : (
        headerButton
      )}
      {isExpanded && (
        <div className={styles.groupItems}>
          {group.items.map((item) => (
            <NavItem key={item.path + item.label} item={item} collapsed={collapsed} />
          ))}
        </div>
      )}
    </div>
  );
}

interface NavRailProps {
  collapsed: boolean;
  width?: string;
  onCollapseClick?: () => void;
}

export function NavRail({ collapsed, onCollapseClick }: NavRailProps) {
  const styles = useStyles();
  const [sccExpanded, setSccExpanded] = useState(true);
  const [accExpanded, setAccExpanded] = useState(true);
  const [helpdeskExpanded, setHelpdeskExpanded] = useState(true);

  const expansion: Record<string, boolean> = {
    scc: sccExpanded,
    acc: accExpanded,
    helpdesk: helpdeskExpanded,
  };

  const handleToggle = (id: string) => {
    if (id === 'scc') setSccExpanded((v) => !v);
    else if (id === 'acc') setAccExpanded((v) => !v);
    else setHelpdeskExpanded((v) => !v);
  };

  return (
    <nav
      className={styles.rail}
      aria-label="Primary navigation"
    >
      {NAV_GROUPS.map((group, index) => (
        <div key={group.id}>
          {index > 0 && <div className={styles.groupDivider} aria-hidden />}
          <NavGroup
            group={group}
            collapsed={collapsed}
            isExpanded={expansion[group.id] ?? true}
            onToggle={() => handleToggle(group.id)}
          />
        </div>
      ))}
      {onCollapseClick && (
        <button
          type="button"
          className={styles.collapseButton}
          onClick={onCollapseClick}
          aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          <ChevronLeftRegular fontSize={20} />
        </button>
      )}
    </nav>
  );
}
