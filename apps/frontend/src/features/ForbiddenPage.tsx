import { makeStyles, tokens, Text, Button } from '@fluentui/react-components';
import { AppIcon } from '@/components/AppIcon';
import { useNavigate } from 'react-router-dom';
import { getRoutePath } from '@/rbac/RoutePermissionMap';

const useStyles = makeStyles({
  page: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalL,
    minHeight: '400px',
    color: tokens.colorNeutralForeground2,
  },
  icon: { fontSize: '64px', color: tokens.colorNeutralForeground3 },
  title: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightSemibold,
  },
  description: { color: tokens.colorNeutralForeground3, textAlign: 'center' as const },
});

export function ForbiddenPage() {
  const styles = useStyles();
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <AppIcon name="lock" size={64} className={styles.icon} />
      <Text as="h1" className={styles.title}>Access Denied</Text>
      <Text className={styles.description}>
        You do not have permission to view this page.
        Contact your Security Administrator to request access.
      </Text>
      <Button appearance="primary" onClick={() => navigate(getRoutePath('kernel-dashboard'))}>
        Go to Dashboard
      </Button>
    </div>
  );
}
