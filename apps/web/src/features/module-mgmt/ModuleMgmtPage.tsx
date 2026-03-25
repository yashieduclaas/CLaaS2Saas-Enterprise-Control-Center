// apps/web/src/features/module-mgmt/ModuleMgmtPage.tsx
// Module Management System — static UI. Renders inside AppLayout.

import { useState } from 'react';
import { makeStyles, tokens, Text, Button } from '@fluentui/react-components';
import { usePermissionContext } from '@/rbac/PermissionContext';
import { PageSkeleton } from '@/app/PageSkeleton';
import { ModuleTable } from './components/ModuleTable';
import { AddModuleDialog } from './components/AddModuleDialog';
import type { ModuleRowData } from './components/ModuleRow';
import { useModules, useRegisterModule } from './api/useModules';

const SOLUTION_NAMES: Record<string, string> = {
  AESS: 'Agentic ERP & Shared Services',
  AIW: 'Agentic Intelligent Workplace',
  ADLT: 'Adaptive Learning & Talent',
  ACRM: 'Agentic CRM & Marketer',
};

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
  const { data: modules, isLoading: modulesLoading, isError: modulesError } = useModules();
  const registerModule = useRegisterModule();

  if (permLoading || modulesLoading) return <PageSkeleton />;

  const tableModules: ModuleRowData[] = (modules ?? []).map((module) => ({
    solutionCode: module.solutionCode,
    solutionName: SOLUTION_NAMES[module.solutionCode] ?? module.solutionCode,
    moduleCode: module.moduleCode,
    moduleName: module.moduleName,
    description: module.description,
    lead: '-',
    version: '-',
  }));

  const handleOpenDialog = () => setOpen(true);
  const handleCancel = () => setOpen(false);
  const handleAdd = async (payload: {
    solutionCode: string;
    moduleCode: string;
    moduleName: string;
    description: string;
    baseUrl: string;
  }) => {
    await registerModule.mutateAsync(payload);
    setOpen(false);
  };

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
          {modulesError && (
            <Text style={{ color: tokens.colorPaletteRedForeground1 }} role="alert">
              Failed to load modules. Please try again.
            </Text>
          )}
          {registerModule.isError && (
            <Text style={{ color: tokens.colorPaletteRedForeground1 }} role="alert">
              Failed to add module. It may already exist.
            </Text>
          )}
        </div>
        <Button appearance="primary" onClick={handleOpenDialog}>
          + Add New Module
        </Button>
      </div>

      <div className={styles.card}>
        <ModuleTable modules={tableModules} />
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
