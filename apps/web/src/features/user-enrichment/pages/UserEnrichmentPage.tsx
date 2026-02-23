// features/user-enrichment/pages/UserEnrichmentPage.tsx
// User Profile Enrichment — /users
// Fluent UI v9, CSS Modules, no inline styles.

import { useState } from 'react';
import {
    Button,
    Input,
    Spinner,
    Text,
    Table,
    TableHeader,
    TableRow,
    TableHeaderCell,
    TableBody,
    TableCell,
} from '@fluentui/react-components';
import {
    AddRegular,
    SearchRegular,
    EditRegular,
    DeleteRegular,
} from '@fluentui/react-icons';
import { useUsers } from '../hooks/useUsers';
import { EditUserModal } from '../components/EditUserModal';
import type { UserProfile } from '../types/user';
import styles from './UserEnrichmentPage.module.css';

function StatusBadge({ status }: { status: UserProfile['status'] }) {
    return (
        <span className={status === 'Active' ? styles.badgeActive : styles.badgeInactive}>
            {status}
        </span>
    );
}

interface ActionsCellProps {
    user: UserProfile;
    onEdit: (user: UserProfile) => void;
}

function ActionsCell({ user, onEdit }: ActionsCellProps) {
    return (
        <div className={styles.actions}>
            <button
                type="button"
                className={styles.actionBtn}
                aria-label={`Edit ${user.displayName}`}
                onClick={() => onEdit(user)}
            >
                <EditRegular fontSize={16} />
            </button>
            <button
                type="button"
                className={styles.actionBtn}
                aria-label={`Delete ${user.displayName}`}
                onClick={() => console.log('Delete user:', user.id)}
            >
                <DeleteRegular fontSize={16} />
            </button>
        </div>
    );
}

export function UserEnrichmentPage() {
    const { data: users, isLoading, error } = useUsers();
    const [search, setSearch] = useState('');

    // Edit modal state
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const filtered = users.filter((u) => {
        const q = search.toLowerCase();
        return (
            u.email.toLowerCase().includes(q) ||
            u.displayName.toLowerCase().includes(q) ||
            u.role.toLowerCase().includes(q) ||
            u.manager.toLowerCase().includes(q)
        );
    });

    function handleEditClick(user: UserProfile) {
        setSelectedUser(user);
        setIsEditOpen(true);
    }

    function handleSaved(updatedUser: UserProfile) {
        console.log('Updated:', updatedUser);
        // Optimistic update goes here when users list is mutable state
    }

    return (
        <div className={styles.page}>

            {/* ── Page Header ── */}
            <div className={styles.pageHeader}>
                <div className={styles.titleBlock}>
                    <h1 className={styles.pageTitle}>User Profile Enrichment</h1>
                    <p className={styles.pageSubtitle}>Manage User Profiles and Access Control</p>
                </div>
                <Button
                    id="add-new-user-btn"
                    appearance="primary"
                    icon={<AddRegular />}
                    className={styles.addButton}
                    onClick={() => console.log('Add user clicked')}
                >
                    + Add New User
                </Button>
            </div>

            {/* ── User Listing Card ── */}
            <div className={styles.card}>

                {/* Card title row */}
                <div className={styles.cardTitleRow}>
                    <h2 className={styles.cardTitle}>User Listing</h2>
                    {!isLoading && (
                        <Text className={styles.cardCount}>
                            {filtered.length} user{filtered.length !== 1 ? 's' : ''} found
                        </Text>
                    )}
                </div>

                {/* Search */}
                <div className={styles.searchWrap}>
                    <Input
                        id="user-search-input"
                        contentBefore={<SearchRegular fontSize={16} />}
                        placeholder="Search by Name, Email, Role, Manager, or Entra ID..."
                        value={search}
                        onChange={(_, d) => setSearch(d.value)}
                        style={{ width: '100%' }}
                    />
                </div>

                {/* Table */}
                <div className={styles.tableWrap}>
                    {isLoading ? (
                        <Spinner label="Loading users…" size="medium" />
                    ) : error ? (
                        <Text style={{ color: 'var(--color-danger-text)' }} role="alert">{error}</Text>
                    ) : (
                        <Table aria-label="User profile listing" size="small">
                            <TableHeader>
                                <TableRow>
                                    <TableHeaderCell><span className={styles.colHeader}>Entra Email Id</span></TableHeaderCell>
                                    <TableHeaderCell><span className={styles.colHeader}>Display Name</span></TableHeaderCell>
                                    <TableHeaderCell><span className={styles.colHeader}>Organizational Role</span></TableHeaderCell>
                                    <TableHeaderCell><span className={styles.colHeader}>Manager</span></TableHeaderCell>
                                    <TableHeaderCell><span className={styles.colHeader}>Status</span></TableHeaderCell>
                                    <TableHeaderCell><span className={styles.colHeader}>Actions</span></TableHeaderCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell><span className={styles.linkText}>{user.email}</span></TableCell>
                                        <TableCell>
                                            <span className={styles.cellText} style={{ fontWeight: 600 }}>
                                                {user.displayName}
                                            </span>
                                        </TableCell>
                                        <TableCell><span className={styles.cellText}>{user.role}</span></TableCell>
                                        <TableCell><span className={styles.linkText}>{user.manager}</span></TableCell>
                                        <TableCell><StatusBadge status={user.status} /></TableCell>
                                        <TableCell>
                                            <ActionsCell user={user} onEdit={handleEditClick} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {/* Footer */}
                {!isLoading && !error && (
                    <Text className={styles.footer}>
                        Showing {filtered.length} of {users.length} total users
                    </Text>
                )}
            </div>

            {/* ── Edit Modal ── */}
            <EditUserModal
                open={isEditOpen}
                user={selectedUser}
                onClose={() => setIsEditOpen(false)}
                onSaved={handleSaved}
            />

        </div>
    );
}
