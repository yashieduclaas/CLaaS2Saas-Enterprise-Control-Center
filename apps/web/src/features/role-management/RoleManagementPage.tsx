// apps/web/src/features/role-management/RoleManagementPage.tsx
// Security Role Management — /roles

import { ManagePermissionsModal } from "./components/ManagePermissionsModal";
import { useState } from 'react';
import {
  Button,
  Spinner,
  makeStyles,
  tokens,
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
import { EditSecurityRoleModal } from './components/EditSecurityRoleModal';
import { DeleteRoleModal } from './components/DeleteRoleModal';
import type { PermissionCode } from '@claas2saas/contracts/rbac';
import type { SecurityRole } from './types/securityRole';

// ─── Styles ────────────────────────────────────────────────────────────────

const useStyles = makeStyles({

  // ── Page ──
  pageContent: {
    padding: '16px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },

  // ── Header ──
  pageHeader: {
    marginBottom: '24px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
  },
  titleSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: 600,
    color: 'var(--primary)',
    fontFamily: 'var(--font-heading)',
    margin: 0,
    lineHeight: 1.3,
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#666666',
    margin: 0,
  },

  // ── Card ──
  card: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusLarge,
    boxShadow: tokens.shadow16,
    overflow: 'hidden',
  },

  // ── Filters wrapper ──
  filtersWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',                         
    padding: '16px 24px 12px 24px',   
    position: 'sticky',
    top: 0,
    zIndex: 30,
    backgroundColor: '#ffffff',
  },

  // ── Search row ──
  searchRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
  },
  searchIcon: {
    color: '#9ca3af',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  searchInputWrapper: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    height: '40px',
    padding: '0 14px',
    backgroundColor: '#ffffff', 
    boxSizing: 'border-box',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '14px',
    color: '#374151',
    padding: '0',
    height: '100%',
    fontFamily: 'inherit',
    WebkitAppearance: 'none',
    appearance: 'none',
    '::placeholder': {
      color: '#9ca3af',
      fontSize: '14px',
    },
  },

  // ── Table wrapper ──
  tableWrapper: {
    padding: '10px 25px 25px 25px',
    marginTop: '0',                    // ✅ negative margin hataya
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
    height: '420px',
    overflowY: 'auto',
    overflowX: 'hidden',
    position: 'relative',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '::-webkit-scrollbar': { display: 'none' },
  },
  dataTable: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    tableLayout: 'auto' as const,
  },
  th: {
    padding: '15px 12px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#193e6b',
    textAlign: 'left',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    whiteSpace: 'nowrap',
    backgroundColor: '#f5f6f8',
    position: 'sticky',
    top: 0,
    zIndex: 20,
  },
  td: {
    padding: '13px 12px',
    fontSize: '14px',
    color: '#333333',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
  },
  tr: {
    ':hover': { backgroundColor: 'rgba(0,0,0,0.02)' },
  },

  // ── Cell blocks ──
  cellPrimary: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#333333',
    display: 'block',
  },
  cellSecondary: {
    fontSize: '12px',
    color: '#666666',
    display: 'block',
  },
  cellText: {
    fontSize: '14px',
    color: '#333333',
  },

  // ── Role code badge ──
  roleBadge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
    display: 'inline-flex',
    alignItems: 'center',
  },

  // ── Role type badge ──
  typeBadge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
    display: 'inline-flex',
    alignItems: 'center',
  },
  typeBadgeSystem: {
    background: 'rgba(0,123,255,0.1)',
    color: '#007bff',
  },
  typeBadgeCustom: {
    background: 'rgba(108,117,125,0.1)',
    color: '#6c757d',
  },

  // ── Icon action buttons ──
  iconBtn: {
    padding: '6px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666666',
    ':hover': { background: 'rgba(0,0,0,0.05)' },
  },

  // ── Manage permissions button ──
  manageBtn: {
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '14px',
    border: '1px solid #4b8f9d',
    background: '#ffffff',
    color: '#2c6e7c',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: 500,
    transition: 'all .2s ease',
    ':hover': {
      background: '#4b8f9d',
      color: '#ffffff',
    },
  },

  // ── Actions cell ──
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  // ── Footer ──
  footer: {
    padding: tokens.spacingVerticalM,
    paddingLeft: tokens.spacingHorizontalL,
    paddingRight: tokens.spacingHorizontalL,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },

  // ── Empty state ──
  emptyState: {
    textAlign: 'center' as const,
    padding: '48px 24px',
    color: '#666666',
    fontSize: '14px',
  },
});

// ─── Role badge colors ──────────────────────────────────────────────────────

const ROLE_BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  COLLABORATOR: { bg: 'rgba(0,123,255,0.1)',  color: '#007bff' },
  CONTRIBUTOR:  { bg: 'rgba(40,167,69,0.1)',  color: '#28a745' },
  VIEWER:       { bg: 'rgba(255,193,7,0.1)',  color: '#ffc107' },
  GLOBAL_ADMIN: { bg: 'rgba(220,53,69,0.1)',  color: '#dc3545' },
};

// ─── Sub-components ─────────────────────────────────────────────────────────

function RoleCodeBadge({ code }: { code: string }) {
  const styles = useStyles();
  const colors = ROLE_BADGE_COLORS[code] ?? { bg: 'rgba(108,117,125,0.1)', color: '#6c757d' };
  return (
    <span
      className={styles.roleBadge}
      style={{ background: colors.bg, color: colors.color }}
    >
      {code}
    </span>
  );
}

function RoleTypePill({ type }: { type: SecurityRole['roleType'] }) {
  const styles = useStyles();
  const label = type === 'SYSTEM' ? 'System' : 'Custom';
  return (
    <span
      className={`${styles.typeBadge} ${
        type === 'SYSTEM' ? styles.typeBadgeSystem : styles.typeBadgeCustom
      }`}
    >
      {label}
    </span>
  );
}

function ActionsCell({
  role,
  canDelete,
  onEdit,
  onDelete,
}: {
  role: SecurityRole;
  canDelete: boolean;
  onEdit: (r: SecurityRole) => void;
  onDelete: (r: SecurityRole) => void;
}) {
  const styles = useStyles();
  return (
    <div className={styles.actions}>
      <button
        type="button"
        className={styles.iconBtn}
        aria-label={`Edit ${role.roleName}`}
        onClick={() => onEdit(role)}
      >
        <EditRegular fontSize={16} aria-hidden="true" focusable={false} />
      </button>
      <button
        type="button"
        className={styles.iconBtn}
        aria-label={`Delete ${role.roleName}`}
        disabled={!canDelete}
        onClick={() => onDelete(role)}
      >
        <DeleteRegular fontSize={16} aria-hidden="true" focusable={false} />
      </button>
    </div>
  );
}

// ─── Page entry ─────────────────────────────────────────────────────────────

export function RoleManagementPage() {
  const { isLoading: permLoading } = usePermissionContext();
  if (permLoading) return <PageSkeleton />;
  return <RoleManagementContent />;
}

// ─── Main content ────────────────────────────────────────────────────────────

function RoleManagementContent() {
  const styles = useStyles();

  const { data: allRoles, isLoading, error } = useRoles();
  const [search, setSearch]                       = useState('');
  const [focused, setFocused]                     = useState(false);
  const [showAddModal, setShowAddModal]           = useState(false);
  const [editRole, setEditRole]                   = useState<SecurityRole | null>(null);
  const [optimisticRoles, setOptimisticRoles]     = useState<SecurityRole[]>([]);
  const [deletedRoleIds, setDeletedRoleIds]       = useState<ReadonlySet<string>>(new Set());
  const [manageRole, setManageRole]               = useState<SecurityRole | null>(null);
  const [deleteRole, setDeleteRole]               = useState<SecurityRole | null>(null);
  const [showDeleteMessage, setShowDeleteMessage] = useState(false);

  const canCreate = usePermission('ROLE:CREATE' satisfies PermissionCode);
  const canDelete = usePermission('ROLE:DELETE' satisfies PermissionCode);

  const roles = [...optimisticRoles, ...allRoles].filter(
    (role) => !deletedRoleIds.has(role.id),
  );

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

  function handleDeleteConfirmed() {
    if (!deleteRole) return;
    const roleId = deleteRole.id;
    setOptimisticRoles((prev) => prev.filter((role) => role.id !== roleId));
    setDeletedRoleIds((prev) => new Set(prev).add(roleId));
    setDeleteRole(null);
    setShowDeleteMessage(true);
    setTimeout(() => setShowDeleteMessage(false), 3000);
  }

  return (
    <div className={styles.pageContent}>

      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <div className={styles.titleSection}>
          <h1 className={styles.pageTitle}>Security Role Management</h1>
          <p className={styles.pageSubtitle}>
            Manage Security Roles for Solutions and Modules
          </p>
        </div>
        <Button
          id="btn-add-role"
          appearance="primary"
          icon={<AddRegular />}
          disabled={!canCreate}
          title={!canCreate ? 'You do not have permission to create roles' : undefined}
          onClick={() => setShowAddModal(true)}
        >
          Add New Role
        </Button>
      </div>

      {/* ── Main Card ── */}
      <div className={styles.card}>

        {/* ── Filters wrapper ── */}
        <div className={styles.filtersWrapper}>

          {/* ── Search bar ── */}
          <div className={styles.searchRow}>
            <span className={styles.searchIcon}>
              <SearchRegular fontSize={18} />
            </span>
            <div
              className={styles.searchInputWrapper}
              style={focused ? {
                border: '1px solid #c7d2fe',
                boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.2)',
              } : undefined}
            >
              <input
                className={styles.searchInput}
                type="search"
                placeholder="Search Roles by Name, Code, Solution, or Module..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                aria-label="Search roles"
              />
            </div>
          </div>

          {/* ✅ All Roles tab HATA DIYA */}

        </div>

        {/* ── Table ── */}
        <div className={styles.tableWrapper}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <Spinner label="Loading roles…" size="medium" />
            </div>
          ) : error ? (
            <div style={{ padding: '24px', color: '#dc3545', fontSize: '14px' }} role="alert">
              {error}
            </div>
          ) : (
            <table className={styles.dataTable} aria-label="Security role listing">
              <thead>
                <tr>
                  <th className={styles.th}>Solution</th>
                  <th className={styles.th}>Module</th>
                  <th className={styles.th}>Role Code</th>
                  <th className={styles.th}>Role Name</th>
                  <th className={styles.th}>Role Type</th>
                  <th className={styles.th}>Permissions</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={styles.emptyState}>
                      No roles found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((role) => (
                    <tr key={role.id} className={styles.tr}>

                      {/* Solution */}
                      <td className={styles.td}>
                        <span className={styles.cellPrimary}>{role.solutionCode}</span>
                        <span className={styles.cellSecondary}>{role.solutionName}</span>
                      </td>

                      {/* Module */}
                      <td className={styles.td}>
                        <span className={styles.cellPrimary}>{role.moduleCode}</span>
                        <span className={styles.cellSecondary}>{role.moduleName}</span>
                      </td>

                      {/* Role Code */}
                      <td className={styles.td}>
                        <RoleCodeBadge code={role.roleCode} />
                      </td>

                      {/* Role Name */}
                      <td className={styles.td}>
                        <span className={styles.cellText}>{role.roleName}</span>
                      </td>

                      {/* Role Type */}
                      <td className={styles.td}>
                        <RoleTypePill type={role.roleType} />
                      </td>

                      {/* Permissions */}
                      <td className={styles.td}>
                        <button
                          type="button"
                          className={styles.manageBtn}
                          onClick={() => setManageRole(role)}
                        >
                          <SettingsRegular fontSize={14} />
                          Manage
                        </button>
                      </td>

                      {/* Actions */}
                      <td className={styles.td}>
                        <ActionsCell
                          role={role}
                          canDelete={canDelete}
                          onEdit={setEditRole}
                          onDelete={setDeleteRole}
                        />
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Footer ── */}
        {!isLoading && !error && (
          <div className={styles.footer}>
            Showing {filtered.length} of {roles.length} security role
            {roles.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <AddSecurityRoleModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={handleRoleCreated}
      />

      {editRole && (
        <EditSecurityRoleModal
          role={editRole}
          onClose={() => setEditRole(null)}
        />
      )}

      {deleteRole && (
        <DeleteRoleModal
          role={deleteRole}
          onClose={() => setDeleteRole(null)}
          onConfirm={handleDeleteConfirmed}
        />
      )}

      <ManagePermissionsModal
        role={manageRole}
        onClose={() => setManageRole(null)}
      />

      {/* ── Delete toast ── */}
      {showDeleteMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '25px',
            right: '25px',
            background: '#2f6f4e',
            color: '#fff',
            padding: '12px 18px',
            borderRadius: '8px',
            fontSize: '14px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          }}
        >
          ✓ Role deleted
        </div>
      )}

    </div>
  );
}