// apps/web/src/features/module-mgmt/components/ModuleTable.tsx

import { makeStyles, tokens } from '@fluentui/react-components';
import { ModuleRow, type ModuleRowData } from './ModuleRow';

const useStyles = makeStyles({
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  headerRow: {
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  headerCell: {
    padding: tokens.spacingVerticalM,
    paddingLeft: tokens.spacingHorizontalM,
    paddingRight: tokens.spacingHorizontalM,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    textAlign: 'left',
    verticalAlign: 'middle',
  },
});

export interface ModuleTableProps {
  modules: ModuleRowData[];
}

export function ModuleTable({ modules }: ModuleTableProps) {
  const styles = useStyles();

  return (
    <table className={styles.table} aria-label="Module management table">
      <thead>
        <tr className={styles.headerRow}>
          <th className={styles.headerCell}>Solution Code</th>
          <th className={styles.headerCell}>Solution Name</th>
          <th className={styles.headerCell}>Module Code</th>
          <th className={styles.headerCell}>Module Name</th>
          <th className={styles.headerCell}>Description</th>
          <th className={styles.headerCell}>Module Lead</th>
          <th className={styles.headerCell}>Version</th>
          <th className={styles.headerCell}>Documentation</th>
          <th className={styles.headerCell}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {modules.map((module, index) => (
          <ModuleRow key={`${module.solutionCode}-${module.moduleCode}-${index}`} data={module} />
        ))}
      </tbody>
    </table>
  );
}
