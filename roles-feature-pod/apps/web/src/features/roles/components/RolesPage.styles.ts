// apps/web/src/features/roles/components/RolesPage.styles.ts
// Griffel styles for RolesPage.
// Rules: Fluent tokens only. No hardcoded values. No inline styles (none needed here).

import { makeStyles, tokens } from "@fluentui/react-components";

export const useRolesPageStyles = makeStyles({
  // ── Page shell ────────────────────────────────────────────────────────────
  root: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalL,
  },

  // ── Page header ───────────────────────────────────────────────────────────
  header: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
  },

  pageTitle: {
    fontSize: tokens.fontSizeBase600,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    lineHeight: tokens.lineHeightBase600,
    margin: "0",
  },

  pageSubtitle: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground2,
    margin: "0",
  },

  // ── Table container ───────────────────────────────────────────────────────
  tableContainer: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    overflow: "hidden",
  },

  // ── Loading skeleton rows ─────────────────────────────────────────────────
  skeletonRow: {
    display: "flex",
    gap: tokens.spacingHorizontalM,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },

  // ── Empty state ───────────────────────────────────────────────────────────
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingVerticalXXL,
    color: tokens.colorNeutralForeground3,
    textAlign: "center",
  },

  emptyStateIcon: {
    fontSize: tokens.fontSizeBase600,
    color: tokens.colorNeutralForeground4,
  },

  emptyStateTitle: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground2,
    margin: "0",
  },

  emptyStateBody: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground3,
    margin: "0",
  },

  // ── Error state ───────────────────────────────────────────────────────────
  errorState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingVerticalXXL,
    textAlign: "center",
  },

  errorTitle: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorStatusDangerForeground1,
    margin: "0",
  },

  errorBody: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground2,
    margin: "0",
  },

  // ── Table cells ───────────────────────────────────────────────────────────
  systemRoleBadge: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase200,
  },

  dateCell: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
});
