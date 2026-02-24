// apps/web/src/app/AppRouter.tsx
// PLATFORM FILE — FROZEN STRUCTURE.
// All routes must have a ROUTE_MAP entry. No string path literals in navigate() calls.

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { EccLayout } from '@/features/ecc/EccLayout';
import { AuthGuard } from '@/auth/AuthGuard';
import { PermissionGuard } from '@/rbac/PermissionGuard';
import { PageSkeleton } from './PageSkeleton';
import { getRoutePath } from '@/rbac/RoutePermissionMap';
import { DemoModeBanner } from '@/dev/DemoModeBanner';

const SignInPage = lazy(() =>
  import('@/features/auth/pages/SignInPage').then(m => ({ default: m.SignInPage }))
);
const RoleManagementPage = lazy(() =>
  import('@/features/role-management/RoleManagementPage').then(m => ({ default: m.RoleManagementPage }))
);
const AuditActionsPage = lazy(() =>
  import('@/features/audit/AuditActionsPage').then(m => ({ default: m.AuditActionsPage }))
);
const PlaceholderPage = lazy(() =>
  import('@/features/PlaceholderPage').then(m => ({ default: m.PlaceholderPage }))
);
const ForbiddenPage = lazy(() =>
  import('@/features/ForbiddenPage').then(m => ({ default: m.ForbiddenPage }))
);
const EccPage = lazy(() =>
  import('@/features/ecc').then(m => ({ default: m.EccPage }))
);
const ModuleMgmtPage = lazy(() =>
  import('@/features/module-mgmt').then(m => ({ default: m.ModuleMgmtPage }))
);
const UserRoleAssignmentPage = lazy(() =>
  import('@/features/user-role-assign').then(m => ({ default: m.UserRoleAssignmentPage }))
);
const SccRootLandingPage = lazy(() =>
  import('@/features/scc').then(m => ({ default: m.SccRootLandingPage }))
);
const SccDashboardPage = lazy(() =>
  import('@/features/scc-dashboard').then(m => ({ default: m.SccDashboardPage }))
);
const UserEnrichmentPage = lazy(() =>
  import('@/features/user-enrichment/pages/UserEnrichmentPage').then(m => ({ default: m.UserEnrichmentPage }))
);

const isDemoMode = (import.meta.env['VITE_AUTH_MODE'] as string | undefined) === 'demo';

export function AppRouter() {
  return (
    <BrowserRouter>
      {isDemoMode && <DemoModeBanner />}
      <Routes>
        {/* Public routes — render outside AuthGuard+AppLayout so no sidebar shows */}
        <Route path={getRoutePath('login')} element={
          <Suspense fallback={<div className="app-loading-fallback">Loading…</div>}>
            <SignInPage />
          </Suspense>
        } />
        <Route path={getRoutePath('forbidden')} element={
          <Suspense fallback={<PageSkeleton />}><ForbiddenPage /></Suspense>
        } />
        <Route path={getRoutePath('access-request')} element={
          <Suspense fallback={<PageSkeleton />}><PlaceholderPage title="Request Access" /></Suspense>
        } />

        {/* ECC — standalone layout, no NavRail */}
        <Route path={getRoutePath('ecc')} element={
          <AuthGuard>
            <PermissionGuard pageKey="ecc">
              <EccLayout>
                <Suspense fallback={<PageSkeleton />}><EccPage /></Suspense>
              </EccLayout>
            </PermissionGuard>
          </AuthGuard>
        } />

        {/* Authenticated shell — AppLayout with NavRail */}
        <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
          <Route index element={<Navigate to={getRoutePath('kernel-dashboard')} replace />} />

          {/* Monitoring */}
          {/* /scc → SCC Root Landing (AI Welcome); /kernel → Real Dashboard */}
          <Route path={getRoutePath('scc-dashboard')} element={
            <PermissionGuard pageKey="scc-dashboard">
              <Suspense fallback={<PageSkeleton />}><SccRootLandingPage /></Suspense>
            </PermissionGuard>
          } />
          <Route path={getRoutePath('kernel-dashboard')} element={
            <PermissionGuard pageKey="kernel-dashboard">
              <Suspense fallback={<PageSkeleton />}><SccDashboardPage /></Suspense>
            </PermissionGuard>
          } />
          <Route path={getRoutePath('audit-logs')} element={
            <PermissionGuard pageKey="audit-logs">
              <Suspense fallback={<PageSkeleton />}><AuditActionsPage /></Suspense>
            </PermissionGuard>
          } />

          {/* Administration */}
          <Route path={getRoutePath('module-mgmt')} element={
            <PermissionGuard pageKey="module-mgmt">
              <Suspense fallback={<PageSkeleton />}><ModuleMgmtPage /></Suspense>
            </PermissionGuard>
          } />
          <Route path={getRoutePath('role-mgmt')} element={
            <PermissionGuard pageKey="role-mgmt">
              <Suspense fallback={<PageSkeleton />}><RoleManagementPage /></Suspense>
            </PermissionGuard>
          } />
          <Route path={getRoutePath('user-profile')} element={
            <PermissionGuard pageKey="user-profile">
              <Suspense fallback={<PageSkeleton />}><UserEnrichmentPage /></Suspense>
            </PermissionGuard>
          } />
          <Route path={getRoutePath('user-role-assign')} element={
            <PermissionGuard pageKey="user-role-assign">
              <Suspense fallback={<PageSkeleton />}><UserRoleAssignmentPage /></Suspense>
            </PermissionGuard>
          } />

          {/* Governance */}
          <Route path={getRoutePath('admin-access-requests')} element={
            <PermissionGuard pageKey="admin-access-requests">
              <Suspense fallback={<PageSkeleton />}><PlaceholderPage title="Access Requests" /></Suspense>
            </PermissionGuard>
          } />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={getRoutePath('kernel-dashboard')} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
