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
    solutionCode: 'ADC',
    solutionName: 'Adaptive CLaaS',
    moduleCode: 'AGNT_HR',
    moduleName: 'Agentic HR',
    description: 'Human resources management with AI-driven insights',
    lead: 'John Smith',
    version: 'v2.3.1',
  },
  {
    solutionCode: 'AIW',
    solutionName: 'Agentic Intelligent Workplace',
    moduleCode: 'AGNT_TLNT',
    moduleName: 'Agentic Talents',
    description: 'Talent management and workforce intelligence',
    lead: 'Sarah Johnson',
    version: 'v1.5.0',
  },
  {
    solutionCode: 'ACM',
    solutionName: 'Adaptive Compliance Manager',
    moduleCode: 'COMP_AUDIT',
    moduleName: 'Compliance Audit',
    description: 'Automated compliance auditing and reporting',
    lead: 'Michael Chen',
    version: 'v3.0.2',
  },
  {
    solutionCode: 'ADC',
    solutionName: 'Adaptive CLaaS',
    moduleCode: 'AGNT_FIN',
    moduleName: 'Agentic Finance',
    description: 'Financial operations and forecasting with AI',
    lead: 'Emily Davis',
    version: 'v2.1.0',
  },
  {
    solutionCode: 'AIW',
    solutionName: 'Agentic Intelligent Workplace',
    moduleCode: 'AGNT_COLLAB',
    moduleName: 'Agentic Collaborate',
    description: 'Team collaboration and project management',
    lead: 'James Wilson',
    version: 'v1.8.3',
  },
  {
    solutionCode: 'ACM',
    solutionName: 'Adaptive Compliance Manager',
    moduleCode: 'COMP_POLICY',
    moduleName: 'Policy Engine',
    description: 'Policy management and enforcement workflows',
    lead: 'Lisa Martinez',
    version: 'v2.5.1',
  },
  {
    solutionCode: 'ADC',
    solutionName: 'Adaptive CLaaS',
    moduleCode: 'AGNT_ANALYTICS',
    moduleName: 'Agentic Analytics',
    description: 'Business intelligence and predictive analytics',
    lead: 'Robert Taylor',
    version: 'v1.2.0',
  },
  {
    solutionCode: 'AIW',
    solutionName: 'Agentic Intelligent Workplace',
    moduleCode: 'AGNT_SUPPORT',
    moduleName: 'Agentic Support',
    description: 'AI-powered customer support and ticketing',
    lead: 'Jennifer Brown',
    version: 'v2.0.4',
  },
  {
    solutionCode: 'ACM',
    solutionName: 'Adaptive Compliance Manager',
    moduleCode: 'COMP_RISK',
    moduleName: 'Risk Assessment',
    description: 'Risk identification and mitigation tracking',
    lead: 'David Anderson',
    version: 'v1.9.0',
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
