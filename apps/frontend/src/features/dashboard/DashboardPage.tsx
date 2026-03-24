import { makeStyles, tokens, Text } from '@fluentui/react-components';
import { usePermissionContext } from '@/rbac/PermissionContext';
import { PageSkeleton } from '@/app/PageSkeleton';

const useStyles = makeStyles({
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  title: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  placeholder: {
    padding: tokens.spacingVerticalXL,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    color: tokens.colorNeutralForeground3,
    textAlign: 'center' as const,
  },
});

export function DashboardPage() {
  const styles = useStyles();
  const { isLoading: permLoading } = usePermissionContext();

  if (permLoading) return <PageSkeleton />;

  return (
    <div className={styles.page}>
      <Text as="h1" className={styles.title}>Security Overview</Text>
      <div className={styles.placeholder}>
        <Text>Security kernel dashboard - KPI widgets coming in a future feature pod.</Text>
      </div>
    </div>
  );
}
