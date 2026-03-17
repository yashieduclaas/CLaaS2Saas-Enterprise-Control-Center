// apps/web/src/features/role-management/components/RoleTable.tsx

import {
  makeStyles,
  tokens,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '@fluentui/react-components';
import type { RoleDto } from '@claas2saas/contracts/api';
import { RoleEmptyState } from './RoleEmptyState';

const useStyles = makeStyles({
  table: { width: '100%' },
  headerCell: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground2,
  },
  cell: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground1,
  },
});

export interface RoleTableProps {
  roles: RoleDto[];
  hasActiveSearch: boolean;
}

export function RoleTable({ roles, hasActiveSearch }: RoleTableProps) {
  const styles = useStyles();

  if (roles.length === 0) {
    return <RoleEmptyState hasActiveSearch={hasActiveSearch} />;
  }

  return (
    <Table className={styles.table} aria-label="Roles table">
      <TableHeader>
        <TableRow>
          <TableHeaderCell className={styles.headerCell}>Name</TableHeaderCell>
          <TableHeaderCell className={styles.headerCell}>Description</TableHeaderCell>
          <TableHeaderCell className={styles.headerCell}>CreatedAt</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {roles.map((role) => (
          <TableRow key={role.roleId}>
            <TableCell className={styles.cell}>{role.roleName}</TableCell>
            <TableCell className={styles.cell}>{role.roleCode}</TableCell>
            <TableCell className={styles.cell}>{role.createdAt}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
