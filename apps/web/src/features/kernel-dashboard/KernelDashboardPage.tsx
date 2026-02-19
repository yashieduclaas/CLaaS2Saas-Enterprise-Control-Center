// apps/web/src/features/kernel-dashboard/KernelDashboardPage.tsx
// Kernel Dashboard — static UI. Renders inside AppLayout.

import { makeStyles, tokens, Text, Input } from '@fluentui/react-components';
import { AppIcon } from '@/components/AppIcon';
import { usePermissionContext } from '@/rbac/PermissionContext';
import { PageSkeleton } from '@/app/PageSkeleton';

const useStyles = makeStyles({
  page: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
    padding: tokens.spacingVerticalXL,
    backgroundColor: tokens.colorNeutralBackground2,
    margin: `-${tokens.spacingVerticalXL} -${tokens.spacingHorizontalXL}`,
  },
  inner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalXL,
    maxWidth: '700px',
    width: '100%',
  },
  heading: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    textAlign: 'center',
  },
  searchInput: {
    width: '100%',
    maxWidth: '700px',
    borderRadius: tokens.borderRadiusCircular,
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow16,
  },
});

export function KernelDashboardPage() {
  const styles = useStyles();
  const { isLoading: permLoading } = usePermissionContext();

  if (permLoading) return <PageSkeleton />;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Text as="h1" className={styles.heading}>
          Welcome, how can I help?
        </Text>
        <Input
          className={styles.searchInput}
          placeholder="Describe your task to open the right feature"
          contentBefore={<AppIcon name="search" size={20} />}
          appearance="outline"
          size="large"
          aria-label="Describe your task"
        />
      </div>
    </div>
  );
}
