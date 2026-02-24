// apps/web/src/features/user-role-assign/components/EditRoleAssignmentModal.tsx
// FEATURE COMPONENT — Edit Role Assignment modal.
//
// Props contract:
//   open        : controls visibility
//   assignment  : the record to edit (null = nothing to show)
//   onClose     : called when user cancels or closes
//   onUpdated   : called with the updated record after successful save
//
// This component:
//   - Owns only local form state (form: UpdateRoleAssignmentRequest | null)
//   - Delegates the API call to useEditRoleAssignment hook
//   - Never fetches its own data list
//   - Never directly imports the service

import { useState, useEffect } from 'react';
import { makeStyles, tokens, Button, mergeClasses } from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';
import { useEditRoleAssignment } from '../hooks/useEditRoleAssignment';
import type { UserRoleAssignment, UpdateRoleAssignmentRequest } from '../types/security';

// ── Constants ─────────────────────────────────────────────────────────────────

const SOLUTION_OPTIONS = ['AIW', 'ADC', 'ACM', 'ELX', 'CLX'] as const;
const MODULE_OPTIONS: Record<string, string[]> = {
    AIW: ['KNL', 'AGNT_TLNT', 'AGNT_COLLAB', 'AGNT_SUPPORT'],
    ADC: ['AGNT_HR', 'AGNT_FIN', 'AGNT_ANALYTICS'],
    ACM: ['AGNT_CRCLH', 'COMP_AUDIT', 'COMP_POLICY', 'COMP_RISK'],
    ELX: ['ELX_CORE', 'ELX_REPORT'],
    CLX: ['CLX_CORE'],
};
const ROLE_OPTIONS = [
    { code: 'GLOBAL_ADMIN', label: 'Global Administrator' },
    { code: 'ADMIN', label: 'Administrator' },
    { code: 'CONTRIBUTOR', label: 'Contributor' },
    { code: 'VIEWER', label: 'Viewer' },
] as const;
const MAX_REASON_LENGTH = 255;

// ── Date utility ──────────────────────────────────────────────────────────────

function formatDisplayDate(iso: string): string {
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
    }).format(new Date(iso));
}

// ── Styles ────────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
    // Overlay
    backdrop: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--color-overlay)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '40px',
        paddingBottom: '40px',
        zIndex: 1000,
        overflowY: 'auto',
    },
    // Modal shell
    modal: {
        backgroundColor: tokens.colorNeutralBackground1,
        borderRadius: tokens.borderRadiusXLarge,
        boxShadow: tokens.shadow64,
        width: '100%',
        maxWidth: '660px',
        minWidth: '340px',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100vh - 80px)',
        position: 'relative',
        margin: '0 16px',
    },
    // Header
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
    // Scrollable body
    body: {
        overflowY: 'auto',
        padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalXL}`,
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalL,
    },
    // Form layout
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
    fieldFull: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        gridColumn: '1 / -1',
    },
    label: {
        fontSize: tokens.fontSizeBase300,
        fontWeight: tokens.fontWeightSemibold,
        color: 'var(--color-brand-primary)',
    },
    labelOptional: {
        fontWeight: tokens.fontWeightRegular,
        color: tokens.colorNeutralForeground3,
        fontSize: tokens.fontSizeBase200,
        marginLeft: '4px',
    },
    // Inputs
    input: {
        height: '38px',
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
    },
    inputReadonly: {
        backgroundColor: tokens.colorNeutralBackground3,
        color: tokens.colorNeutralForeground3,
        cursor: 'default',
    },
    select: {
        height: '38px',
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
    textarea: {
        padding: tokens.spacingHorizontalM,
        borderRadius: tokens.borderRadiusMedium,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        fontSize: tokens.fontSizeBase300,
        color: tokens.colorNeutralForeground1,
        backgroundColor: tokens.colorNeutralBackground1,
        width: '100%',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
        resize: 'vertical',
        minHeight: '88px',
        ':focus': {
            outline: `2px solid ${tokens.colorBrandStroke2Hover}`,
            outlineOffset: '0',
        },
    },
    charCounter: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3,
        textAlign: 'right',
        marginTop: '2px',
    },
    charCounterOver: {
        color: tokens.colorPaletteRedForeground1,
    },
    helperText: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3,
        marginTop: '2px',
    },
    // Assigned By block
    assignedByBlock: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
    },
    assignedByEmail: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3,
    },
    // Validation errors
    errorText: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorPaletteRedForeground1,
        marginTop: '2px',
    },
    inputError: {
        borderTopColor: tokens.colorPaletteRedBorderActive,
        borderRightColor: tokens.colorPaletteRedBorderActive,
        borderBottomColor: tokens.colorPaletteRedBorderActive,
        borderLeftColor: tokens.colorPaletteRedBorderActive,
    },
    // Footer
    footer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: tokens.spacingHorizontalM,
        padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalXL}`,
        borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
        flexShrink: 0,
    },
});

// ── Validation ────────────────────────────────────────────────────────────────

interface ValidationErrors {
    solutionCode?: string;
    moduleCode?: string;
    roleCode?: string;
    status?: string;
    reason?: string;
    disableDate?: string;
}

function validate(
    form: UpdateRoleAssignmentRequest,
    assignedDate: string,
): ValidationErrors {
    const errors: ValidationErrors = {};
    if (!form.solutionCode) errors.solutionCode = 'Solution is required.';
    if (!form.moduleCode) errors.moduleCode = 'Module is required.';
    if (!form.roleCode) errors.roleCode = 'Security Role is required.';
    if (!form.status) errors.status = 'Status is required.';
    if (!form.reason.trim()) {
        errors.reason = 'Reason for Assignment is required.';
    } else if (form.reason.length > MAX_REASON_LENGTH) {
        errors.reason = `Reason must be ${MAX_REASON_LENGTH} characters or fewer.`;
    }
    if (form.disableDate) {
        if (new Date(form.disableDate) <= new Date(assignedDate)) {
            errors.disableDate = 'Disable Date must be after the Assignment Date.';
        }
    }
    return errors;
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface EditRoleAssignmentModalProps {
    open: boolean;
    assignment: UserRoleAssignment | null;
    onClose: () => void;
    onUpdated: (updated: UserRoleAssignment) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function EditRoleAssignmentModal({
    open,
    assignment,
    onClose,
    onUpdated,
}: EditRoleAssignmentModalProps) {
    const styles = useStyles();
    const { save, loading } = useEditRoleAssignment();

    const [form, setForm] = useState<UpdateRoleAssignmentRequest | null>(null);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [saveError, setSaveError] = useState<string | null>(null);

    // Sync form state when assignment changes
    useEffect(() => {
        if (assignment) {
            setForm({
                id: assignment.id,
                solutionCode: assignment.solutionCode,
                moduleCode: assignment.moduleCode,
                roleCode: assignment.roleCode,
                status: assignment.status,
                disableDate: assignment.disableDate ?? null,
                reason: assignment.reason,
            });
            setErrors({});
            setSaveError(null);
        }
    }, [assignment]);

    if (!open || !assignment || !form) return null;

    // ── Field helpers ──────────────────────────────────────────────────────────

    function set<K extends keyof UpdateRoleAssignmentRequest>(
        key: K,
        value: UpdateRoleAssignmentRequest[K],
    ) {
        setForm(prev => prev ? { ...prev, [key]: value } : prev);
        // Clear field error on change
        if (errors[key as keyof ValidationErrors]) {
            setErrors(prev => ({ ...prev, [key]: undefined }));
        }
    }

    // Modules available for the selected solution
    const availableModules = MODULE_OPTIONS[form.solutionCode] ?? [];

    // ── Submit ─────────────────────────────────────────────────────────────────

    async function handleSave() {
        setSaveError(null);
        // Capture non-null locals — the early return above (line 332) guarantees
        // both form and assignment are truthy here, but TS can't narrow through
        // inner async functions, so we re-assert.
        const currentForm = form;
        const currentAssignment = assignment;
        if (!currentForm || !currentAssignment) return;

        const validationErrors = validate(currentForm, currentAssignment.assignedDate);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        try {
            const updated = await save(currentForm);
            onUpdated(updated);
            onClose();
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : 'Save failed. Please try again.');
        }
    }

    // ── Render ─────────────────────────────────────────────────────────────────

    const reasonLength = form.reason.length;
    const reasonOver = reasonLength > MAX_REASON_LENGTH;

    return (
        <div
            className={styles.backdrop}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-assignment-title"
        >
            <div className={styles.modal}>
                {/* ── Header ── */}
                <div className={styles.header}>
                    <h2 id="edit-assignment-title" className={styles.title}>
                        Edit Role Assignment
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
                        <div role="alert" style={{ color: 'var(--color-danger-text)', fontSize: '13px', padding: '8px 12px', background: 'var(--color-error-bg)', borderRadius: '6px' }}>
                            {saveError}
                        </div>
                    )}

                    {/* User (disabled) */}
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="edit-user">
                            User <span aria-hidden>*</span>
                        </label>
                        <select
                            id="edit-user"
                            className={styles.select}
                            value={assignment.userId}
                            disabled
                            aria-label="User (cannot be changed)"
                        >
                            <option value={assignment.userId}>
                                {assignment.userName} ({assignment.userEmail})
                            </option>
                        </select>
                    </div>

                    {/* Solution + Module */}
                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="edit-solution">
                                Solution <span aria-hidden>*</span>
                            </label>
                            <select
                                id="edit-solution"
                                className={mergeClasses(styles.select, errors.solutionCode ? styles.inputError : undefined)}
                                value={form.solutionCode}
                                onChange={e => {
                                    set('solutionCode', e.target.value);
                                    // Reset module when solution changes
                                    set('moduleCode', '');
                                }}
                                disabled={loading}
                                aria-required="true"
                                aria-describedby={errors.solutionCode ? 'edit-solution-error' : undefined}
                            >
                                <option value="">Select Solution</option>
                                {SOLUTION_OPTIONS.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                            {errors.solutionCode && (
                                <span id="edit-solution-error" className={styles.errorText} role="alert">
                                    {errors.solutionCode}
                                </span>
                            )}
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="edit-module">
                                Module <span aria-hidden>*</span>
                            </label>
                            <select
                                id="edit-module"
                                className={mergeClasses(styles.select, errors.moduleCode ? styles.inputError : undefined)}
                                value={form.moduleCode}
                                onChange={e => set('moduleCode', e.target.value)}
                                disabled={loading || !form.solutionCode}
                                aria-required="true"
                                aria-describedby={errors.moduleCode ? 'edit-module-error' : undefined}
                            >
                                <option value="">Select Module</option>
                                {availableModules.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                            {errors.moduleCode && (
                                <span id="edit-module-error" className={styles.errorText} role="alert">
                                    {errors.moduleCode}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Security Role */}
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="edit-role">
                            Security Role <span aria-hidden>*</span>
                        </label>
                        <select
                            id="edit-role"
                            className={mergeClasses(styles.select, errors.roleCode ? styles.inputError : undefined)}
                            value={form.roleCode}
                            onChange={e => set('roleCode', e.target.value)}
                            disabled={loading}
                            aria-required="true"
                            aria-describedby={errors.roleCode ? 'edit-role-error' : undefined}
                        >
                            <option value="">Select Role</option>
                            {ROLE_OPTIONS.map(r => (
                                <option key={r.code} value={r.code}>{r.label}</option>
                            ))}
                        </select>
                        {errors.roleCode && (
                            <span id="edit-role-error" className={styles.errorText} role="alert">
                                {errors.roleCode}
                            </span>
                        )}
                    </div>

                    {/* Assignment Date + Assigned By */}
                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="edit-assigned-date">
                                Assignment Date <span aria-hidden>*</span>
                            </label>
                            <input
                                id="edit-assigned-date"
                                className={mergeClasses(styles.input, styles.inputReadonly)}
                                value={formatDisplayDate(assignment.assignedDate)}
                                readOnly
                                aria-readonly="true"
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Assigned By</label>
                            <div className={styles.assignedByBlock}>
                                <input
                                    className={mergeClasses(styles.input, styles.inputReadonly)}
                                    value={assignment.assignedBy}
                                    readOnly
                                    aria-readonly="true"
                                    aria-label="Assigned by name"
                                />
                                <span className={styles.assignedByEmail}>{assignment.assignedByEmail}</span>
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div className={styles.field} style={{ maxWidth: '220px' }}>
                        <label className={styles.label} htmlFor="edit-status">
                            Status <span aria-hidden>*</span>
                        </label>
                        <select
                            id="edit-status"
                            className={mergeClasses(styles.select, errors.status ? styles.inputError : undefined)}
                            value={form.status}
                            onChange={e => set('status', e.target.value as 'ACTIVE' | 'INACTIVE')}
                            disabled={loading}
                            aria-required="true"
                            aria-describedby={errors.status ? 'edit-status-error' : undefined}
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                        {errors.status && (
                            <span id="edit-status-error" className={styles.errorText} role="alert">
                                {errors.status}
                            </span>
                        )}
                    </div>

                    {/* Reason for Assignment */}
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="edit-reason">
                            Reason for Assignment <span aria-hidden>*</span>
                        </label>
                        <textarea
                            id="edit-reason"
                            className={mergeClasses(styles.textarea, errors.reason ? styles.inputError : undefined)}
                            value={form.reason}
                            onChange={e => set('reason', e.target.value)}
                            disabled={loading}
                            maxLength={MAX_REASON_LENGTH + 10} // allow slight overrun so counter shows
                            aria-required="true"
                            aria-describedby={errors.reason ? 'edit-reason-error' : 'edit-reason-counter'}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            {errors.reason ? (
                                <span id="edit-reason-error" className={styles.errorText} role="alert">
                                    {errors.reason}
                                </span>
                            ) : <span />}
                            <span
                                id="edit-reason-counter"
                                className={mergeClasses(styles.charCounter, reasonOver ? styles.charCounterOver : undefined)}
                                aria-live="polite"
                            >
                                {reasonLength}/{MAX_REASON_LENGTH} characters
                            </span>
                        </div>
                    </div>

                    {/* Disable Date */}
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="edit-disable-date">
                            Disable Date
                            <span className={styles.labelOptional}>(Optional)</span>
                        </label>
                        <input
                            id="edit-disable-date"
                            type="datetime-local"
                            className={mergeClasses(styles.input, errors.disableDate ? styles.inputError : undefined)}
                            value={form.disableDate ? form.disableDate.slice(0, 16) : ''}
                            onChange={e => set('disableDate', e.target.value ? e.target.value : null)}
                            disabled={loading}
                            aria-describedby={errors.disableDate ? 'edit-disable-date-error' : 'edit-disable-date-hint'}
                        />
                        {errors.disableDate ? (
                            <span id="edit-disable-date-error" className={styles.errorText} role="alert">
                                {errors.disableDate}
                            </span>
                        ) : (
                            <span id="edit-disable-date-hint" className={styles.helperText}>
                                Optional: Specify a future date when this role assignment should be disabled
                            </span>
                        )}
                    </div>
                </div>

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
                        onClick={() => void handleSave()}
                        disabled={loading || reasonOver}
                    >
                        {loading ? 'Saving…' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
