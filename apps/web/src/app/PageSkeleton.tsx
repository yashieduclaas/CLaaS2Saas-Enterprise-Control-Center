// apps/web/src/app/PageSkeleton.tsx
// PLATFORM FILE — FROZEN.
// Full-page loading skeleton.

import { makeStyles, tokens, Skeleton, SkeletonItem } from '@fluentui/react-components';

const useStyles = makeStyles({
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    padding: tokens.spacingVerticalXL,
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
});

export function PageSkeleton() {
  const styles = useStyles();

  return (
    <Skeleton aria-label="Loading page content...">
      <div className={styles.page}>
        <div className={styles.header}>
          <SkeletonItem size={28} style={{ width: '240px' }} />
          <SkeletonItem size={16} style={{ width: '360px' }} />
        </div>
        <div className={styles.content}>
          {Array.from({ length: 6 }).map((_, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <SkeletonItem key={i} size={16} />
          ))}
        </div>
      </div>
    </Skeleton>
  );
}
