// apps/web/src/dev/DemoUserSwitcher.tsx
// Persona switcher for demo mode. Shown in TopBar right side.
// On switch: updates localStorage, invalidates all queries, reloads permissions.

import { makeStyles, tokens, Dropdown, Option, Text } from '@fluentui/react-components';
import { DEMO_USERS, useDemoAuth } from '@/auth/DemoAuthProvider';
import { usePermissionContext } from '@/rbac/PermissionContext';
import { queryClient } from '@/api/queryClient';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  label: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorStatusWarningForeground2,
    fontWeight: tokens.fontWeightSemibold,
  },
  dropdown: {
    minWidth: '220px',
  },
});

export function DemoUserSwitcher() {
  const styles = useStyles();
  const { activeUser, setActiveUser } = useDemoAuth();
  const { reload: reloadPermissions } = usePermissionContext();

  async function handlePersonaChange(email: string) {
    if (email === activeUser.email) return;
    setActiveUser(email);
    await queryClient.invalidateQueries();
    reloadPermissions();
  }

  return (
    <div className={styles.container}>
      <Text className={styles.label}>DEMO</Text>
      <Dropdown
        className={styles.dropdown}
        value={activeUser.displayName}
        selectedOptions={[activeUser.email]}
        onOptionSelect={(_: unknown, data: { optionValue?: string | undefined }) => {
          const val = data.optionValue;
          if (val != null && val !== '') {
            void handlePersonaChange(val);
          }
        }}
        aria-label="Switch demo persona"
        size="small"
      >
        {DEMO_USERS.map((user) => (
          <Option key={user.email} value={user.email} text={user.displayName}>
            {user.displayName}
          </Option>
        ))}
      </Dropdown>
    </div>
  );
}
