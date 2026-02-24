// features/user-enrichment/components/AddUserModal.tsx
// Add New User modal — exact specs from design.

import { useState } from 'react';
import {
    Dialog,
    DialogSurface,
    DialogBody,
    DialogContent,
    Button,
    Input,
    Select,
    Label,
} from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';
import styles from './AddUserModal.module.css';

const ROLE_OPTIONS = [
    'Platform Director',
    'Senior Developer',
    'Project Manager',
    'Business Analyst',
    'QA Engineer',
    'DevOps Engineer',
];

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function AddUserModal({ open, onClose }: Props) {
    const [email, setEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [role, setRole] = useState('');
    const [manager, setManager] = useState('');
    const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

    function handleClose() {
        onClose();
    }

    function handleAdd() {
        // TODO: backend integration
        handleClose();
    }

    return (
        <Dialog open={open} onOpenChange={(_, data) => !data.open && handleClose()}>
            <DialogSurface className={styles.surface}>
                <DialogBody>
                    {/* Title Row */}
                    <div className={styles.titleRow}>
                        <h2 className={styles.title}>Add New User</h2>
                        <Button
                            appearance="subtle"
                            aria-label="Close"
                            icon={<DismissRegular fontSize={16} />}
                            onClick={handleClose}
                            className={styles.closeBtn}
                        />
                    </div>

                    <DialogContent>
                        {/* Two-column grid: LEFT = Entra Email ID, Organizational Role, Account Status | RIGHT = Display Name, Manager */}
                        <div className={styles.grid}>
                            {/* Row 1: LEFT — Entra Email ID */}
                            <div className={styles.field}>
                                <Label className={styles.label} htmlFor="add-email">
                                    Entra Email ID <span className={styles.required}>*</span>
                                </Label>
                                <Input
                                    id="add-email"
                                    value={email}
                                    onChange={(_, d) => setEmail(d.value)}
                                    placeholder="john.doe@lithan.com"
                                    className={styles.input}
                                />
                            </div>
                            {/* Row 1: RIGHT — Display Name */}
                            <div className={styles.field}>
                                <Label className={styles.label} htmlFor="add-displayName">
                                    Display Name <span className={styles.required}>*</span>
                                </Label>
                                <Input
                                    id="add-displayName"
                                    value={displayName}
                                    onChange={(_, d) => setDisplayName(d.value)}
                                    placeholder="John Doe"
                                    className={styles.input}
                                />
                            </div>
                            {/* Row 2: LEFT — Organizational Role */}
                            <div className={styles.field}>
                                <Label className={styles.label} htmlFor="add-role">
                                    Organizational Role <span className={styles.required}>*</span>
                                </Label>
                                <Select
                                    id="add-role"
                                    value={role}
                                    onChange={(_, d) => setRole(d.value)}
                                    className={styles.select}
                                >
                                    <option value="">Select Organizational Role</option>
                                    {ROLE_OPTIONS.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </Select>
                            </div>
                            {/* Row 2: RIGHT — Manager */}
                            <div className={styles.field}>
                                <Label className={styles.label} htmlFor="add-manager">
                                    Manager
                                </Label>
                                <Input
                                    id="add-manager"
                                    value={manager}
                                    onChange={(_, d) => setManager(d.value)}
                                    placeholder="Manager Name"
                                    className={styles.input}
                                />
                            </div>
                            {/* Row 3: LEFT — Account Status */}
                            <div className={styles.field}>
                                <Label className={styles.label} htmlFor="add-status">
                                    Account Status <span className={styles.required}>*</span>
                                </Label>
                                <Select
                                    id="add-status"
                                    value={status}
                                    onChange={(_, d) => setStatus(d.value as 'Active' | 'Inactive')}
                                    className={styles.select}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </Select>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className={styles.footer}>
                            <Button
                                appearance="secondary"
                                onClick={handleClose}
                                className={styles.cancelBtn}
                            >
                                Cancel
                            </Button>
                            <Button
                                appearance="primary"
                                onClick={handleAdd}
                                className={styles.addBtn}
                            >
                                Add User
                            </Button>
                        </div>
                    </DialogContent>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
}
