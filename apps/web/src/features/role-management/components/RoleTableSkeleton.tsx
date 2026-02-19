import { makeStyles, tokens, Skeleton, SkeletonItem } from '@fluentui/react-components';

const useStyles = makeStyles({
  container: { display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXS },
  headerRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr 80px',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr 80px',
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke3}`,
  },
});

const SKELETON_ROW_COUNT = 8;

export function RoleTableSkeleton() {
  const styles = useStyles();

  return (
    <Skeleton aria-label="Loading roles...">
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <SkeletonItem size={16} />
          <SkeletonItem size={16} />
          <SkeletonItem size={16} />
          <SkeletonItem size={16} />
          <SkeletonItem size={16} />
          <SkeletonItem size={16} />
        </div>
        {Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
          <div key={i} className={styles.row}>
            <SkeletonItem size={16} />
            <SkeletonItem size={16} />
            <SkeletonItem size={16} />
            <SkeletonItem size={16} />
            <SkeletonItem size={16} />
            <SkeletonItem size={16} style={{ width: '60px' }} />
          </div>
        ))}
      </div>
    </Skeleton>
  );
}
