// apps/web/src/features/user-role-assign/UserRoleAssignmentPage.tsx
// FEATURE PAGE — Security User Role Assignment.
// Renders inside AppLayout (with NavRail). Route: /assignments

import { useState, useEffect, useMemo } from 'react';
import { makeStyles, tokens, Text, Button } from '@fluentui/react-components';
import { usePermissionContext } from '@/rbac/PermissionContext';
import { PageSkeleton } from '@/app/PageSkeleton';
import { getMockAssignments } from './services/mockAssignments';
import { AssignmentFilters } from './components/AssignmentFilters';
import { AssignmentTable } from './components/AssignmentTable';
import { AssignRoleModal } from './components/AssignRoleModal';
import type { UserRoleAssignment } from './types/security';
import type { AssignableUserRoleAssignment } from './types/assignment';
import type { StatusFilter } from './components/AssignmentFilters';

// ── Styles ───────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
    page: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalL,
        padding: tokens.spacingVerticalXL,
    },
    pageHeader: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: tokens.spacingHorizontalM,
    },
    titleSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalXS,
    },
    pageTitle: {
        fontSize: tokens.fontSizeBase600,
        fontWeight: tokens.fontWeightSemibold,
        color: tokens.colorNeutralForeground1,
    },
    pageSubtitle: {
        fontSize: tokens.fontSizeBase300,
        color: tokens.colorNeutralForeground2,
    },
    card: {
        backgroundColor: tokens.colorNeutralBackground1,
        borderRadius: tokens.borderRadiusLarge,
        boxShadow: tokens.shadow16,
        overflow: 'hidden',
    },
    footer: {
        padding: tokens.spacingVerticalM,
        paddingLeft: tokens.spacingHorizontalL,
        paddingRight: tokens.spacingHorizontalL,
        borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3,
    },
    loadingOverlay: {
        padding: tokens.spacingVerticalXXL,
        display: 'flex',
        justifyContent: 'center',
        color: tokens.colorNeutralForeground3,
        fontSize: tokens.fontSizeBase300,
    },
});

// ── Filtering logic (pure) ────────────────────────────────────────────────────

function applyFilters(
    data: UserRoleAssignment[],
    search: string,
    statusFilter: StatusFilter,
): UserRoleAssignment[] {
    let result = data;

    // Status filter
    if (statusFilter !== 'ALL') {
        result = result.filter(r => r.status === statusFilter);
    }

    // Search filter — case-insensitive across relevant fields
    const term = search.trim().toLowerCase();
    if (term) {
        result = result.filter(r =>
            r.userName.toLowerCase().includes(term) ||
            r.userEmail.toLowerCase().includes(term) ||
            r.roleLabel.toLowerCase().includes(term) ||
            r.roleCode.toLowerCase().includes(term) ||
            r.solutionCode.toLowerCase().includes(term) ||
            r.moduleCode.toLowerCase().includes(term) ||
            r.assignedBy.toLowerCase().includes(term),
        );
    }

    return result;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function UserRoleAssignmentPage() {
    const { isLoading: permLoading } = usePermissionContext();
    if (permLoading) return <PageSkeleton />;
    return <UserRoleAssignmentContent />;
}

function UserRoleAssignmentContent() {
    const styles = useStyles();

    // ── State ──────────────────────────────────────────────────────────────────
    const [assignments, setAssignments] = useState<UserRoleAssignment[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
    const [loading, setLoading] = useState(false);

    // ── Modal state ────────────────────────────────────────────────────────────
    const [showAssignModal, setShowAssignModal] = useState(false);

    // ── Data loading ───────────────────────────────────────────────────────────
    // Architecture note: Replace getMockAssignments() with the real API call here.
    // State management, error handling, and UI are untouched when backend connects.
    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            try {
                const data = await getMockAssignments();
                if (!cancelled) setAssignments(data);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void load();
        return () => { cancelled = true; };
    }, []);

    // ── Derived state (memoised) ───────────────────────────────────────────────
    const filtered = useMemo(
        () => applyFilters(assignments, search, statusFilter),
        [assignments, search, statusFilter],
    );

    // ── Action handlers ────────────────────────────────────────────────────────
    const handleAssignRole = () => {
        setShowAssignModal(true);
    };

    /**
     * Called by AssignRoleModal after a successful save.
     * Optimistically prepends the new assignment — no page reload, no re-fetch.
     * The AssignableUserRoleAssignment is adapted to the page's UserRoleAssignment
     * shape so it renders correctly in the existing table immediately.
     */
    const handleAssignmentCreated = (created: AssignableUserRoleAssignment) => {
        console.log('Assignment created:', created);
        // Adapt the modal's DTO response to the page's display model
        const adapted: UserRoleAssignment = {
            id: created.id,
            userId: created.userId,
            userName: created.userName,
            userEmail: created.userEmail,
            solutionCode: created.solutionCode,
            moduleCode: created.moduleCode,
            roleCode: created.roleCode,
            roleLabel: created.roleName,
            assignedDate: created.assignmentDate,
            assignedBy: created.assignedBy,
            assignedByEmail: '',
            status: created.status === 'Active' ? 'ACTIVE' : 'INACTIVE',
            reason: created.reason,
            disableDate: created.disableDate ?? null,
        };
        setAssignments(prev => [adapted, ...prev]);
    };

    /**
     * Called by AssignmentTable → EditRoleAssignmentModal after a successful save.
     * Immutably replaces the updated record in the assignments array.
     * No page reload. No full list re-fetch.
     */
    const handleUpdated = (updated: UserRoleAssignment) => {
        setAssignments(prev => prev.map(a => a.id === updated.id ? updated : a));
    };

    const handleDelete = (id: string) => {
        console.log('Delete assignment', id);
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className={styles.page}>
            {/* Page header */}
            <div className={styles.pageHeader}>
                <div className={styles.titleSection}>
                    <Text as="h1" className={styles.pageTitle}>
                        Security User Role Assignment
                    </Text>
                    <Text className={styles.pageSubtitle}>
                        Assign Security Roles to Users for Specific Solutions and Modules
                    </Text>
                </div>
                <Button appearance="primary" onClick={handleAssignRole}>
                    + Assign Role to User
                </Button>
            </div>

            {/* Main card */}
            <div className={styles.card}>
                {/* Filters */}
                <AssignmentFilters
                    search={search}
                    onSearchChange={setSearch}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                />

                {/* Table or loading */}
                {loading ? (
                    <div className={styles.loadingOverlay}>Loading assignments…</div>
                ) : (
                    <AssignmentTable
                        assignments={filtered}
                        onUpdated={handleUpdated}
                        onDelete={handleDelete}
                    />
                )}

                {/* Footer */}
                {!loading && (
                    <div className={styles.footer}>
                        Showing {filtered.length} of {assignments.length} user role assignment
                        {assignments.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>

            {/* ── Assign Role to User modal ── */}
            <AssignRoleModal
                open={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                onCreated={handleAssignmentCreated}
            />
        </div>
    );
}
