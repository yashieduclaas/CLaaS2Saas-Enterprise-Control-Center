// features/user-enrichment/components/EditUserModal.tsx
// Edit User Profile modal — Fluent UI Dialog, CSS Modules, no inline styles.
// Validates locally, calls useUpdateUser hook, never touches service directly.

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Input,
    Select,
    Label,
    Spinner,
    Text,
} from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';
import { useUpdateUser } from '../hooks/useUpdateUser';
import type { UserProfile, UpdateUserRequest } from '../types/user';
import styles from './EditUserModal.module.css';

const ROLE_OPTIONS = [
    'Platform Director',
    'Senior Developer',
    'Project Manager',
    'Business Analyst',
    'QA Engineer',
    'DevOps Engineer',
];

interface FormState {
    displayName: string;
    role: string;
    manager: string;
    status: 'Active' | 'Inactive';
}

interface FormErrors {
    displayName?: string;
    role?: string;
    status?: string;
}

interface EditUserModalProps {
    open: boolean;
    user: UserProfile | null;
    onClose: () => void;
    onSaved: (updatedUser: UserProfile) => void;
}

function validate(form: FormState): FormErrors {
    const errors: FormErrors = {};
    if (!form.displayName.trim()) errors.displayName = 'Display Name is required';
    if (!form.role) errors.role = 'Organizational Role is required';
    if (!form.status) errors.status = 'Account Status is required';
    return errors;
}

export function EditUserModal({ open, user, onClose, onSaved }: EditUserModalProps) {
    const { isLoading, error: saveError, execute } = useUpdateUser();

    const [form, setForm] = useState<FormState>({
        displayName: '',
        role: '',
        manager: '',
        status: 'Active',
    });
    const [errors, setErrors] = useState<FormErrors>({});

    // Pre-fill form whenever a different user is selected
    useEffect(() => {
        if (user) {
            setForm({
                displayName: user.displayName,
                role: user.role,
                manager: user.manager,
                status: user.status,
            });
            setErrors({});
        }
    }, [user]);

    function handleClose() {
        setErrors({});
        onClose();
    }

    async function handleSave() {
        const validationErrors = validate(form);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        if (!user) return;

        const payload: UpdateUserRequest = {
            displayName: form.displayName.trim(),
            role: form.role,
            manager: form.manager.trim(),
            status: form.status,
        };

        const updated = await execute(user.id, payload);
        if (updated) {
            // Merge original email back (mock service returns placeholder)
            const merged: UserProfile = { ...updated, email: user.email };
            onSaved(merged);
            handleClose();
        }
    }

    return (
        <Dialog open={open} onOpenChange={(_, data) => { if (!data.open) handleClose(); }}>
            <DialogSurface className={styles.surface}>
                <DialogBody>
                    <DialogTitle
                        action={
                            <Button
                                appearance="subtle"
                                aria-label="Close"
                                icon={<DismissRegular />}
                                onClick={handleClose}
                            />
                        }
                    >
                        <span className={styles.title}>Edit User Profile</span>
                    </DialogTitle>

                    <DialogContent>
                        <div className={styles.grid}>

                            {/* Entra Email ID — disabled */}
                            <div className={styles.field}>
                                <Label htmlFor="edit-email">
                                    Entra Email ID <span className={styles.required}>*</span>
                                </Label>
                                <Input
                                    id="edit-email"
                                    value={user?.email ?? ''}
                                    disabled
                                    className={styles.inputDisabled}
                                />
                            </div>

                            {/* Display Name */}
                            <div className={styles.field}>
                                <Label htmlFor="edit-displayName">
                                    Display Name <span className={styles.required}>*</span>
                                </Label>
                                <Input
                                    id="edit-displayName"
                                    value={form.displayName}
                                    onChange={(_, d) => {
                                        setForm((f) => ({ ...f, displayName: d.value }));
                                        if (errors.displayName) setErrors((e) => ({ ...e, displayName: undefined }));
                                    }}
                                    aria-invalid={!!errors.displayName}
                                />
                                {errors.displayName && (
                                    <Text className={styles.errorText}>{errors.displayName}</Text>
                                )}
                            </div>

                            {/* Organizational Role */}
                            <div className={styles.field}>
                                <Label htmlFor="edit-role">
                                    Organizational Role <span className={styles.required}>*</span>
                                </Label>
                                <Select
                                    id="edit-role"
                                    value={form.role}
                                    onChange={(_, d) => {
                                        setForm((f) => ({ ...f, role: d.value }));
                                        if (errors.role) setErrors((e) => ({ ...e, role: undefined }));
                                    }}
                                    aria-invalid={!!errors.role}
                                >
                                    <option value="" disabled>Select role…</option>
                                    {ROLE_OPTIONS.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </Select>
                                {errors.role && (
                                    <Text className={styles.errorText}>{errors.role}</Text>
                                )}
                            </div>

                            {/* Manager */}
                            <div className={styles.field}>
                                <Label htmlFor="edit-manager">Manager</Label>
                                <Input
                                    id="edit-manager"
                                    value={form.manager}
                                    onChange={(_, d) => setForm((f) => ({ ...f, manager: d.value }))}
                                />
                            </div>

                            {/* Account Status — full width */}
                            <div className={`${styles.field} ${styles.fieldFull}`}>
                                <Label htmlFor="edit-status">
                                    Account Status <span className={styles.required}>*</span>
                                </Label>
                                <Select
                                    id="edit-status"
                                    value={form.status}
                                    onChange={(_, d) => {
                                        setForm((f) => ({ ...f, status: d.value as 'Active' | 'Inactive' }));
                                        if (errors.status) setErrors((e) => ({ ...e, status: undefined }));
                                    }}
                                    aria-invalid={!!errors.status}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </Select>
                                {errors.status && (
                                    <Text className={styles.errorText}>{errors.status}</Text>
                                )}
                            </div>

                        </div>

                        {/* Service-level error */}
                        {saveError && (
                            <Text className={styles.errorText} role="alert" style={{ marginTop: 12 }}>
                                {saveError}
                            </Text>
                        )}
                    </DialogContent>

                    <DialogActions className={styles.actions}>
                        <Button appearance="secondary" onClick={handleClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button
                            appearance="primary"
                            onClick={handleSave}
                            disabled={isLoading}
                            icon={isLoading ? <Spinner size="tiny" appearance="inverted" /> : undefined}
                        >
                            {isLoading ? 'Saving…' : 'Save Changes'}
                        </Button>
                    </DialogActions>

                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}
