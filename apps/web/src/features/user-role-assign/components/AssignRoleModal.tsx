// apps/web/src/features/user-role-assign/components/AssignRoleModal.tsx
// FEATURE COMPONENT — Assign Role to User modal.
//
// Props contract:
//   open      : controls visibility (fully controlled by parent)
//   onClose   : called when user cancels or dialog closes
//   onCreated : called with the new AssignableUserRoleAssignment after save
//
// Architecture:
//   - Owns only local form state (CreateUserRoleAssignmentRequest)
//   - Delegates API call to useCreateAssignment hook
//   - Never mutates parent state directly
//   - Never imports the service directly
//   - Uses Fluent UI Dialog (Portal rendering built-in — no clipping)

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    makeStyles,
    tokens,
    mergeClasses,
} from '@fluentui/react-components';
import { useCreateAssignment } from '../hooks/useCreateAssignment';
import type {
    CreateUserRoleAssignmentRequest,
    AssignableUserRoleAssignment,
} from '../types/assignment';

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

// Mock user list — server will provide this via /api/users once connected
const MOCK_USERS = [
    { id: 'usr-001', name: 'Alice Johnson', email: 'alice@educlaas.com' },
    { id: 'usr-002', name: 'Bob Smith', email: 'bob@educlaas.com' },
    { id: 'usr-003', name: 'Carol Tan', email: 'carol@educlaas.com' },
    { id: 'usr-004', name: 'David Lee', email: 'david@educlaas.com' },
] as const;

const MAX_REASON = 255;

const INITIAL_FORM: CreateUserRoleAssignmentRequest = {
    userId: '',
    solutionCode: '',
    moduleCode: '',
    roleCode: '',
    assignmentDate: '',
    status: 'Active',
    reason: '',
    disableDate: null,
};

// ── Styles ────────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
    surface: {
        width: '100%',
        maxWidth: '680px',
        borderRadius: tokens.borderRadiusXLarge,
    },
    title: {
        fontSize: tokens.fontSizeBase500,
        fontWeight: tokens.fontWeightSemibold,
        color: '#1a3a5c',
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalL,
        paddingTop: tokens.spacingVerticalM,
    },
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
    label: {
        fontSize: tokens.fontSizeBase300,
        fontWeight: tokens.fontWeightSemibold,
        color: '#1a3a5c',
    },
    labelOptional: {
        fontWeight: tokens.fontWeightRegular,
        color: tokens.colorNeutralForeground3,
        fontSize: tokens.fontSizeBase200,
        marginLeft: '4px',
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
        minHeight: '80px',
        ':focus': {
            outline: `2px solid ${tokens.colorBrandStroke2Hover}`,
            outlineOffset: '0',
        },
    },
    inputError: {
        borderTopColor: tokens.colorPaletteRedBorderActive,
        borderRightColor: tokens.colorPaletteRedBorderActive,
        borderBottomColor: tokens.colorPaletteRedBorderActive,
        borderLeftColor: tokens.colorPaletteRedBorderActive,
    },
    errorText: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorPaletteRedForeground1,
    },
    charCounter: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3,
        textAlign: 'right',
    },
    charCounterOver: {
        color: tokens.colorPaletteRedForeground1,
    },
    helperText: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3,
    },
    saveBanner: {
        fontSize: '13px',
        color: '#b71c1c',
        padding: '8px 12px',
        backgroundColor: '#fdecea',
        borderRadius: tokens.borderRadiusMedium,
    },
});

// ── Validation ────────────────────────────────────────────────────────────────

type ValidationErrors = Partial<Record<keyof CreateUserRoleAssignmentRequest, string>>;

function validate(form: CreateUserRoleAssignmentRequest): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!form.userId) errors.userId = 'User is required.';
    if (!form.solutionCode) errors.solutionCode = 'Solution is required.';
    if (!form.moduleCode) errors.moduleCode = 'Module is required.';
    if (!form.roleCode) errors.roleCode = 'Security Role is required.';
    if (!form.assignmentDate) errors.assignmentDate = 'Assignment Date is required.';
    if (!form.status) errors.status = 'Status is required.';

    if (!form.reason.trim()) {
        errors.reason = 'Reason is required.';
    } else if (form.reason.length > MAX_REASON) {
        errors.reason = `Reason must be ${MAX_REASON} characters or fewer.`;
    }

    if (form.disableDate) {
        const disable = new Date(form.disableDate);
        const now = new Date();
        if (disable <= now) {
            errors.disableDate = 'Disable Date must be a future date.';
        }
    }

    return errors;
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface AssignRoleModalProps {
    open: boolean;
    onClose: () => void;
    onCreated: (newAssignment: AssignableUserRoleAssignment) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AssignRoleModal({ open, onClose, onCreated }: AssignRoleModalProps) {
    const styles = useStyles();
    const { create, loading } = useCreateAssignment();

    const [form, setForm] = useState<CreateUserRoleAssignmentRequest>(INITIAL_FORM);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [saveError, setSaveError] = useState<string | null>(null);

    // Reset form each time modal opens
    useEffect(() => {
        if (open) {
            setForm(INITIAL_FORM);
            setErrors({});
            setSaveError(null);
        }
    }, [open]);

    // ── Field helpers ────────────────────────────────────────────────────────────

    function set<K extends keyof CreateUserRoleAssignmentRequest>(
        key: K,
        value: CreateUserRoleAssignmentRequest[K],
    ) {
        setForm(prev => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
    }

    const availableModules = MODULE_OPTIONS[form.solutionCode] ?? [];
    const reasonLength = form.reason.length;
    const reasonOver = reasonLength > MAX_REASON;

    // ── Submit ───────────────────────────────────────────────────────────────────

    async function handleSubmit() {
        setSaveError(null);
        const validationErrors = validate(form);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        try {
            const newAssignment = await create(form);
            onCreated(newAssignment);
            onClose();
        } catch (err) {
            setSaveError(
                err instanceof Error ? err.message : 'Failed to create assignment. Please try again.',
            );
        }
    }

    // ── Render ───────────────────────────────────────────────────────────────────

    return (
        <Dialog
            open={open}
            onOpenChange={(_, data) => {
                if (!data.open && !loading) onClose();
            }}
        >
            <DialogSurface className={styles.surface} aria-describedby={undefined}>
                <DialogBody>
                    <DialogTitle className={styles.title}>
                        Assign Role to User
                    </DialogTitle>

                    <DialogContent className={styles.content}>

                        {/* Save error banner */}
                        {saveError && (
                            <div role="alert" className={styles.saveBanner}>{saveError}</div>
                        )}

                        {/* ── User ── */}
                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="assign-user">
                                User <span aria-hidden>*</span>
                            </label>
                            <select
                                id="assign-user"
                                className={mergeClasses(styles.select, errors.userId ? styles.inputError : undefined)}
                                value={form.userId}
                                onChange={e => set('userId', e.target.value)}
                                disabled={loading}
                                aria-required="true"
                                aria-describedby={errors.userId ? 'assign-user-error' : undefined}
                            >
                                <option value="">Select User</option>
                                {MOCK_USERS.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} ({u.email})
                                    </option>
                                ))}
                            </select>
                            {errors.userId && (
                                <span id="assign-user-error" className={styles.errorText} role="alert">
                                    {errors.userId}
                                </span>
                            )}
                        </div>

                        {/* ── Solution + Module ── */}
                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label className={styles.label} htmlFor="assign-solution">
                                    Solution <span aria-hidden>*</span>
                                </label>
                                <select
                                    id="assign-solution"
                                    className={mergeClasses(styles.select, errors.solutionCode ? styles.inputError : undefined)}
                                    value={form.solutionCode}
                                    onChange={e => {
                                        set('solutionCode', e.target.value);
                                        if (form.moduleCode) set('moduleCode', '');
                                    }}
                                    disabled={loading}
                                    aria-required="true"
                                    aria-describedby={errors.solutionCode ? 'assign-solution-error' : undefined}
                                >
                                    <option value="">Select Solution</option>
                                    {SOLUTION_OPTIONS.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                                {errors.solutionCode && (
                                    <span id="assign-solution-error" className={styles.errorText} role="alert">
                                        {errors.solutionCode}
                                    </span>
                                )}
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label} htmlFor="assign-module">
                                    Module <span aria-hidden>*</span>
                                </label>
                                <select
                                    id="assign-module"
                                    className={mergeClasses(styles.select, errors.moduleCode ? styles.inputError : undefined)}
                                    value={form.moduleCode}
                                    onChange={e => set('moduleCode', e.target.value)}
                                    disabled={loading || !form.solutionCode}
                                    aria-required="true"
                                    aria-describedby={errors.moduleCode ? 'assign-module-error' : undefined}
                                >
                                    <option value="">Select Module</option>
                                    {availableModules.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                                {errors.moduleCode && (
                                    <span id="assign-module-error" className={styles.errorText} role="alert">
                                        {errors.moduleCode}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* ── Security Role ── */}
                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="assign-role">
                                Security Role <span aria-hidden>*</span>
                            </label>
                            <select
                                id="assign-role"
                                className={mergeClasses(styles.select, errors.roleCode ? styles.inputError : undefined)}
                                value={form.roleCode}
                                onChange={e => set('roleCode', e.target.value)}
                                disabled={loading}
                                aria-required="true"
                                aria-describedby={errors.roleCode ? 'assign-role-error' : undefined}
                            >
                                <option value="">Select Role</option>
                                {ROLE_OPTIONS.map(r => (
                                    <option key={r.code} value={r.code}>{r.label}</option>
                                ))}
                            </select>
                            {errors.roleCode && (
                                <span id="assign-role-error" className={styles.errorText} role="alert">
                                    {errors.roleCode}
                                </span>
                            )}
                        </div>

                        {/* ── Assignment Date + Status ── */}
                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label className={styles.label} htmlFor="assign-date">
                                    Assignment Date <span aria-hidden>*</span>
                                </label>
                                <input
                                    id="assign-date"
                                    type="datetime-local"
                                    className={mergeClasses(styles.input, errors.assignmentDate ? styles.inputError : undefined)}
                                    value={form.assignmentDate}
                                    onChange={e => set('assignmentDate', e.target.value)}
                                    disabled={loading}
                                    aria-required="true"
                                    aria-describedby={errors.assignmentDate ? 'assign-date-error' : undefined}
                                />
                                {errors.assignmentDate && (
                                    <span id="assign-date-error" className={styles.errorText} role="alert">
                                        {errors.assignmentDate}
                                    </span>
                                )}
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label} htmlFor="assign-status">
                                    Status <span aria-hidden>*</span>
                                </label>
                                <select
                                    id="assign-status"
                                    className={mergeClasses(styles.select, errors.status ? styles.inputError : undefined)}
                                    value={form.status}
                                    onChange={e => set('status', e.target.value as 'Active' | 'Inactive')}
                                    disabled={loading}
                                    aria-required="true"
                                    aria-describedby={errors.status ? 'assign-status-error' : undefined}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                                {errors.status && (
                                    <span id="assign-status-error" className={styles.errorText} role="alert">
                                        {errors.status}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* ── Reason ── */}
                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="assign-reason">
                                Reason for Assignment <span aria-hidden>*</span>
                            </label>
                            <textarea
                                id="assign-reason"
                                className={mergeClasses(styles.textarea, errors.reason ? styles.inputError : undefined)}
                                value={form.reason}
                                onChange={e => set('reason', e.target.value)}
                                disabled={loading}
                                aria-required="true"
                                aria-describedby={errors.reason ? 'assign-reason-error' : 'assign-reason-counter'}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                {errors.reason ? (
                                    <span id="assign-reason-error" className={styles.errorText} role="alert">
                                        {errors.reason}
                                    </span>
                                ) : <span />}
                                <span
                                    id="assign-reason-counter"
                                    className={mergeClasses(styles.charCounter, reasonOver ? styles.charCounterOver : undefined)}
                                    aria-live="polite"
                                >
                                    {reasonLength}/{MAX_REASON}
                                </span>
                            </div>
                        </div>

                        {/* ── Disable Date (optional) ── */}
                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="assign-disable-date">
                                Disable Date
                                <span className={styles.labelOptional}>(Optional)</span>
                            </label>
                            <input
                                id="assign-disable-date"
                                type="datetime-local"
                                className={mergeClasses(styles.input, errors.disableDate ? styles.inputError : undefined)}
                                value={form.disableDate ?? ''}
                                onChange={e => set('disableDate', e.target.value || null)}
                                disabled={loading}
                                aria-describedby={errors.disableDate ? 'assign-disable-error' : 'assign-disable-hint'}
                            />
                            {errors.disableDate ? (
                                <span id="assign-disable-error" className={styles.errorText} role="alert">
                                    {errors.disableDate}
                                </span>
                            ) : (
                                <span id="assign-disable-hint" className={styles.helperText}>
                                    Optional — must be a future date if provided
                                </span>
                            )}
                        </div>

                    </DialogContent>

                    <DialogActions>
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
                            disabled={loading || reasonOver}
                        >
                            {loading ? 'Assigning…' : 'Assign Role'}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}
