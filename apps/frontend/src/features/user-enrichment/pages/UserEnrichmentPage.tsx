// features/user-enrichment/pages/UserEnrichmentPage.tsx
// User Profile Enrichment — /users
// Vanilla table spec — Griffel only, native table.
/*
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

*/

// ============================================================
// UserEnrichmentPage.tsx — User Profile Enrichment
// Replicates: user-profile.js from kernel_mock
// ============================================================

import { useState } from 'react';

const ORG_ROLES = [
  'Senior Developer', 'Project Manager', 'UX Designer', 'DevOps Engineer',
  'Platform Director', 'Product Manager', 'QA Analyst', 'Business Analyst',
  'AI Engineer', 'Technology Associate',
];

interface User {
  user_id: string;
  entra_email_id: string;
  display_name: string;
  org_role: string;
  manager_name: string;
  manager_email_id: string;
  is_active: boolean;
}

const INITIAL_USERS: User[] = [
  {
    user_id: 'U-001',
    entra_email_id: 'alice.tan@lithan.com',
    display_name: 'Alice Tan',
    org_role: 'Platform Director',
    manager_name: 'John Smith',
    manager_email_id: 'john.smith@lithan.com',
    is_active: true,
  },
  {
    user_id: 'U-002',
    entra_email_id: 'bob.lee@lithan.com',
    display_name: 'Bob Lee',
    org_role: 'Senior Developer',
    manager_name: 'Alice Tan',
    manager_email_id: 'alice.tan@lithan.com',
    is_active: true,
  },
  {
    user_id: 'U-003',
    entra_email_id: 'carol.ng@lithan.com',
    display_name: 'Carol Ng',
    org_role: 'QA Analyst',
    manager_name: '',
    manager_email_id: '',
    is_active: false,
  },
];

interface FormState {
  entra_email_id: string;
  display_name: string;
  org_role: string;
  manager_name: string;
  is_active: boolean;
}

const emptyForm = (): FormState => ({
  entra_email_id: '',
  display_name: '',
  org_role: '',
  manager_name: '',
  is_active: true,
});

interface ModalState {
  open: boolean;
  mode: 'add' | 'edit';
  editId?: string;
}

function Toast({ message, type }: { message: string; type: string }) {
  return (
    <div className={`toast-msg toast-${type} show`} style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 3000 }}>
      <i className={`fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}`} />
      {' '}{message}
    </div>
  );
}

export function UserEnrichmentPage() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState<ModalState>({ open: false, mode: 'add' });
  const [form, setForm] = useState<FormState>(emptyForm());
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  const showToast = (message: string, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredUsers = searchQuery
    ? users.filter(u => {
        const q = searchQuery.toLowerCase();
        return (
          u.display_name.toLowerCase().includes(q) ||
          u.entra_email_id.toLowerCase().includes(q) ||
          u.org_role.toLowerCase().includes(q) ||
          u.manager_name.toLowerCase().includes(q)
        );
      })
    : users;

  const openAddModal = () => {
    setForm(emptyForm());
    setModal({ open: true, mode: 'add' });
  };

  const openEditModal = (id: string) => {
    const u = users.find(x => x.user_id === id);
    if (!u) return;
    setForm({
      entra_email_id: u.entra_email_id,
      display_name: u.display_name,
      org_role: u.org_role,
      manager_name: u.manager_name,
      is_active: u.is_active,
    });
    setModal({ open: true, mode: 'edit', editId: id });
  };

  const closeModal = () => setModal({ open: false, mode: 'add' });

  const saveUser = () => {
    if (!form.entra_email_id || !form.display_name || !form.org_role) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    const duplicate = users.find(u => u.entra_email_id === form.entra_email_id);
    if (duplicate) {
      showToast('A user with this email already exists', 'error');
      return;
    }
    setUsers(prev => [
      ...prev,
      {
        user_id: `U-${Date.now()}`,
        entra_email_id: form.entra_email_id,
        display_name: form.display_name,
        org_role: form.org_role,
        manager_name: form.manager_name,
        manager_email_id: '',
        is_active: form.is_active,
      },
    ]);
    closeModal();
    showToast('User added successfully');
  };

  const updateUser = () => {
    setUsers(prev =>
      prev.map(u =>
        u.user_id === modal.editId
          ? { ...u, display_name: form.display_name, org_role: form.org_role, manager_name: form.manager_name, is_active: form.is_active }
          : u
      )
    );
    closeModal();
    showToast('User updated successfully');
  };

  const deleteUser = (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(u => u.user_id !== id));
      showToast('User deleted');
    }
  };

  const copyEmail = (email: string) => {
    if (!email) { showToast('No email available', 'info'); return; }
    navigator.clipboard.writeText(email)
      .then(() => showToast('Email copied to clipboard', 'success'))
      .catch(() => showToast('Failed to copy email', 'error'));
  };

  return (
    <div className="center-stage feature-page">
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>User Profile Enrichment</h1>
            <p className="page-subtitle">Manage User Profiles and Access Control</p>
          </div>
          <button className="btn-primary" onClick={openAddModal}>
            <i className="fas fa-plus" /> Add New User
          </button>
        </div>

        <div className="data-table-wrapper">
          <div className="table-toolbar">
            <div className="table-title">User Listing</div>
            <span className="table-count">{filteredUsers.length} users found</span>
          </div>
          <div className="search-bar">
            <i className="fas fa-search" />
            <input
              type="text"
              placeholder="Search by Name, Email, Role, Manager, or Entra ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Entra Email Id</th>
                <th>Display Name</th>
                <th>Organizational Role</th>
                <th>Manager</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.user_id}>
                  <td className="email-cell">{u.entra_email_id}</td>
                  <td><strong>{u.display_name}</strong></td>
                  <td>{u.org_role}</td>
                  <td>
                    {u.manager_name ? (
                      <span
                        className="module-lead-link"
                        onClick={() => copyEmail(u.manager_email_id)}
                        title="Click to copy email"
                      >
                        {u.manager_name}
                      </span>
                    ) : '-'}
                  </td>
                  <td>
                    <span className={`status-badge ${u.is_active ? 'active' : 'inactive'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="icon-btn edit" onClick={() => openEditModal(u.user_id)} title="Edit">
                      <i className="fas fa-pen" />
                    </button>
                    <button className="icon-btn delete" onClick={() => deleteUser(u.user_id)} title="Delete">
                      <i className="fas fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="table-footer">
            Showing {filteredUsers.length} of {users.length} total users
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal.mode === 'edit' ? 'Edit User Profile' : 'Add New User'}</h3>
              <button className="modal-close" onClick={closeModal}><i className="fas fa-times" /></button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-row">
                  <div className="form-group">
                    <label>Entra Email ID *</label>
                    <input
                      type="email"
                      value={form.entra_email_id}
                      onChange={e => setForm(f => ({ ...f, entra_email_id: e.target.value }))}
                      placeholder="john.doe@lithan.com"
                      readOnly={modal.mode === 'edit'}
                    />
                  </div>
                  <div className="form-group">
                    <label>Display Name *</label>
                    <input
                      type="text"
                      value={form.display_name}
                      onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Organizational Role *</label>
                    <select
                      value={form.org_role}
                      onChange={e => setForm(f => ({ ...f, org_role: e.target.value }))}
                      required
                    >
                      <option value="">Select Organizational Role</option>
                      {ORG_ROLES.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Manager</label>
                    <input
                      type="text"
                      value={form.manager_name}
                      onChange={e => setForm(f => ({ ...f, manager_name: e.target.value }))}
                      placeholder="Manager Name"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Account Status *</label>
                    <select
                      value={form.is_active ? 'true' : 'false'}
                      onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'true' }))}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn-primary" onClick={modal.mode === 'edit' ? updateUser : saveUser}>
                {modal.mode === 'edit' ? 'Save Changes' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}