// apps/web/src/features/role-management/RoleManagementPage.tsx
// Security Role Management — /roles
// Vanilla table spec — Griffel only, native table.
import { ManagePermissionsModal } from "./components/ManagePermissionsModal";
import { useState } from 'react';
import {
  Button,
  Spinner,
  Text,
  makeStyles,
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

const useStyles = makeStyles({
  pageContent: {
    padding: '10px 18px',
  },
  pageHeader: {
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#193e6b',
    margin: 0,
    lineHeight: 1.3,
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#666666',
    margin: 0,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    height: '520px'   // 👈 important
    
  },
  searchWrap: {
    width: '100%',
   
  },
 tableWrapper: {
  borderRadius: '8px',
  backgroundColor: '#ffffff',
  overflow: 'hidden',
  flex: 1,            // 👈 important
  border: '1px solid #e5e7eb',
  overflowY: 'auto',
  margin: '0 16px',
  overflowX: 'hidden',
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  '::-webkit-scrollbar': {
    display: 'none'
  }
},
  dataTable: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
  },
  th: {
  padding: '14px 18px',
  fontSize: '14px',
  fontWeight: 600,
  color: '#1f3b64',
  textAlign: 'left',
  backgroundColor: '#f1f5f9',

   position: 'sticky',
  top: 0,
  zIndex: 10,
  borderBottom: '1px solid #e5e7eb',
  
},

  td: {
    padding: '16px 18px',
    fontSize: '14px',
    color: '#333333',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
  },
  tr: {
    ':hover': {
      backgroundColor: '#f8fafc',
      
    },
  },
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
  roleBadge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
    display: 'inline-flex',
    alignItems: 'center',
  },
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
    ':hover': {
      background: 'rgba(0,0,0,0.05)',
    },
  },
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
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  footer: {
    fontSize: '13px',
    color: '#666666',
    marginTop: '8px',
    margin: '0 16px'
  },
  searchWrapper:{
  display:"flex",
  alignItems:"center",
  gap:"10px",
  background:"#f8fafc",
  border:"1px solid #e5e7eb",
  borderRadius:"10px",
  padding:"12px 14px",
  marginBottom:"15px",
  marginTop:"12px",
  marginLeft:"16px",   // 👈 left gap
  marginRight:"16px"
},

searchIcon:{
  color:"#94a3b8",
  fontSize:"16px"
},

searchInput:{
  border:"none",
  outline:"none",
  width:"100%",
  fontSize:"14px",
  color:"#334155",
  background:"transparent"
}
});

const ROLE_BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  COLLABORATOR: { bg: 'rgba(0,123,255,0.1)', color: '#007bff' },
  CONTRIBUTOR: { bg: 'rgba(40,167,69,0.1)', color: '#28a745' },
  VIEWER: { bg: 'rgba(255,193,7,0.1)', color: '#ffc107' },
  GLOBAL_ADMIN: { bg: 'rgba(220,53,69,0.1)', color: '#dc3545' },
};

function RoleCodeBadge({ code }: { code: string }) {
  const styles = useStyles();
  const colors = ROLE_BADGE_COLORS[code] ?? { bg: 'rgba(108,117,125,0.1)', color: '#6c757d' };
  return (
    <span
      className={styles.roleBadge}
      style={{ background: colors.bg, color: colors.color }}
    >
      {code.replace(/_/g, '_')}
    </span>
  );
}

function RoleTypePill({ type }: { type: SecurityRole['roleType'] }) {
  const styles = useStyles();
  const label = type === 'SYSTEM' ? 'System' : 'Custom';
  return (
    <span className={`${styles.typeBadge} ${type === 'SYSTEM' ? styles.typeBadgeSystem : styles.typeBadgeCustom}`}>
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

export function RoleManagementPage() {
  const { isLoading: permLoading } = usePermissionContext();
  if (permLoading) return <PageSkeleton />;
  return <RoleManagementContent />;
}

function RoleManagementContent() {
  const styles = useStyles();
  const { data: allRoles, isLoading, error } = useRoles();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editRole, setEditRole] = useState<SecurityRole | null>(null);
  const [optimisticRoles, setOptimisticRoles] = useState<SecurityRole[]>([]);
  const [deletedRoleIds, setDeletedRoleIds] = useState<ReadonlySet<string>>(new Set());
  const [manageRole, setManageRole] = useState<SecurityRole | null>(null);
  const [deleteRole, setDeleteRole] = useState<SecurityRole | null>(null);
  const [showDeleteMessage, setShowDeleteMessage] = useState(false);

  const canCreate = usePermission('ROLE:CREATE' satisfies PermissionCode);
  const canDelete = usePermission('ROLE:DELETE' satisfies PermissionCode);
  const roles = [...optimisticRoles, ...allRoles].filter((role) => !deletedRoleIds.has(role.id));

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

      // show success message
      setShowDeleteMessage(true);

      setTimeout(() => {
        setShowDeleteMessage(false);
      }, 3000);
    }

  return (
    <div className={styles.pageContent}>
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
          style={{ gap: "6px" }}
          title={!canCreate ? 'You do not have permission to create roles' : undefined}
          onClick={() => setShowAddModal(true)}
        >
          Add New Role
        </Button>
      </div>

      <div className={styles.card}>
        <div className={styles.searchWrapper}>
          <SearchRegular className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Search Roles by Name, Code, Solution, or Module..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.tableWrapper}>
          {isLoading ? (
            <Spinner label="Loading roles…" size="medium" />
          ) : error ? (
            <Text style={{ color: '#dc3545' }} role="alert">{error}</Text>
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
                {filtered.map((role) => (
                  <tr key={role.id} className={styles.tr}>
                    <td className={styles.td}>
                      <span className={styles.cellPrimary}>{role.solutionCode}</span>
                      <span className={styles.cellSecondary}>{role.solutionName}</span>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.cellPrimary}>{role.moduleCode}</span>
                      <span className={styles.cellSecondary}>{role.moduleName}</span>
                    </td>
                    <td className={styles.td}>
                      <RoleCodeBadge code={role.roleCode} />
                    </td>
                    <td className={styles.td}><span className={styles.cellText}>{role.roleName}</span></td>
                    <td className={styles.td}>
                      <RoleTypePill type={role.roleType} />
                    </td>
                    <td className={styles.td}>
                      <button
                          className={styles.manageBtn}
                          onClick={() => setManageRole(role)}
                        >
                          <SettingsRegular fontSize={14} />
                          Manage
                      </button>
                    </td>
                    <td className={styles.td}>
                      <ActionsCell
                        role={role}
                        canDelete={canDelete}
                        onEdit={setEditRole}
                        onDelete={setDeleteRole}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!isLoading && !error && (
          <Text className={styles.footer}>
            Showing {filtered.length} of {roles.length} security role{roles.length !== 1 ? 's' : ''}
          </Text>
        )}
      </div>

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
      {showDeleteMessage && (
  <div
    style={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      backgroundColor: "#2e6f44",
      color: "white",
      padding: "12px 20px",
      borderRadius: "8px",
      fontWeight: "500"
    }}
      >
        ✔ Role deleted
      </div>
    )}
    </div>
  );
}

