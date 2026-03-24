import { useState } from 'react';
import { makeStyles, tokens, Text, Button } from '@fluentui/react-components';
import { AppIcon } from '@/components/AppIcon';

const DISMISSED_KEY = 'demo-banner-dismissed';

const useStyles = makeStyles({
  banner: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM}`,
    backgroundColor: tokens.colorStatusWarningBackground2,
    color: tokens.colorStatusWarningForeground2,
    borderBottom: `1px solid ${tokens.colorStatusWarningBorderActive}`,
    flexShrink: 0,
    zIndex: 1000,
  },
  icon: { flexShrink: 0, fontSize: '16px' },
  text: {
    flex: 1,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
  },
  dismissButton: {
    color: tokens.colorStatusWarningForeground2,
    minWidth: 'unset',
  },
});

export function DemoModeBanner() {
  const styles = useStyles();
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(DISMISSED_KEY) === 'true');
  if (dismissed) return null;

  return (
    <div className={styles.banner} role="alert" aria-live="polite">
      <AppIcon name="warning" size={16} className={styles.icon} />
      <Text className={styles.text}>Demo Mode - Using simulated identity. Entra authentication is not active.</Text>
      <Button
        className={styles.dismissButton}
        appearance="transparent"
        size="small"
        icon={<AppIcon name="dismiss" size={16} />}
        aria-label="Dismiss demo mode warning"
        onClick={() => {
          sessionStorage.setItem(DISMISSED_KEY, 'true');
          setDismissed(true);
        }}
      />
    </div>
  );
}
