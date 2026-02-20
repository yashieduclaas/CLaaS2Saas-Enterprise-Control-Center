// apps/web/src/features/user-role-assign/components/AssignmentFilters.tsx
// FEATURE FILE — Search bar and status filter tabs for User Role Assignment.

import { makeStyles, mergeClasses, tokens } from '@fluentui/react-components';
import { SearchRegular } from '@fluentui/react-icons';

export type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

const useStyles = makeStyles({
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalM,
        padding: tokens.spacingVerticalM,
        paddingLeft: tokens.spacingHorizontalL,
        paddingRight: tokens.spacingHorizontalL,
        borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    },
    searchRow: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        backgroundColor: tokens.colorNeutralBackground3,
        borderRadius: tokens.borderRadiusMedium,
        border: `1px solid ${tokens.colorNeutralStroke2}`,
        paddingLeft: tokens.spacingHorizontalM,
        paddingRight: tokens.spacingHorizontalM,
        height: '36px',
    },
    searchIcon: {
        color: tokens.colorNeutralForeground3,
        display: 'flex',
        flexShrink: 0,
    },
    searchInput: {
        flex: 1,
        border: 'none',
        outline: 'none',
        background: 'transparent',
        fontSize: tokens.fontSizeBase300,
        color: tokens.colorNeutralForeground1,
        '::placeholder': {
            color: tokens.colorNeutralForeground3,
        },
    },
    tabRow: {
        display: 'flex',
        gap: tokens.spacingHorizontalS,
    },
    tab: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        paddingLeft: tokens.spacingHorizontalM,
        paddingRight: tokens.spacingHorizontalM,
        paddingTop: '6px',
        paddingBottom: '6px',
        borderRadius: tokens.borderRadiusMedium,
        border: `1px solid ${tokens.colorNeutralStroke2}`,
        background: 'transparent',
        fontSize: tokens.fontSizeBase300,
        color: tokens.colorNeutralForeground2,
        cursor: 'pointer',
        fontFamily: 'inherit',
        ':hover': {
            backgroundColor: tokens.colorNeutralBackground3Hover,
        },
    },
    tabActive: {
        backgroundColor: tokens.colorBrandBackground2,
        color: tokens.colorBrandForeground1,
        borderTopColor: tokens.colorBrandBackground,
        borderRightColor: tokens.colorBrandBackground,
        borderBottomColor: tokens.colorBrandBackground,
        borderLeftColor: tokens.colorBrandBackground,
        fontWeight: tokens.fontWeightSemibold,
    },
    tabDot: {
        width: '7px',
        height: '7px',
        borderRadius: '50%',
        flexShrink: 0,
    },
    dotAll: { backgroundColor: tokens.colorNeutralForeground3 },
    dotActive: { backgroundColor: '#2e7d32' },
    dotInactive: { backgroundColor: '#757575' },
});

interface FilterTab {
    id: StatusFilter;
    label: string;
    dotClass: string;
}

export interface AssignmentFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    statusFilter: StatusFilter;
    onStatusFilterChange: (filter: StatusFilter) => void;
}

export function AssignmentFilters({
    search,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
}: AssignmentFiltersProps) {
    const styles = useStyles();

    const tabs: FilterTab[] = [
        { id: 'ALL', label: 'All Assignments', dotClass: styles.dotAll },
        { id: 'ACTIVE', label: 'Active', dotClass: styles.dotActive },
        { id: 'INACTIVE', label: 'Inactive', dotClass: styles.dotInactive },
    ];

    return (
        <div className={styles.wrapper}>
            {/* Search */}
            <div className={styles.searchRow}>
                <span className={styles.searchIcon}>
                    <SearchRegular fontSize={16} />
                </span>
                <input
                    className={styles.searchInput}
                    type="search"
                    placeholder="Search by User, Role, Solution, Module, Reason, or Assigned By..."
                    value={search}
                    onChange={e => onSearchChange(e.target.value)}
                    aria-label="Search assignments"
                />
            </div>

            {/* Status filter tabs */}
            <div className={styles.tabRow} role="tablist" aria-label="Filter by status">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={statusFilter === tab.id}
                        className={mergeClasses(styles.tab, statusFilter === tab.id && styles.tabActive)}
                        onClick={() => onStatusFilterChange(tab.id)}
                    >
                        <span className={mergeClasses(styles.tabDot, tab.dotClass)} aria-hidden />
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
