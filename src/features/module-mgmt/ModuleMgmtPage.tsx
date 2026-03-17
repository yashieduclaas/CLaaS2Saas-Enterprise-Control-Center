// apps/web/src/features/module-mgmt/ModuleMgmtPage.tsx
// Module Management System — static UI. Renders inside AppLayout.

import { useState } from 'react';
import { makeStyles, tokens, Text, Button } from '@fluentui/react-components';
import { usePermissionContext } from '@/rbac/PermissionContext';
import { PageSkeleton } from '@/app/PageSkeleton';
import { ModuleTable } from './components/ModuleTable';
import { AddModuleDialog } from './components/AddModuleDialog';
import type { ModuleRowData } from './components/ModuleRow';

const STATIC_MODULES: ModuleRowData[] = [
  {
    solutionCode: 'AESS',
    solutionName: 'Agentic ERP & Shared Services',
    moduleCode: 'AESS',
    moduleName: 'Agentic ERP & Shared Services',
    description: 'ERP and shared services with AI-driven insights',
    lead: 'John Smith',
    version: 'v2.3.1',
  },
  {
    solutionCode: 'AIW',
    solutionName: 'Agentic Intelligent Workplace',
    moduleCode: 'AIW',
    moduleName: 'Agentic Intelligent Workplace',
    description: 'Intelligent workplace and collaboration',
    lead: 'Sarah Johnson',
    version: 'v1.5.0',
  },
  {
    solutionCode: 'ADLT',
    solutionName: 'Adaptive Learning & Talent',
    moduleCode: 'ADLT',
    moduleName: 'Adaptive Learning & Talent',
    description: 'Talent management and adaptive learning',
    lead: 'Michael Chen',
    version: 'v3.0.2',
  },
  {
    solutionCode: 'ACRM',
    solutionName: 'Agentic CRM & Marketer',
    moduleCode: 'ACRM',
    moduleName: 'Agentic CRM & Marketer',
    description: 'CRM and marketing automation',
    lead: 'Emily Davis',
    version: 'v2.1.0',
  },
];

const useStyles = makeStyles({
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    padding: tokens.spacingVerticalXL,
  },
  pageHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
  },
  titleSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  pageTitle: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  pageSubtitle: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground2,
  },
  card: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusLarge,
    boxShadow: tokens.shadow16,
    overflow: 'hidden',
  },
});

export function ModuleMgmtPage() {
  const styles = useStyles();
  const [open, setOpen] = useState(false);
  const { isLoading: permLoading } = usePermissionContext();

  if (permLoading) return <PageSkeleton />;

  const handleOpenDialog = () => setOpen(true);
  const handleCancel = () => setOpen(false);
  const handleAdd = () => setOpen(false);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.titleSection}>
          <Text as="h1" className={styles.pageTitle}>
            Module Management System
          </Text>
          <Text className={styles.pageSubtitle}>
            Manage your Solutions and Modules
          </Text>
        </div>
        <Button appearance="primary" onClick={handleOpenDialog}>
          + Add New Module
        </Button>
      </div>

      <div className={styles.card}>
        <ModuleTable modules={STATIC_MODULES} />
      </div>

      <AddModuleDialog
        open={open}
        onOpenChange={setOpen}
        onCancel={handleCancel}
        onAdd={handleAdd}
      />
    </div>
  );
}
