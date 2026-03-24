import { makeStyles, tokens, Title3, Body1 } from '@fluentui/react-components';
import { AppIcon } from '@/components/AppIcon';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacingVerticalXXL,
    gap: tokens.spacingVerticalM,
    minHeight: '240px',
  },
  icon: { fontSize: '48px', color: tokens.colorNeutralForeground3 },
  title: { color: tokens.colorNeutralForeground2 },
  description: { textAlign: 'center', maxWidth: '400px', color: tokens.colorNeutralForeground3 },
});

interface RoleEmptyStateProps {
  hasActiveSearch: boolean;
}

export function RoleEmptyState({ hasActiveSearch }: RoleEmptyStateProps) {
  const styles = useStyles();

  return (
    <div className={styles.container} role="status" aria-live="polite">
      <AppIcon name="shieldTask" size={48} className={styles.icon} />
      <Title3 className={styles.title}>
        {hasActiveSearch ? 'No matching roles' : 'No roles defined'}
      </Title3>
      <Body1 className={styles.description}>
        {hasActiveSearch
          ? 'No roles match your search. Try a different term or clear the filter.'
          : 'No roles have been created for this tenant. Contact your Security Administrator to create roles.'}
      </Body1>
    </div>
  );
}
