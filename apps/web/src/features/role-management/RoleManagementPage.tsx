import { useState } from 'react';
import { makeStyles, tokens, Text, Input, MessageBar, MessageBarBody, Button } from '@fluentui/react-components';
import { AppIcon } from '@/components/AppIcon';
import { usePermissionContext } from '@/rbac/PermissionContext';
import { usePermission } from '@/rbac/usePermission';
import { PageSkeleton } from '@/app/PageSkeleton';
import { useRoleListQuery } from './api/useRoleListQuery';
import { RoleTable } from './components/RoleTable';
import { RoleTableSkeleton } from './components/RoleTableSkeleton';
import type { PermissionCode } from '@claas2saas/contracts/rbac';

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

  const canCreate = usePermission('ROLE:CREATE' satisfies PermissionCode);

  const { data, isLoading, isError, isFetching, refetch } = useRoleListQuery({
    search: deferredSearch || undefined,
    pageSize: 25,
  });

  const roles = data?.data ?? [];

  function handleSearchChange(value: string) {
    setSearch(value);
    const trimmed = value.trim();
    if (trimmed.length === 0 || trimmed.length >= 2) {
      setDeferredSearch(trimmed);
    }
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
        {canCreate && <Button appearance="primary">Add Role</Button>}
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
        <RoleTable roles={roles} hasActiveSearch={deferredSearch.length > 0} />
      )}
    </div>
  );
}
