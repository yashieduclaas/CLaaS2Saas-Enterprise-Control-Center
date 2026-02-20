// apps/web/src/features/roles/components/RolesPage.tsx
//
// Security Control Centre → Role Management → List Roles
//
// Governance checklist:
//   ✅ usePermissionContext — respects permLoading, shows PageSkeleton
//   ✅ PermissionCode "ROLES:READ" imported from contracts (no hardcoded strings)
//   ✅ PermissionGuard wraps route in AppRouter (see AppRouter additive change)
//   ✅ Loading / empty / error / success states
//   ✅ Fluent UI Table with WCAG 2.1 AA semantics
//   ✅ Griffel styles via co-located RolesPage.styles.ts
//   ✅ No platform files modified
//   ✅ Table structure ready for virtualization (plain <table> semantics via Fluent)

import {
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  Button,
  Skeleton,
  SkeletonItem,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Text,
} from "@fluentui/react-components";
import {
  ShieldTaskRegular,
  ArrowClockwiseRegular,
  ErrorCircleRegular,
} from "@fluentui/react-icons";

import { usePermissionContext } from "@/rbac/PermissionContext";
import { useRolesQuery } from "../api/useRolesQuery";
import { useRolesPageStyles } from "./RolesPage.styles";

// ── Column definitions (deterministic order) ──────────────────────────────
const COLUMNS = [
  { columnId: "name",          label: "Role Name",      width: "30%" },
  { columnId: "description",   label: "Description",    width: "40%" },
  { columnId: "isSystemRole",  label: "Is System Role", width: "15%" },
  { columnId: "updatedAt",     label: "Updated At",     width: "15%" },
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────
function formatDate(isoDate: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}

// ── Sub-components ─────────────────────────────────────────────────────────

function PageLoadingSkeleton() {
  // Shows while permission context is still resolving
  return (
    <Skeleton aria-label="Loading roles page…">
      <SkeletonItem size={32} style={{ marginBottom: 8 }} />
      <SkeletonItem size={16} style={{ width: "40%", marginBottom: 24 }} />
      <SkeletonItem size={48} style={{ marginBottom: 4 }} />
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonItem key={i} size={40} style={{ marginBottom: 2 }} />
      ))}
    </Skeleton>
  );
}

function TableLoadingSkeleton({ styles }: { styles: ReturnType<typeof useRolesPageStyles> }) {
  return (
    <div aria-label="Loading roles…" aria-busy="true" role="status">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={styles.skeletonRow}>
          <Skeleton style={{ flex: 1 }}>
            <SkeletonItem size={16} />
          </Skeleton>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ styles }: { styles: ReturnType<typeof useRolesPageStyles> }) {
  return (
    <div className={styles.emptyState} role="status" aria-label="No roles found">
      <ShieldTaskRegular className={styles.emptyStateIcon} aria-hidden="true" />
      <p className={styles.emptyStateTitle}>No roles defined</p>
      <p className={styles.emptyStateBody}>
        This tenant has no roles configured yet.
      </p>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
  styles,
}: {
  message: string;
  onRetry: () => void;
  styles: ReturnType<typeof useRolesPageStyles>;
}) {
  return (
    <div className={styles.errorState} role="alert">
      <MessageBar intent="error" layout="multiline">
        <MessageBarBody>
          <MessageBarTitle>Failed to load roles</MessageBarTitle>
          {message}
        </MessageBarBody>
      </MessageBar>
      <Button
        appearance="secondary"
        icon={<ArrowClockwiseRegular aria-hidden="true" />}
        onClick={onRetry}
      >
        Retry
      </Button>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function RolesPage() {
  const styles = useRolesPageStyles();
  const { isLoading: permLoading } = usePermissionContext();

  const { data: roles, isLoading, isError, error, refetch } = useRolesQuery();

  // Permission context still resolving — show full-page skeleton
  // (PermissionGuard handles the redirect; this covers the brief loading flash)
  if (permLoading) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className={styles.root}>
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Role Management</h1>
        <p className={styles.pageSubtitle}>
          View all roles defined in this tenant.
        </p>
      </header>

      {/* ── Table section ───────────────────────────────────────────────── */}
      <div className={styles.tableContainer}>
        {isLoading ? (
          <TableLoadingSkeleton styles={styles} />
        ) : isError ? (
          <ErrorState
            message={error?.message ?? "An unexpected error occurred."}
            onRetry={() => void refetch()}
            styles={styles}
          />
        ) : !roles || roles.length === 0 ? (
          <EmptyState styles={styles} />
        ) : (
          /*
           * Performance note: Table structure intentionally uses standard
           * Fluent semantics. Swap the inner body for a virtualised renderer
           * (e.g. @tanstack/react-virtual) when row counts exceed ~200.
           * The column definitions above are the stable contract.
           */
          <Table
            aria-label="Roles table"
            aria-colcount={COLUMNS.length}
            aria-rowcount={roles.length + 1}
            sortable
          >
            <TableHeader>
              <TableRow aria-rowindex={1}>
                {COLUMNS.map((col) => (
                  <TableHeaderCell
                    key={col.columnId}
                    style={{ width: col.width }}
                  >
                    {col.label}
                  </TableHeaderCell>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {roles.map((role, rowIdx) => (
                <TableRow
                  key={role.id}
                  aria-rowindex={rowIdx + 2}
                >
                  {/* Role Name */}
                  <TableCell>
                    <Text weight="semibold">{role.name}</Text>
                  </TableCell>

                  {/* Description */}
                  <TableCell>
                    <Text>
                      {role.description ?? (
                        <Text style={{ fontStyle: "italic" }}>
                          No description
                        </Text>
                      )}
                    </Text>
                  </TableCell>

                  {/* Is System Role */}
                  <TableCell>
                    {role.isSystemRole ? (
                      <Badge
                        className={styles.systemRoleBadge}
                        color="informative"
                        shape="rounded"
                        aria-label="System role"
                      >
                        System
                      </Badge>
                    ) : (
                      <Badge
                        className={styles.systemRoleBadge}
                        color="subtle"
                        shape="rounded"
                        aria-label="Custom role"
                      >
                        Custom
                      </Badge>
                    )}
                  </TableCell>

                  {/* Updated At */}
                  <TableCell>
                    <Text
                      className={styles.dateCell}
                      aria-label={`Last updated: ${role.updatedAt}`}
                    >
                      {formatDate(role.updatedAt)}
                    </Text>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
