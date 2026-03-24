// apps/web/src/features/ecc/EccPage.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  makeStyles,
  tokens,
  Text,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
  Button,
} from '@fluentui/react-components';
import { AppIcon, type IconName } from '@/components/AppIcon';
import { usePermissionContext } from '@/rbac/PermissionContext';
import { PageSkeleton } from '@/app/PageSkeleton';
import { getRoutePath } from '@/rbac/RoutePermissionMap';
import { EccSection } from './components/EccSection';
import { EccModuleCard } from './components/EccModuleCard';

const useStyles = makeStyles({
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXL,
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: tokens.spacingVerticalS,
  },
  pageTitle: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorNeutralForeground1,
  },
  subtitle: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground3,
  },
});

interface EccModuleConfig {
  id: string;
  name: string;
  iconName: IconName;
}

const UNLOCKED_MODULES: EccModuleConfig[] = [
  { id: 'kernel-apps', name: 'Kernel Apps', iconName: 'apps' },
];

const LOCKED_MODULES: EccModuleConfig[] = [
  { id: 'aess', name: 'Agentic ERP & Shared Services', iconName: 'peopleTeam' },
  { id: 'aiw', name: 'Agentic Intelligent Workplace', iconName: 'grid' },
  { id: 'adlt', name: 'Adaptive Learning & Talent', iconName: 'star' },
  { id: 'acrm', name: 'Agentic CRM & Marketer', iconName: 'megaphone' },
];

export function EccPage() {
  const styles = useStyles();
  const navigate = useNavigate();
  const { isLoading: permLoading } = usePermissionContext();
  const [restrictedApp, setRestrictedApp] = useState<{ id: string; name: string } | null>(null);

  const handleLockedAppClick = (id: string, name: string) => {
    setRestrictedApp({ id, name });
  };

  const handleRequestAccess = () => {
    if (!restrictedApp) return;

    setRestrictedApp(null);
    navigate(getRoutePath('access-request'), {
      state: { appId: restrictedApp.id, appName: restrictedApp.name },
    });
  };

  if (permLoading) return <PageSkeleton />;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Text as="h1" className={styles.pageTitle}>
          Enterprise Control Centre
        </Text>
        <Text className={styles.subtitle}>
          Select a module to access its features. Locked modules require additional permissions.
        </Text>
      </header>

      <EccSection icon={<AppIcon name="unlock" size={20} />} title="Unlocked">
        {UNLOCKED_MODULES.map((mod) => (
          <EccModuleCard
            key={mod.id}
            icon={<AppIcon name={mod.iconName} size={48} />}
            name={mod.name}
            isLocked={false}
            onClick={() => navigate(getRoutePath('kernel-dashboard'))}
          />
        ))}
      </EccSection>

      <EccSection icon={<AppIcon name="lock" size={20} />} title="Locked">
        {LOCKED_MODULES.map((mod) => (
          <EccModuleCard
            key={mod.id}
            icon={<AppIcon name={mod.iconName} size={48} />}
            name={mod.name}
            isLocked
            onClick={() => handleLockedAppClick(mod.id, mod.name)}
          />
        ))}
      </EccSection>

      <Dialog open={!!restrictedApp} onOpenChange={(_, data) => !data.open && setRestrictedApp(null)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Access Restricted</DialogTitle>
            <DialogContent>
              You do not have access to this application.
              Do you want to request access from the administrator?
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setRestrictedApp(null)}>
                Cancel
              </Button>
              <Button appearance="primary" onClick={handleRequestAccess}>
                Yes, Request Access
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
}
