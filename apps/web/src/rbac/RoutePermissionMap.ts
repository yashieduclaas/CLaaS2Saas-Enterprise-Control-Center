// apps/web/src/rbac/RoutePermissionMap.ts
// PLATFORM FILE — FROZEN STRUCTURE, ADDITIVE CONTENT ONLY.
// The SINGLE SOURCE OF TRUTH for all routes, permissions, nav labels, and breadcrumbs.

import type { RouteMapEntry } from '@claas2saas/contracts/routes';
import type { PermissionCode } from '@claas2saas/contracts/rbac';

export const ROUTE_MAP: ReadonlyArray<RouteMapEntry> = [
  // ── Shell / non-nav ──────────────────────────────────────────────────────
  {
    path: '/login',
    pageKey: 'login',
    label: 'Sign In',
    icon: '',
    navSection: 'none',
    requiredPermission: null,
    showInNav: false,
    breadcrumb: [],
  },
  {
    path: '/forbidden',
    pageKey: 'forbidden',
    label: 'Access Denied',
    icon: '',
    navSection: 'none',
    requiredPermission: null,
    showInNav: false,
    breadcrumb: [],
  },
  {
    path: '/request-access',
    pageKey: 'access-request',
    label: 'Request Access',
    icon: '',
    navSection: 'none',
    requiredPermission: null,
    showInNav: false,
    breadcrumb: [],
  },

  // ── ECC ──────────────────────────────────────────────────────────────────
  {
    path: '/ecc',
    pageKey: 'ecc',
    label: 'Enterprise Control Centre',
    icon: 'GridRegular',
    navSection: 'ecc',
    requiredPermission: null,
    showInNav: false,
    breadcrumb: ['Home'],
  },

  // ── Monitoring ────────────────────────────────────────────────────────────
  {
    path: '/kernel',
    pageKey: 'kernel-dashboard',
    label: 'Security Overview',
    icon: 'ShieldCheckmarkRegular',
    navSection: 'monitoring',
    requiredPermission: 'MODULE:READ' as PermissionCode,
    showInNav: true,
    breadcrumb: ['Home', 'Security Overview'],
  },
  {
    path: '/scc',
    pageKey: 'scc-dashboard',
    label: 'Security Control Centre',
    icon: 'DataTrendingRegular',
    navSection: 'monitoring',
    requiredPermission: 'AUDIT:VIEW_SESSIONS' as PermissionCode,
    showInNav: true,
    breadcrumb: ['Home', 'Security'],
  },
  {
    path: '/audit',
    pageKey: 'audit-logs',
    label: 'Audit Logs',
    icon: 'ClipboardTaskList16Regular',
    navSection: 'monitoring',
    requiredPermission: 'AUDIT:VIEW_SESSIONS' as PermissionCode,
    showInNav: true,
    breadcrumb: ['Home', 'Security', 'Audit Logs'],
  },

  // ── Administration ────────────────────────────────────────────────────────
  {
    path: '/modules',
    pageKey: 'module-mgmt',
    label: 'Module Management',
    icon: 'AppsRegular',
    navSection: 'security',
    requiredPermission: 'MODULE:READ' as PermissionCode,
    showInNav: true,
    breadcrumb: ['Home', 'Administration', 'Modules'],
  },
  {
    path: '/roles',
    pageKey: 'role-mgmt',
    label: 'Role Management',
    icon: 'PersonStarRegular',
    navSection: 'security',
    requiredPermission: 'ROLE:READ' as PermissionCode,
    showInNav: true,
    breadcrumb: ['Home', 'Administration', 'Roles'],
  },
  {
    path: '/users',
    pageKey: 'user-profile',
    label: 'User Profiles',
    icon: 'PeopleRegular',
    navSection: 'security',
    requiredPermission: 'USER:READ' as PermissionCode,
    showInNav: true,
    breadcrumb: ['Home', 'Administration', 'Users'],
  },
  {
    path: '/assignments',
    pageKey: 'user-role-assign',
    label: 'Role Assignments',
    icon: 'PersonArrowRightRegular',
    navSection: 'security',
    requiredPermission: 'USER:ASSIGN_ROLE' as PermissionCode,
    showInNav: true,
    breadcrumb: ['Home', 'Administration', 'Assignments'],
  },

  // ── Governance ────────────────────────────────────────────────────────────
  {
    path: '/access-requests',
    pageKey: 'admin-access-requests',
    label: 'Access Requests',
    icon: 'KeyRegular',
    navSection: 'governance',
    requiredPermission: 'ACCESS_REQUEST:REVIEW' as PermissionCode,
    showInNav: true,
    breadcrumb: ['Home', 'Governance', 'Access Requests'],
  },
] as const;

export type RouteKey = (typeof ROUTE_MAP)[number]['pageKey'];

export function getRoutePath(pageKey: RouteKey): string {
  const entry = ROUTE_MAP.find(r => r.pageKey === pageKey);
  if (!entry) throw new Error(`RoutePermissionMap: unknown pageKey "${pageKey}"`);
  return entry.path;
}

export function getRouteEntry(pageKey: RouteKey): RouteMapEntry {
  const entry = ROUTE_MAP.find(r => r.pageKey === pageKey);
  if (!entry) throw new Error(`RoutePermissionMap: unknown pageKey "${pageKey}"`);
  return entry;
}

export const NAV_ENTRIES = ROUTE_MAP.filter(r => r.showInNav);
