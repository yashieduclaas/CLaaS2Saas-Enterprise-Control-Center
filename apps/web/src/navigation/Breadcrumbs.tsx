// apps/web/src/navigation/Breadcrumbs.tsx

import { makeStyles, tokens, Breadcrumb, BreadcrumbItem, BreadcrumbDivider } from '@fluentui/react-components';
import { useLocation } from 'react-router-dom';
import { ROUTE_MAP } from '@/rbac/RoutePermissionMap';

const useStyles = makeStyles({
  breadcrumb: {
    padding: `${tokens.spacingVerticalXS} 0`,
  },
});

export function Breadcrumbs() {
  const styles = useStyles();
  const { pathname } = useLocation();

  const entry = ROUTE_MAP.find((r) => r.path === pathname || pathname.startsWith(r.path + '/'));
  const crumbs = entry?.breadcrumb ?? [];

  if (crumbs.length === 0) return null;

  return (
    <Breadcrumb className={styles.breadcrumb} aria-label="Breadcrumb navigation">
      {crumbs.map((crumb, idx) => (
        <span key={crumb} style={{ display: 'flex', alignItems: 'center' }}>
          {idx > 0 && <BreadcrumbDivider />}
          <BreadcrumbItem
            aria-current={idx === crumbs.length - 1 ? 'page' : undefined}
            style={{
              color: idx === crumbs.length - 1
                ? tokens.colorNeutralForeground1
                : tokens.colorNeutralForeground3,
              fontSize: tokens.fontSizeBase200,
            }}
          >
            {crumb}
          </BreadcrumbItem>
        </span>
      ))}
    </Breadcrumb>
  );
}
