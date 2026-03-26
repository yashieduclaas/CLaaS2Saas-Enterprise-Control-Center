// features/user-enrichment/pages/UserEnrichmentPage.tsx
// User Profile Enrichment — /users
// Vanilla table spec — Griffel only, native table.

import { useState } from 'react';
import {
  Button,
  Input,
  Spinner,
  Text,
  makeStyles,
} from '@fluentui/react-components';
import {
  AddRegular,
  SearchRegular,
  EditRegular,
  DeleteRegular,
} from '@fluentui/react-icons';
import { useUsers } from '../hooks/useUsers';
import { EditUserModal } from '../components/EditUserModal';
import AddUserModal from '../components/AddUserModal';
import type { UserProfile } from '../types/user';

const useStyles = makeStyles({
  pageContent: {
    padding: '30px',
  },
  pageHeader: {
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#193e6b',
    margin: 0,
    lineHeight: 1.3,
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#666666',
    margin: 0,
  },
  addButton: {
    flexShrink: 0,
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  cardTitleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#193e6b',
    margin: 0,
  },
  cardCount: {
    fontSize: '13px',
    color: '#666666',
  },
  searchWrap: {
    width: '100%',
  },
  tableWrapper: {
    padding: '25px',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
    overflowX: 'auto' as const,
  },
  dataTable: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  th: {
    padding: '15px 12px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#193e6b',
    textAlign: 'left' as const,
    borderBottom: '1px solid rgba(0,0,0,0.05)',
  },
  td: {
    padding: '15px 12px',
    fontSize: '14px',
    color: '#333333',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
  },
  tr: {
    ':hover': {
      backgroundColor: 'rgba(0,0,0,0.02)',
    },
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
  },
  statusBadgeActive: {
    background: 'rgba(40,167,69,0.1)',
    color: '#28a745',
  },
  statusBadgeInactive: {
    background: 'rgba(220,53,69,0.1)',
    color: '#dc3545',
  },
  iconBtn: {
    padding: '6px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666666',
    ':hover': {
      background: 'rgba(0,0,0,0.05)',
    },
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  linkText: {
    color: '#007bff',
    fontSize: '14px',
  },
  cellText: {
    fontSize: '14px',
    color: '#333333',
  },
  cellTextBold: {
    fontSize: '14px',
    color: '#333333',
    fontWeight: 600,
  },
  footer: {
    fontSize: '13px',
    color: '#666666',
    paddingTop: '8px',
  },
});

function StatusBadge({ status }: { status: UserProfile['status'] }) {
  const styles = useStyles();
  const isActive = status === 'Active';
  return (
    <span className={`${styles.statusBadge} ${isActive ? styles.statusBadgeActive : styles.statusBadgeInactive}`}>
      {status}
    </span>
  );
}

interface ActionsCellProps {
  user: UserProfile;
  onEdit: (user: UserProfile) => void;
}

function ActionsCell({ user, onEdit }: ActionsCellProps) {
  const styles = useStyles();
  return (
    <div className={styles.actions}>
      <button
        type="button"
        className={styles.iconBtn}
        aria-label={`Edit ${user.displayName}`}
        onClick={() => onEdit(user)}
      >
        <EditRegular fontSize={16} />
      </button>
      <button
        type="button"
        className={styles.iconBtn}
        aria-label={`Delete ${user.displayName}`}
        onClick={() => console.log('Delete user:', user.id)}
      >
        <DeleteRegular fontSize={16} />
      </button>
    </div>
  );
}

export function UserEnrichmentPage() {
  const styles = useStyles();
  const { data: users, isLoading, error } = useUsers();
  const [search, setSearch] = useState('');

  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

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
  }

  return (
    <div className={styles.pageContent}>
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
          onClick={() => setShowAddModal(true)}
        >
          + Add New User
        </Button>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitleRow}>
          <h2 className={styles.cardTitle}>User Listing</h2>
          {!isLoading && (
            <Text className={styles.cardCount}>
              {filtered.length} user{filtered.length !== 1 ? 's' : ''} found
            </Text>
          )}
        </div>

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

        <div className={styles.tableWrapper}>
          {isLoading ? (
            <Spinner label="Loading users…" size="medium" />
          ) : error ? (
            <Text style={{ color: '#dc3545' }} role="alert">{error}</Text>
          ) : (
            <table className={styles.dataTable} aria-label="User profile listing">
              <thead>
                <tr>
                  <th className={styles.th}>Entra Email Id</th>
                  <th className={styles.th}>Display Name</th>
                  <th className={styles.th}>Organizational Role</th>
                  <th className={styles.th}>Manager</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className={styles.tr}>
                    <td className={styles.td}><span className={styles.linkText}>{user.email}</span></td>
                    <td className={styles.td}><span className={styles.cellTextBold}>{user.displayName}</span></td>
                    <td className={styles.td}><span className={styles.cellText}>{user.role}</span></td>
                    <td className={styles.td}><span className={styles.linkText}>{user.manager}</span></td>
                    <td className={styles.td}><StatusBadge status={user.status} /></td>
                    <td className={styles.td}>
                      <ActionsCell user={user} onEdit={handleEditClick} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!isLoading && !error && (
          <Text className={styles.footer}>
            Showing {filtered.length} of {users.length} total users
          </Text>
        )}
      </div>

      <EditUserModal
        open={isEditOpen}
        user={selectedUser}
        onClose={() => setIsEditOpen(false)}
        onSaved={handleSaved}
      />

      <AddUserModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}
