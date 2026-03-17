import { makeStyles, tokens, Text, MessageBar, MessageBarBody, Button, Skeleton, SkeletonItem } from '@fluentui/react-components';
import { AppIcon } from '@/components/AppIcon';
import { usePermissionContext } from '@/rbac/PermissionContext';
import { PageSkeleton } from '@/app/PageSkeleton';
import { useAuditActionsQuery } from './api/useAuditActionsQuery';

const useStyles = makeStyles({
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  pageTitle: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingVerticalXXL,
    color: tokens.colorNeutralForeground3,
  },
  emptyIcon: { fontSize: '48px' },
  table: { width: '100%', borderCollapse: 'collapse' as const },
  th: {
    textAlign: 'left' as const,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderBottom: `2px solid ${tokens.colorNeutralStroke2}`,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground2,
  },
  td: {
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke3}`,
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground1,
    fontFamily: tokens.fontFamilyMonospace,
  },
});

export function AuditActionsPage() {
  const { isLoading: permLoading } = usePermissionContext();

  if (permLoading) return <PageSkeleton />;

  return <AuditActionsContent />;
}

function AuditActionsContent() {
  const styles = useStyles();
  const { data, isLoading, isError, refetch } = useAuditActionsQuery();
  const events = data?.data ?? [];

  return (
    <div className={styles.page}>
      <Text as="h1" className={styles.pageTitle}>Audit Logs</Text>

      {isError && (
        <MessageBar intent="error" role="alert">
          <MessageBarBody>
            Failed to load audit logs.{' '}
            <Button appearance="transparent" size="small" onClick={() => void refetch()}>
              Retry
            </Button>
          </MessageBarBody>
        </MessageBar>
      )}

      {isLoading ? (
        <Skeleton aria-label="Loading audit logs...">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonItem key={i} size={16} style={{ marginBottom: '8px' }} />
          ))}
        </Skeleton>
      ) : events.length === 0 ? (
        <div className={styles.emptyState} role="status">
          <AppIcon name="clipboardTaskList" size={48} className={styles.emptyIcon} />
          <Text>No audit events recorded yet.</Text>
        </div>
      ) : (
        <table className={styles.table} aria-label="Audit log table">
          <thead>
            <tr>
              <th className={styles.th}>Timestamp</th>
              <th className={styles.th}>User</th>
              <th className={styles.th}>Action</th>
              <th className={styles.th}>Permission</th>
              <th className={styles.th}>Outcome</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.correlationId}>
                <td className={styles.td}>{event.timestamp}</td>
                <td className={styles.td}>{event.userId}</td>
                <td className={styles.td}>{event.actionName}</td>
                <td className={styles.td}>{event.permissionCode}</td>
                <td className={styles.td}>{event.outcome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
