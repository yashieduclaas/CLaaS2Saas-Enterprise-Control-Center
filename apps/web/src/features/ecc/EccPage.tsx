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
  name: string;
  iconName: IconName;
}

const UNLOCKED_MODULES: EccModuleConfig[] = [
  { name: 'Kernel Apps', iconName: 'apps' },
];

const LOCKED_MODULES: EccModuleConfig[] = [
  { name: 'Agentic HR', iconName: 'peopleTeam' },
  { name: 'Agentic Talents', iconName: 'star' },
  { name: 'CLaaS Curriculum', iconName: 'book' },
  { name: 'CLaaS Developer', iconName: 'code' },
  { name: 'CLaaS Manager', iconName: 'grid' },
  { name: 'CLaaS Mentor', iconName: 'hatGraduation' },
  { name: 'Agentic SOP', iconName: 'clipboardBulletList' },
  { name: 'Agentic Sales', iconName: 'dataBarVertical' },
  { name: 'Agentic Finance', iconName: 'money' },
  { name: 'Agentic Procurement', iconName: 'cart' },
  { name: 'Agentic Marketer', iconName: 'megaphone' },
];

export function EccPage() {
  const styles = useStyles();
  const navigate = useNavigate();
  const { isLoading: permLoading } = usePermissionContext();

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
            key={mod.name}
            icon={<AppIcon name={mod.iconName} size={48} />}
            name={mod.name}
            isLocked={false}
            onClick={() => navigate(getRoutePath('kernel-dashboard'))}
          />
        ))}
      </EccSection>

      <EccSection icon={<AppIcon name="lock" size={20} />} title="Locked">
        {LOCKED_MODULES.map((mod) => (
          <LockedModuleCard key={mod.name} config={mod} />
        ))}
      </EccSection>
    </div>
  );
}

function LockedModuleCard({ config }: { config: EccModuleConfig }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <EccModuleCard
        icon={<AppIcon name={config.iconName} size={48} />}
        name={config.name}
        isLocked
        onClick={() => setOpen(true)}
      />
      <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Access Restricted</DialogTitle>
            <DialogContent>
              You do not have permission to access {config.name}. Contact your administrator to
              request access.
            </DialogContent>
            <DialogActions>
              <Button appearance="primary" onClick={() => setOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
}
