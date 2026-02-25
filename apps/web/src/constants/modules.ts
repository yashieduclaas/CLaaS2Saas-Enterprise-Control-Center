// apps/web/src/constants/modules.ts
// Canonical module code -> display name mapping.
// Source of truth for UI labels.

export const MODULES = {
  AESS: { code: 'AESS', name: 'Agentic ERP & Shared Services' },
  AIW: { code: 'AIW', name: 'Agentic Intelligent Workplace' },
  ADLT: { code: 'ADLT', name: 'Adaptive Learning & Talent' },
  ACRM: { code: 'ACRM', name: 'Agentic CRM & Marketer' },
} as const;

export type ModuleCode = keyof typeof MODULES;

export function getModuleName(code: string): string {
  return MODULES[code as ModuleCode]?.name ?? code;
}
