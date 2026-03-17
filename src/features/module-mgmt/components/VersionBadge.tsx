// apps/web/src/features/module-mgmt/components/VersionBadge.tsx

import { makeStyles, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    paddingLeft: tokens.spacingHorizontalS,
    paddingRight: tokens.spacingHorizontalS,
    paddingTop: tokens.spacingVerticalXS,
    paddingBottom: tokens.spacingVerticalXS,
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: tokens.colorPaletteYellowBackground2,
    color: tokens.colorNeutralForeground1,
    fontSize: tokens.fontSizeBase200,
  },
});

export interface VersionBadgeProps {
  version: string;
}

export function VersionBadge({ version }: VersionBadgeProps) {
  const styles = useStyles();
  return <span className={styles.badge}>{version}</span>;
}
