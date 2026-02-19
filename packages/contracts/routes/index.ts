/**
 * Route contracts — aligns with frontend ROUTE_MAP.
 */

export type NavSection = 'monitoring' | 'security' | 'governance' | 'ecc' | 'none';

export interface RouteMapEntry {
  readonly path: string;
  readonly pageKey: string;
  readonly label: string;
  readonly icon: string;
  readonly navSection: NavSection;
  readonly requiredPermission: string | null;
  readonly showInNav: boolean;
  readonly breadcrumb: readonly string[];
}
