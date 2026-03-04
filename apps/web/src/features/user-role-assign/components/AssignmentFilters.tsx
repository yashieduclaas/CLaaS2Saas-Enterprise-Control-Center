// apps/web/src/features/user-role-assign/components/AssignmentFilters.tsx
// Vanilla spec — Filter tabs with underline active style.

import { makeStyles, mergeClasses } from '@fluentui/react-components';
import { SearchRegular } from '@fluentui/react-icons';

export type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

const useStyles = makeStyles({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px 24px',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
  },
  searchRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #dee2e6',
    paddingLeft: '12px',
    paddingRight: '12px',
    height: '36px',
  },
  searchIcon: {
    color: '#666666',
    display: 'flex',
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '14px',
    color: '#333333',
    fontFamily: 'inherit',
    '::placeholder': {
      color: '#999999',
    },
  },
  tabRow: {
    display: 'flex',
    gap: '24px',
  },
  tab: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 0',
    background: 'transparent',
    fontSize: '14px',
    color: '#666666',
    cursor: 'pointer',
    fontFamily: 'inherit',
    border: 'none',
    borderBottom: '2px solid transparent',
    borderRadius: 0,
    ':hover': {
      color: '#333333',
    },
  },
  tabActive: {
    color: '#193e6b',
    fontWeight: 600,
    borderBottomColor: '#193e6b',
  },
  tabDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  dotAll: { backgroundColor: '#999999' },
  dotActive: { backgroundColor: '#28a745' },
  dotInactive: { backgroundColor: '#666666' },
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
      <div className={styles.searchRow}>
        <span className={styles.searchIcon}>
          <SearchRegular fontSize={16} />
        </span>
        <input
          className={styles.searchInput}
          type="search"
          placeholder="Search by User, Role, Solution, Module, Reason, or Assigned By..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search assignments"
        />
      </div>

      <div className={styles.tabRow} role="tablist" aria-label="Filter by status">
        {tabs.map((tab) => (
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
