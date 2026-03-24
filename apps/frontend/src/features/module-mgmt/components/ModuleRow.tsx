// apps/web/src/features/module-mgmt/components/ModuleRow.tsx

import { makeStyles, tokens } from '@fluentui/react-components';
import { EditRegular, DeleteRegular, OpenRegular } from '@fluentui/react-icons';
import { VersionBadge } from './VersionBadge';

export interface ModuleRowData {
  solutionCode: string;
  solutionName: string;
  moduleCode: string;
  moduleName: string;
  description: string;
  lead: string;
  version: string;
}

const useStyles = makeStyles({
  row: {
    height: '52px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  cell: {
    padding: tokens.spacingVerticalM,
    paddingLeft: tokens.spacingHorizontalM,
    paddingRight: tokens.spacingHorizontalM,
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground1,
    verticalAlign: 'middle',
  },
  solutionCodeBadge: {
    display: 'inline-flex',
    paddingLeft: tokens.spacingHorizontalS,
    paddingRight: tokens.spacingHorizontalS,
    paddingTop: tokens.spacingVerticalXS,
    paddingBottom: tokens.spacingVerticalXS,
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground1,
    fontSize: tokens.fontSizeBase200,
  },
  moduleCodeBadge: {
    display: 'inline-flex',
    paddingLeft: tokens.spacingHorizontalS,
    paddingRight: tokens.spacingHorizontalS,
    paddingTop: tokens.spacingVerticalXS,
    paddingBottom: tokens.spacingVerticalXS,
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
    fontSize: tokens.fontSizeBase200,
  },
  leadLink: {
    border: 'none',
    background: 'transparent',
    padding: 0,
    font: 'inherit',
    color: tokens.colorBrandForeground1,
    cursor: 'pointer',
    textDecoration: 'none',
  },
  docLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    border: 'none',
    background: 'transparent',
    padding: 0,
    font: 'inherit',
    color: tokens.colorBrandForeground1,
    cursor: 'pointer',
    textDecoration: 'none',
    fontSize: tokens.fontSizeBase300,
  },
  actionsCell: {
    display: 'flex',
    gap: tokens.spacingHorizontalXS,
  },
  iconButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: tokens.borderRadiusMedium,
    border: 'none',
    background: 'transparent',
    color: tokens.colorNeutralForeground1,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      color: tokens.colorNeutralForeground1Hover,
    },
  },
});

export interface ModuleRowProps {
  data: ModuleRowData;
  onEdit?: (data: ModuleRowData) => void;
  onDelete?: (data: ModuleRowData) => void;
}

export function ModuleRow({ data, onEdit, onDelete }: ModuleRowProps) {
  const styles = useStyles();

  const handleEdit = () => {
    onEdit?.(data);
    console.log('Edit clicked', data);
  };

  const handleDelete = () => {
    onDelete?.(data);
    console.log('Delete clicked', data);
  };

  return (
    <tr className={styles.row}>
      <td className={styles.cell}>
        <span className={styles.solutionCodeBadge}>{data.solutionCode}</span>
      </td>
      <td className={styles.cell}>{data.solutionName}</td>
      <td className={styles.cell}>
        <span className={styles.moduleCodeBadge}>{data.moduleCode}</span>
      </td>
      <td className={styles.cell}>{data.moduleName}</td>
      <td className={styles.cell}>{data.description}</td>
      <td className={styles.cell}>
        <button type="button" className={styles.leadLink} onClick={() => console.log('Lead clicked', data.lead)}>
          {data.lead}
        </button>
      </td>
      <td className={styles.cell}>
        <VersionBadge version={data.version} />
      </td>
      <td className={styles.cell}>
        <button type="button" className={styles.docLink} onClick={() => console.log('Documentation View clicked', data.moduleCode)}>
          View <OpenRegular fontSize={14} />
        </button>
      </td>
      <td className={styles.cell}>
        <div className={styles.actionsCell}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={handleEdit}
            aria-label="Edit"
          >
            <EditRegular fontSize={16} />
          </button>
          <button
            type="button"
            className={styles.iconButton}
            onClick={handleDelete}
            aria-label="Delete"
          >
            <DeleteRegular fontSize={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}
