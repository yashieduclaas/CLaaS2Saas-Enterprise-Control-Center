// apps/web/src/features/role-management/components/AddSecurityRoleModal.tsx
// FEATURE COMPONENT — Add New Security Role modal.
//
// Props contract:
//   open      : controls visibility (fully controlled by parent)
//   onClose   : called when user cancels or closes
//   onCreated : called with the newly created SecurityRole after successful save
//
// This component:
//   - Owns only local form state (CreateSecurityRoleRequest)
//   - Delegates the API call to useCreateSecurityRole hook
//   - Never mutates parent state directly
//   - Never imports the service directly

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { makeStyles, tokens, Button, mergeClasses } from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';
import { useCreateSecurityRole } from '../hooks/useCreateSecurityRole';
import type { CreateSecurityRoleRequest, SecurityRole } from '../types/securityRole';

// ── Constants ─────────────────────────────────────────────────────────────────

const SOLUTION_OPTIONS = ['AIW', 'ADC', 'ACM', 'ELX', 'CLX'] as const;

const MODULE_OPTIONS: Record<string, string[]> = {
    AIW: ['KNL', 'AGNT_TLNT', 'AGNT_COLLAB', 'AGNT_SUPPORT'],
    ADC: ['AGNT_HR', 'AGNT_FIN', 'AGNT_ANALYTICS'],
    ACM: ['AGNT_CRCLH', 'COMP_AUDIT', 'COMP_POLICY', 'COMP_RISK'],
    ELX: ['ELX_CORE', 'ELX_REPORT'],
    CLX: ['CLX_CORE'],
};

const ROLE_CODE_OPTIONS = [
    'GLOBAL_ADMIN',
    'ADMIN',
    'CONTRIBUTOR',
    'VIEWER',
    'CUSTOM_ROLE_01',
    'CUSTOM_ROLE_02',
] as const;

const INITIAL_FORM: CreateSecurityRoleRequest = {
    solutionCode: '',
    moduleCode: '',
    roleCode: '',
    roleName: '',
    roleType: 'CUSTOM',
};

const MAX_ROLE_NAME_LENGTH = 100;

// ── Styles ────────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
    backdrop: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--color-overlay)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
    },
    modal: {
        backgroundColor: tokens.colorNeutralBackground1,
        borderRadius: tokens.borderRadiusXLarge,
        boxShadow: tokens.shadow64,
        width: '100%',
        maxWidth: '660px',
        minWidth: '340px',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100vh - 48px)',
    },
    // ── Header ──────────────────────────────────────────────────────────────────
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalXL}`,
        borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
        flexShrink: 0,
    },
    title: {
        fontSize: tokens.fontSizeBase500,
        fontWeight: tokens.fontWeightSemibold,
        color: 'var(--color-brand-primary)',
        margin: 0,
        padding: 0,
    },
    closeBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        border: 'none',
        background: 'transparent',
        borderRadius: tokens.borderRadiusMedium,
        cursor: 'pointer',
        color: tokens.colorNeutralForeground2,
        flexShrink: 0,
        ':hover': {
            backgroundColor: tokens.colorNeutralBackground3Hover,
            color: tokens.colorNeutralForeground1,
        },
    },
    // ── Scrollable body ──────────────────────────────────────────────────────────
    body: {
        overflowY: 'auto',
        padding: `${tokens.spacingVerticalXL} ${tokens.spacingHorizontalXL}`,
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalL,
    },
    // ── Grid layout ──────────────────────────────────────────────────────────────
    row: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: tokens.spacingHorizontalM,
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    // ── Labels ───────────────────────────────────────────────────────────────────
    label: {
        fontSize: tokens.fontSizeBase300,
        fontWeight: tokens.fontWeightSemibold,
        color: 'var(--color-brand-primary)',
    },
    // ── Inputs ───────────────────────────────────────────────────────────────────
    select: {
        height: '42px',
        paddingLeft: tokens.spacingHorizontalM,
        paddingRight: tokens.spacingHorizontalM,
        borderRadius: tokens.borderRadiusMedium,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        fontSize: tokens.fontSizeBase300,
        color: tokens.colorNeutralForeground1,
        backgroundColor: tokens.colorNeutralBackground1,
        width: '100%',
        boxSizing: 'border-box',
        cursor: 'pointer',
        fontFamily: 'inherit',
        appearance: 'auto',
        ':focus': {
            outline: `2px solid ${tokens.colorBrandStroke2Hover}`,
            outlineOffset: '0',
        },
        ':disabled': {
            backgroundColor: tokens.colorNeutralBackground3,
            color: tokens.colorNeutralForeground3,
            cursor: 'default',
        },
    },
    input: {
        height: '42px',
        paddingLeft: tokens.spacingHorizontalM,
        paddingRight: tokens.spacingHorizontalM,
        borderRadius: tokens.borderRadiusMedium,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        fontSize: tokens.fontSizeBase300,
        color: tokens.colorNeutralForeground1,
        backgroundColor: tokens.colorNeutralBackground1,
        width: '100%',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        ':focus': {
            outline: `2px solid ${tokens.colorBrandStroke2Hover}`,
            outlineOffset: '0',
        },
        '::placeholder': {
            color: tokens.colorNeutralForeground3,
        },
    },
    inputError: {
        borderTopColor: tokens.colorPaletteRedBorderActive,
        borderRightColor: tokens.colorPaletteRedBorderActive,
        borderBottomColor: tokens.colorPaletteRedBorderActive,
        borderLeftColor: tokens.colorPaletteRedBorderActive,
    },
    // ── Validation ───────────────────────────────────────────────────────────────
    errorText: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorPaletteRedForeground1,
        marginTop: '2px',
    },
    helperText: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3,
        marginTop: '2px',
    },
    // ── Footer ───────────────────────────────────────────────────────────────────
    footer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: tokens.spacingHorizontalM,
        padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalXL}`,
        borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
        flexShrink: 0,
    },
    // ── Save error ───────────────────────────────────────────────────────────────
    saveBanner: {
        fontSize: '13px',
        color: 'var(--color-danger-text)',
        padding: '8px 12px',
        backgroundColor: 'var(--color-error-bg)',
        borderRadius: tokens.borderRadiusMedium,
    },
});

// ── Validation ────────────────────────────────────────────────────────────────

type ValidationErrors = Partial<Record<keyof CreateSecurityRoleRequest, string>>;

const ROLE_CODE_PATTERN = /^[A-Z0-9_]+$/;

function validate(form: CreateSecurityRoleRequest): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!form.solutionCode) errors.solutionCode = 'Solution is required.';
    if (!form.moduleCode) errors.moduleCode = 'Module is required.';
    if (!form.roleCode) errors.roleCode = 'Role Code is required.';

    if (!form.roleName.trim()) {
        errors.roleName = 'Role Name is required.';
    } else if (form.roleName.length > MAX_ROLE_NAME_LENGTH) {
        errors.roleName = `Role Name must be ${MAX_ROLE_NAME_LENGTH} characters or fewer.`;
    }

    if (!form.roleType) {
        errors.roleType = 'Role Type is required.';
    }

    // roleCode uppercase-only guard (for freetext custom codes entered via keyboard)
    if (form.roleCode && !ROLE_CODE_PATTERN.test(form.roleCode)) {
        errors.roleCode = 'Role Code must be uppercase letters, numbers, and underscores only.';
    }

    return errors;
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface AddSecurityRoleModalProps {
    open: boolean;
    onClose: () => void;
    onCreated: (newRole: SecurityRole) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AddSecurityRoleModal({ open, onClose, onCreated }: AddSecurityRoleModalProps) {
    const styles = useStyles();
    const { create, loading } = useCreateSecurityRole();

    const [form, setForm] = useState<CreateSecurityRoleRequest>(INITIAL_FORM);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [saveError, setSaveError] = useState<string | null>(null);

    // Reset form every time the modal opens
    useEffect(() => {
        if (open) {
            setForm(INITIAL_FORM);
            setErrors({});
            setSaveError(null);
        }
    }, [open]);

    if (!open) return null;

    // ── Field helpers ──────────────────────────────────────────────────────────

    function set<K extends keyof CreateSecurityRoleRequest>(
        key: K,
        value: CreateSecurityRoleRequest[K],
    ) {
        setForm(prev => ({ ...prev, [key]: value }));
        // Clear the field-level error on change
        if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
    }

    const availableModules = MODULE_OPTIONS[form.solutionCode] ?? [];

    // ── Submit ─────────────────────────────────────────────────────────────────

    async function handleSubmit() {
        setSaveError(null);
        const validationErrors = validate(form);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            const newRole = await create(form);
            onCreated(newRole);
            onClose();
            // Form reset happens via the useEffect above when open → false → true
        } catch (err) {
            setSaveError(
                err instanceof Error ? err.message : 'Failed to create role. Please try again.',
            );
        }
    }

    // ── Render ─────────────────────────────────────────────────────────────────

    return createPortal(
        <div
            className={styles.backdrop}
            onClick={e => { if (e.target === e.currentTarget && !loading) onClose(); }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-role-title"
        >
            <div className={styles.modal}>

                {/* ── Header ── */}
                <div className={styles.header}>
                    <h2 id="add-role-title" className={styles.title}>
                        Add New Security Role
                    </h2>
                    <button
                        type="button"
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Close dialog"
                        disabled={loading}
                    >
                        <DismissRegular fontSize={18} />
                    </button>
                </div>

                {/* ── Scrollable body ── */}
                <div className={styles.body}>

                    {/* Save error banner */}
                    {saveError && (
                        <div role="alert" className={styles.saveBanner}>{saveError}</div>
                    )}

                    {/* Row 1: Solution + Module */}
                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="add-role-solution">
                                Solution <span aria-hidden>*</span>
                            </label>
                            <select
                                id="add-role-solution"
                                className={mergeClasses(styles.select, errors.solutionCode ? styles.inputError : undefined)}
                                value={form.solutionCode}
                                onChange={e => {
                                    set('solutionCode', e.target.value);
                                    // Clear module when solution changes
                                    if (form.moduleCode) set('moduleCode', '');
                                }}
                                disabled={loading}
                                aria-required="true"
                                aria-describedby={errors.solutionCode ? 'add-role-solution-error' : undefined}
                            >
                                <option value="">Select Solution</option>
                                {SOLUTION_OPTIONS.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                            {errors.solutionCode && (
                                <span id="add-role-solution-error" className={styles.errorText} role="alert">
                                    {errors.solutionCode}
                                </span>
                            )}
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="add-role-module">
                                Module <span aria-hidden>*</span>
                            </label>
                            <select
                                id="add-role-module"
                                className={mergeClasses(styles.select, errors.moduleCode ? styles.inputError : undefined)}
                                value={form.moduleCode}
                                onChange={e => set('moduleCode', e.target.value)}
                                disabled={loading || !form.solutionCode}
                                aria-required="true"
                                aria-describedby={errors.moduleCode ? 'add-role-module-error' : undefined}
                            >
                                <option value="">Select Module</option>
                                {availableModules.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                            {errors.moduleCode && (
                                <span id="add-role-module-error" className={styles.errorText} role="alert">
                                    {errors.moduleCode}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Row 2: Role Code + Role Name */}
                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="add-role-code">
                                Role Code <span aria-hidden>*</span>
                            </label>
                            <select
                                id="add-role-code"
                                className={mergeClasses(styles.select, errors.roleCode ? styles.inputError : undefined)}
                                value={form.roleCode}
                                onChange={e => set('roleCode', e.target.value)}
                                disabled={loading}
                                aria-required="true"
                                aria-describedby={
                                    errors.roleCode ? 'add-role-code-error' : 'add-role-code-hint'
                                }
                            >
                                <option value="">Select Role Code</option>
                                {ROLE_CODE_OPTIONS.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            {errors.roleCode ? (
                                <span id="add-role-code-error" className={styles.errorText} role="alert">
                                    {errors.roleCode}
                                </span>
                            ) : (
                                <span id="add-role-code-hint" className={styles.helperText}>
                                    Uppercase letters, numbers, underscores only
                                </span>
                            )}
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="add-role-name">
                                Role Name <span aria-hidden>*</span>
                            </label>
                            <input
                                id="add-role-name"
                                type="text"
                                className={mergeClasses(styles.input, errors.roleName ? styles.inputError : undefined)}
                                value={form.roleName}
                                onChange={e => set('roleName', e.target.value)}
                                placeholder="e.g., Administrator"
                                disabled={loading}
                                maxLength={MAX_ROLE_NAME_LENGTH + 10}
                                aria-required="true"
                                aria-describedby={errors.roleName ? 'add-role-name-error' : undefined}
                            />
                            {errors.roleName && (
                                <span id="add-role-name-error" className={styles.errorText} role="alert">
                                    {errors.roleName}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Row 3: Role Type (half-width) */}
                    <div className={styles.field} style={{ maxWidth: '280px' }}>
                        <label className={styles.label} htmlFor="add-role-type">
                            Role Type <span aria-hidden>*</span>
                        </label>
                        <select
                            id="add-role-type"
                            className={mergeClasses(styles.select, errors.roleType ? styles.inputError : undefined)}
                            value={form.roleType}
                            onChange={e => set('roleType', e.target.value as 'SYSTEM' | 'CUSTOM')}
                            disabled={loading}
                            aria-required="true"
                            aria-describedby={errors.roleType ? 'add-role-type-error' : undefined}
                        >
                            <option value="CUSTOM">Custom Role</option>
                            <option value="SYSTEM">System Role</option>
                        </select>
                        {errors.roleType && (
                            <span id="add-role-type-error" className={styles.errorText} role="alert">
                                {errors.roleType}
                            </span>
                        )}
                    </div>

                </div>{/* /body */}

                {/* ── Footer ── */}
                <div className={styles.footer}>
                    <Button
                        appearance="secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        appearance="primary"
                        onClick={() => void handleSubmit()}
                        disabled={loading}
                    >
                        {loading ? 'Creating…' : 'Add Role'}
                    </Button>
                </div>

            </div>
        </div>
        , document.body);
}
