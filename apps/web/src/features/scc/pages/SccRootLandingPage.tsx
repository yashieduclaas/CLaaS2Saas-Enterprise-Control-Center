// features/scc/pages/SccRootLandingPage.tsx
// SCC Root — AI Welcome Landing page. Renders at /scc.
// Uses platinum beige background via AppLayout. No analytics widgets.

import { makeStyles, tokens, Input, Text } from '@fluentui/react-components';
import { SearchRegular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  page: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
    padding: tokens.spacingVerticalXXL,
    gap: tokens.spacingVerticalXL,
  },
  heading: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightBold,
    color: tokens.colorNeutralForeground1,
    textAlign: 'center',
    margin: 0,
  },
  searchWrap: {
    width: '100%',
    maxWidth: '480px',
  },
  searchInput: {
    width: '100%',
    borderRadius: tokens.borderRadiusCircular,
  },
});

export function SccRootLandingPage() {
  const styles = useStyles();

  return (
    <div className={styles.page} id="scc-root-landing">
      <Text as="h1" className={styles.heading}>
        Welcome, how can I help?
      </Text>
      <div className={styles.searchWrap}>
        <Input
          className={styles.searchInput}
          placeholder="Describe your task to open the right feature"
          contentBefore={<SearchRegular fontSize={20} />}
          appearance="filled-darker"
          aria-label="Describe your task"
        />
      </div>
    </div>
  );
}
