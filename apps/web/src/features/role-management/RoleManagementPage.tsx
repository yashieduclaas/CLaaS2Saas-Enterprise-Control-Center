import { useState } from 'react';
import { makeStyles, tokens, Text, Input, MessageBar, MessageBarBody, Button } from '@fluentui/react-components';
import { AppIcon } from '@/components/AppIcon';
import { usePermissionContext } from '@/rbac/PermissionContext';
import { usePermission } from '@/rbac/usePermission';
import { PageSkeleton } from '@/app/PageSkeleton';
import { useRoleListQuery } from './api/useRoleListQuery';
import { RoleTable } from './components/RoleTable';
import { RoleTableSkeleton } from './components/RoleTableSkeleton';
import { AddSecurityRoleModal } from './components/AddSecurityRoleModal';
import type { PermissionCode } from '@claas2saas/contracts/rbac';
import type { SecurityRole } from './types/securityRole';

const useStyles = makeStyles({
  page: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalL },
  pageHeader: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXS },
  pageTitle: { fontSize: tokens.fontSizeBase600, fontWeight: tokens.fontWeightSemibold, color: tokens.colorNeutralForeground1 },
  pageSubtitle: { fontSize: tokens.fontSizeBase300, color: tokens.colorNeutralForeground3 },
  toolbar: {
    display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalM,
    paddingBottom: tokens.spacingVerticalM, borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  searchInput: { minWidth: '280px' },
});

export function RoleManagementPage() {
  const { isLoading: permLoading } = usePermissionContext();

  if (permLoading) return <PageSkeleton />;

  return <RoleManagementContent />;
}

function RoleManagementContent() {
  const styles = useStyles();
  const [search, setSearch] = useState('');
  const [deferredSearch, setDeferredSearch] = useState('');

  // ── Modal state ────────────────────────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);

  // ── Local optimistic roles prepended by onCreated ─────────────────────────
  // These sit on top of whatever the API query returns.
  const [optimisticRoles, setOptimisticRoles] = useState<SecurityRole[]>([]);

  const canCreate = usePermission('ROLE:CREATE' satisfies PermissionCode);

  const { data, isLoading, isError, isFetching, refetch } = useRoleListQuery({
    pageSize: 25,
    ...(deferredSearch ? { search: deferredSearch } : {}),
  });

  const apiRoles = data?.data ?? [];

  function handleSearchChange(value: string) {
    setSearch(value);
    const trimmed = value.trim();
    if (trimmed.length === 0 || trimmed.length >= 2) {
      setDeferredSearch(trimmed);
    }
  }

  /**
   * Called by AddSecurityRoleModal after a successful async create.
   * Prepends the new role optimistically — no full-list refetch required.
   * The parent owns the state update; the modal is decoupled.
   */
  function handleRoleCreated(newRole: SecurityRole) {
    setOptimisticRoles(prev => [newRole, ...prev]);
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <Text as="h1" className={styles.pageTitle}>Role Management</Text>
        <Text className={styles.pageSubtitle}>Define and manage security roles for this tenant.</Text>
      </div>

      <div className={styles.toolbar}>
        <Input
          className={styles.searchInput}
          contentBefore={<AppIcon name="search" size={20} />}
          placeholder="Search roles by name or code..."
          value={search}
          onChange={(_, d) => handleSearchChange(d.value)}
          aria-label="Search roles"
          disabled={isLoading}
        />
        {/* Button always rendered — canCreate controls disabled, not visibility.
            If the button was invisible before, canCreate was false (permission
            not granted or still loading). Check browser console for debug info. */}
        <Button
          appearance="primary"
          id="btn-add-role"
          disabled={!canCreate}
          title={!canCreate ? 'You do not have permission to create roles' : undefined}
          onClick={() => {
            console.log('[RoleManagementPage] + Add New Role clicked, showAddModal → true');
            setShowAddModal(true);
          }}
        >
          + Add New Role
        </Button>
      </div>

      {isError && (
        <MessageBar intent="error" role="alert">
          <MessageBarBody>
            Failed to load roles.{' '}
            <Button appearance="transparent" size="small" onClick={() => void refetch()}>Retry</Button>
          </MessageBarBody>
        </MessageBar>
      )}

      <div aria-live="polite" aria-atomic="true" style={{ position: 'absolute', left: '-9999px' }}>
        {isFetching && !isLoading ? 'Updating roles list...' : ''}
      </div>

      {isLoading ? (
        <RoleTableSkeleton />
      ) : (
        <RoleTable
          roles={[...optimisticRoles.map(r => ({
            // Map SecurityRole → RoleDto shape for the existing RoleTable
            roleId: r.id,
            tenantId: '',
            moduleId: r.moduleCode,
            roleCode: r.roleCode,
            roleName: r.roleName,
            roleType: 'ADMIN' as const,   // safe placeholder — backend will own this
            isSystemRole: r.roleType === 'SYSTEM',
            isActive: true,
            permissionCodes: [],
            createdAt: r.createdAt,
          })), ...apiRoles]}
          hasActiveSearch={deferredSearch.length > 0}
        />
      )}

      {/* ── Add New Security Role modal ── */}
      <AddSecurityRoleModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={handleRoleCreated}
      />
    </div>
  );
}
