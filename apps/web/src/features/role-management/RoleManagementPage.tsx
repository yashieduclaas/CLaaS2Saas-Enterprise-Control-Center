// apps/web/src/features/role-management/RoleManagementPage.tsx
// Security Role Management — /roles
// Fluent UI v9, CSS Modules, no inline styles.
// Keeps AddSecurityRoleModal and existing permission guard intact.

import { useState } from 'react';
import {
  Button,
  Input,
  Spinner,
  Text,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from '@fluentui/react-components';
import {
  AddRegular,
  SearchRegular,
  SettingsRegular,
  EditRegular,
  DeleteRegular,
} from '@fluentui/react-icons';
import { usePermission } from '@/rbac/usePermission';
import { usePermissionContext } from '@/rbac/PermissionContext';
import { PageSkeleton } from '@/app/PageSkeleton';
import { useRoles } from './hooks/useRoles';
import { AddSecurityRoleModal } from './components/AddSecurityRoleModal';
import type { PermissionCode } from '@claas2saas/contracts/rbac';
import type { SecurityRole } from './types/securityRole';
import styles from './pages/RoleManagementPage.module.css';

// ── Role code → badge class ───────────────────────────────────────────────────
const ROLE_CODE_BADGE: Record<string, string> = {
  COLLABORATOR: styles.badgeCollaborator ?? '',
  CONTRIBUTOR: styles.badgeContributor ?? '',
  VIEWER: styles.badgeViewer ?? '',
  GLOBAL_ADMIN: styles.badgeGlobalAdmin ?? '',
};

function RoleCodeBadge({ code }: { code: string }) {
  const cls = ROLE_CODE_BADGE[code] ?? styles.badgeDefault;
  return <span className={`${styles.badge} ${cls}`}>{code.replace(/_/g, '_')}</span>;
}

function RoleTypePill({ type }: { type: SecurityRole['roleType'] }) {
  const label = type === 'SYSTEM' ? 'System' : 'Custom';
  return <span className={styles.typePill}>{label}</span>;
}

function ActionsCell({ role, onEdit }: { role: SecurityRole; onEdit: (r: SecurityRole) => void }) {
  return (
    <div className={styles.actions}>
      <button
        type="button"
        className={styles.actionBtn}
        aria-label={`Edit ${role.roleName}`}
        onClick={() => onEdit(role)}
      >
        <EditRegular fontSize={16} />
      </button>
      <button
        type="button"
        className={styles.actionBtn}
        aria-label={`Delete ${role.roleName}`}
        onClick={() => console.log('Delete role:', role.id)}
      >
        <DeleteRegular fontSize={16} />
      </button>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function RoleManagementPage() {
  const { isLoading: permLoading } = usePermissionContext();
  if (permLoading) return <PageSkeleton />;
  return <RoleManagementContent />;
}

function RoleManagementContent() {
  const { data: allRoles, isLoading, error } = useRoles();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [optimisticRoles, setOptimisticRoles] = useState<SecurityRole[]>([]);

  const canCreate = usePermission('ROLE:CREATE' satisfies PermissionCode);

  const roles = [...optimisticRoles, ...allRoles];

  const filtered = roles.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.roleName.toLowerCase().includes(q) ||
      r.roleCode.toLowerCase().includes(q) ||
      r.solutionCode.toLowerCase().includes(q) ||
      r.solutionName.toLowerCase().includes(q) ||
      r.moduleCode.toLowerCase().includes(q) ||
      r.moduleName.toLowerCase().includes(q)
    );
  });

  function handleRoleCreated(newRole: SecurityRole) {
    setOptimisticRoles((prev) => [newRole, ...prev]);
  }

  function handleEditClick(role: SecurityRole) {
    console.log('Edit role:', role.id);
  }

  return (
    <div className={styles.page}>

      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.titleBlock}>
          <h1 className={styles.pageTitle}>Security Role Management</h1>
          <p className={styles.pageSubtitle}>Manage Security Roles for Solutions and Modules</p>
        </div>
        <Button
          id="btn-add-role"
          appearance="primary"
          icon={<AddRegular />}
          disabled={!canCreate}
          title={!canCreate ? 'You do not have permission to create roles' : undefined}
          onClick={() => {
            console.log('[RoleManagementPage] + Add New Role clicked');
            setShowAddModal(true);
          }}
        >
          + Add New Role
        </Button>
      </div>

      {/* ── Card ── */}
      <div className={styles.card}>

        {/* Search */}
        <div className={styles.searchWrap}>
          <Input
            id="role-search-input"
            contentBefore={<SearchRegular fontSize={16} />}
            placeholder="Search Roles by Name, Code, Solution, or Module..."
            value={search}
            onChange={(_, d) => setSearch(d.value)}
            style={{ width: '100%' }}
          />
        </div>

        {/* Table */}
        <div className={styles.tableWrap}>
          {isLoading ? (
            <Spinner label="Loading roles…" size="medium" />
          ) : error ? (
            <Text style={{ color: 'var(--color-danger-text)' }} role="alert">{error}</Text>
          ) : (
            <Table aria-label="Security role listing" size="small">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell><span className={styles.colHeader}>Solution</span></TableHeaderCell>
                  <TableHeaderCell><span className={styles.colHeader}>Module</span></TableHeaderCell>
                  <TableHeaderCell><span className={styles.colHeader}>Role Code</span></TableHeaderCell>
                  <TableHeaderCell><span className={styles.colHeader}>Role Name</span></TableHeaderCell>
                  <TableHeaderCell><span className={styles.colHeader}>Role Type</span></TableHeaderCell>
                  <TableHeaderCell><span className={styles.colHeader}>Permissions</span></TableHeaderCell>
                  <TableHeaderCell><span className={styles.colHeader}>Actions</span></TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <span className={styles.cellPrimary}>{role.solutionCode}</span>
                      <span className={styles.cellSecondary}>{role.solutionName}</span>
                    </TableCell>
                    <TableCell>
                      <span className={styles.cellPrimary}>{role.moduleCode}</span>
                      <span className={styles.cellSecondary}>{role.moduleName}</span>
                    </TableCell>
                    <TableCell>
                      <RoleCodeBadge code={role.roleCode} />
                    </TableCell>
                    <TableCell>
                      <span className={styles.cellText}>{role.roleName}</span>
                    </TableCell>
                    <TableCell>
                      <RoleTypePill type={role.roleType} />
                    </TableCell>
                    <TableCell>
                      <Button
                        appearance="outline"
                        size="small"
                        icon={<SettingsRegular fontSize={12} />}
                        className={styles.manageBtn}
                        onClick={() => console.log('Manage permissions:', role.id)}
                        aria-label={`Manage permissions for ${role.roleName}`}
                      >
                        Manage
                      </Button>
                    </TableCell>
                    <TableCell>
                      <ActionsCell role={role} onEdit={handleEditClick} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Footer */}
        {!isLoading && !error && (
          <Text className={styles.footer}>
            Showing {filtered.length} of {roles.length} security role{roles.length !== 1 ? 's' : ''}
          </Text>
        )}
      </div>

      {/* ── Add Modal (existing — untouched) ── */}
      <AddSecurityRoleModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={handleRoleCreated}
      />

    </div>
  );
}
