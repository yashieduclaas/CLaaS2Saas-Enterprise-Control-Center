// apps/web/src/features/role-management/components/AddSecurityRoleModal.tsx
// Add New Security Role modal — exact specs from design.
// Uses Fluent Dialog. Temporary handler (no API yet).

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogSurface,
    DialogBody,
    DialogContent,
    DialogActions,
    Button,
    Input,
    Select,
    Label,
} from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';
import type { SecurityRole } from '../types/securityRole';
import styles from './AddSecurityRoleModal.module.css';

// ── Options ─────────────────────────────────────────────────────────────────

const SOLUTION_OPTIONS = ['AESS', 'AIW', 'ADLT', 'ACRM'] as const;

const MODULE_OPTIONS: Record<string, string[]> = {
    AESS: ['AESS'],
    AIW: ['AIW'],
    ADLT: ['ADLT'],
    ACRM: ['ACRM'],
};

const ROLE_CODE_OPTIONS = [
    'GLOBAL_ADMIN',
    'ADMIN',
    'CONTRIBUTOR',
    'VIEWER',
    'CUSTOM_ROLE_01',
    'CUSTOM_ROLE_02',
];

// ── Form state & validation ─────────────────────────────────────────────────

interface FormState {
    solution: string;
    module: string;
    roleCode: string;
    roleName: string;
    roleType: string;
}

const INITIAL_FORM: FormState = {
    solution: '',
    module: '',
    roleCode: '',
    roleName: '',
    roleType: 'Custom Role',
};

interface FormErrors {
    solution?: string;
    module?: string;
    roleCode?: string;
    roleName?: string;
    roleType?: string;
}

function validate(form: FormState): FormErrors {
    const errors: FormErrors = {};
    if (!form.solution) errors.solution = 'Solution is required';
    if (!form.module) errors.module = 'Module is required';
    if (!form.roleCode) errors.roleCode = 'Role Code is required';
    if (!form.roleName.trim()) errors.roleName = 'Role Name is required';
    if (!form.roleType) errors.roleType = 'Role Type is required';
    return errors;
}

// ── Props ───────────────────────────────────────────────────────────────────

export interface AddSecurityRoleModalProps {
    open: boolean;
    onClose: () => void;
    onCreated?: (newRole: SecurityRole) => void;
}

// ── Component ─────────────────────────────────────────────────────────────

export function AddSecurityRoleModal({ open, onClose, onCreated }: AddSecurityRoleModalProps) {
    const [form, setForm] = useState<FormState>(INITIAL_FORM);
    const [errors, setErrors] = useState<FormErrors>({});

    const availableModules = form.solution ? (MODULE_OPTIONS[form.solution] ?? []) : [];

    useEffect(() => {
        if (open) {
            setForm(INITIAL_FORM);
            setErrors({});
        }
    }, [open]);

    function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    }

    function handleSubmit() {
        const validationErrors = validate(form);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        console.log('Submitting role:', form);
        onClose();
    }

    function handleClose() {
        onClose();
    }

    return (
        <Dialog open={open} onOpenChange={(_, data) => !data.open && handleClose()}>
            <DialogSurface className={styles.surface}>
                <DialogBody>
                    {/* Title Row */}
                    <div className={styles.titleRow}>
                        <h2 className={styles.title}>Add New Security Role</h2>
                        <Button
                            appearance="subtle"
                            aria-label="Close"
                            icon={<DismissRegular fontSize={16} />}
                            onClick={handleClose}
                            className={styles.closeBtn}
                        />
                    </div>

                    <DialogContent>
                        {/* Grid: ROW 1 Solution | Module, ROW 2 Role Code | Role Name, ROW 3 Role Type | (empty) */}
                        <div className={styles.grid}>
                            {/* Row 1: LEFT — Solution */}
                            <div className={styles.field}>
                                <Label className={styles.label} htmlFor="add-role-solution">
                                    Solution <span className={styles.required}>*</span>
                                </Label>
                                <Select
                                    id="add-role-solution"
                                    value={form.solution}
                                    onChange={(_, d) => {
                                        setField('solution', d.value);
                                        setField('module', '');
                                    }}
                                    className={errors.solution ? `${styles.select} ${styles.inputError}` : styles.select}
                                >
                                    <option value="">Select Solution</option>
                                    {SOLUTION_OPTIONS.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </Select>
                                {errors.solution && (
                                    <span className={styles.errorText} role="alert">{errors.solution}</span>
                                )}
                            </div>
                            {/* Row 1: RIGHT — Module */}
                            <div className={styles.field}>
                                <Label className={styles.label} htmlFor="add-role-module">
                                    Module <span className={styles.required}>*</span>
                                </Label>
                                <Select
                                    id="add-role-module"
                                    value={form.module}
                                    onChange={(_, d) => setField('module', d.value)}
                                    disabled={!form.solution}
                                    className={errors.module ? `${styles.select} ${styles.inputError}` : styles.select}
                                >
                                    <option value="">Select Module</option>
                                    {availableModules.map((m) => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </Select>
                                {errors.module && (
                                    <span className={styles.errorText} role="alert">{errors.module}</span>
                                )}
                            </div>
                            {/* Row 2: LEFT — Role Code */}
                            <div className={styles.field}>
                                <Label className={styles.label} htmlFor="add-role-code">
                                    Role Code <span className={styles.required}>*</span>
                                </Label>
                                <Select
                                    id="add-role-code"
                                    value={form.roleCode}
                                    onChange={(_, d) => setField('roleCode', d.value)}
                                    className={errors.roleCode ? `${styles.select} ${styles.inputError}` : styles.select}
                                >
                                    <option value="">Select Role Code</option>
                                    {ROLE_CODE_OPTIONS.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </Select>
                                {errors.roleCode && (
                                    <span className={styles.errorText} role="alert">{errors.roleCode}</span>
                                )}
                            </div>
                            {/* Row 2: RIGHT — Role Name */}
                            <div className={styles.field}>
                                <Label className={styles.label} htmlFor="add-role-name">
                                    Role Name <span className={styles.required}>*</span>
                                </Label>
                                <Input
                                    id="add-role-name"
                                    value={form.roleName}
                                    onChange={(_, d) => setField('roleName', d.value)}
                                    placeholder="e.g., Administrator"
                                    className={errors.roleName ? `${styles.input} ${styles.inputError}` : styles.input}
                                />
                                {errors.roleName && (
                                    <span className={styles.errorText} role="alert">{errors.roleName}</span>
                                )}
                            </div>
                            {/* Row 3: LEFT — Role Type */}
                            <div className={styles.field}>
                                <Label className={styles.label} htmlFor="add-role-type">
                                    Role Type <span className={styles.required}>*</span>
                                </Label>
                                <Select
                                    id="add-role-type"
                                    value={form.roleType}
                                    onChange={(_, d) => setField('roleType', d.value)}
                                    className={errors.roleType ? `${styles.select} ${styles.inputError}` : styles.select}
                                >
                                    <option value="Custom Role">Custom Role</option>
                                    <option value="System Role">System Role</option>
                                </Select>
                                {errors.roleType && (
                                    <span className={styles.errorText} role="alert">{errors.roleType}</span>
                                )}
                            </div>
                        </div>
                    </DialogContent>

                    {/* Footer */}
                    <DialogActions className={styles.footer}>
                        <Button
                            appearance="secondary"
                            onClick={handleClose}
                            className={styles.cancelBtn}
                        >
                            Cancel
                        </Button>
                        <Button
                            appearance="primary"
                            onClick={handleSubmit}
                            className={styles.addBtn}
                        >
                            Add Role
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}
