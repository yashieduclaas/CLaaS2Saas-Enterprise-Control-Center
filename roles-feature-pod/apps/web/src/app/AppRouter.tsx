// apps/web/src/app/AppRouter.tsx  —  ADDITIVE CHANGE ONLY
//
// ⚠️  DO NOT replace the whole file.
// Apply ONLY the two additive insertions marked below.
//
// ─────────────────────────────────────────────────────────────
// INSERTION 1 — Add lazy import alongside the existing DashboardPage import:
//
//   const DashboardPage = lazy(() => import("@/features/dashboard/DashboardPage"));
//   + const RolesPage = lazy(() => import("@/features/roles/components/RolesPage"));
//
// ─────────────────────────────────────────────────────────────
// INSERTION 2 — Add route inside the AuthGuard / AppLayout <Route> block,
//   after the existing /dashboard route:
//
//   {/* Feature routes added here following ROUTE_MAP pattern */}
//   + <Route
//   +   path="/roles"
//   +   element={
//   +     <PermissionGuard routeKey="ROLES">
//   +       <Suspense fallback={null}>
//   +         <RolesPage />
//   +       </Suspense>
//   +     </PermissionGuard>
//   +   }
//   + />
// ─────────────────────────────────────────────────────────────
//
// Full resulting file for reference (do not apply if it would overwrite
// concurrent feature additions — apply surgically):

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { AuthGuard } from "@/auth/AuthGuard";
import { PermissionGuard } from "@/rbac/PermissionGuard";
import { ROUTE_MAP } from "@/rbac/RoutePermissionMap"; // eslint-disable-line @typescript-eslint/no-unused-vars

import { lazy, Suspense } from "react";

// ── Platform pages ────────────────────────────────────────────────────────
const DashboardPage = lazy(() => import("@/features/dashboard/DashboardPage"));

// ── Feature: roles (ADDITIVE) ─────────────────────────────────────────────
const RolesPage = lazy(() => import("@/features/roles/components/RolesPage"));

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<div>Login — placeholder</div>} />
        <Route
          element={
            <AuthGuard>
              <AppLayout />
            </AuthGuard>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <PermissionGuard routeKey="DASHBOARD">
                <Suspense fallback={null}>
                  <DashboardPage />
                </Suspense>
              </PermissionGuard>
            }
          />

          {/* ── ADDITIVE: Roles route ────────────────────────────────── */}
          <Route
            path="/roles"
            element={
              <PermissionGuard routeKey="ROLES">
                <Suspense fallback={null}>
                  <RolesPage />
                </Suspense>
              </PermissionGuard>
            }
          />
          {/* ── END ADDITIVE ─────────────────────────────────────────── */}

          {/* Feature routes added here following ROUTE_MAP pattern */}
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
