import { makeStyles, tokens, Text } from '@fluentui/react-components';

const useStyles = makeStyles({
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  title: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  placeholder: {
    padding: tokens.spacingVerticalXL,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    color: tokens.colorNeutralForeground3,
    textAlign: 'center' as const,
  },
});

interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  const styles = useStyles();
  return (
    <div className={styles.page}>
      <Text as="h1" className={styles.title}>{title}</Text>
      <div className={styles.placeholder}>
        <Text>{title} - feature pod not yet promoted to main.</Text>
      </div>
    </div>
  );
}
