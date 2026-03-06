// apps/web/src/features/module-mgmt/ModuleMgmtPage.tsx
// Module Management System — static UI. Renders inside AppLayout.
/*
import { useState } from 'react';
import { makeStyles, tokens, Text, Button } from '@fluentui/react-components';
import { usePermissionContext } from '@/rbac/PermissionContext';
import { PageSkeleton } from '@/app/PageSkeleton';
import { ModuleTable } from './components/ModuleTable';
import { AddModuleDialog } from './components/AddModuleDialog';
import type { ModuleRowData } from './components/ModuleRow';

const STATIC_MODULES: ModuleRowData[] = [
  {
    solutionCode: 'AESS',
    solutionName: 'Agentic ERP & Shared Services',
    moduleCode: 'AESS',
    moduleName: 'Agentic ERP & Shared Services',
    description: 'ERP and shared services with AI-driven insights',
    lead: 'John Smith',
    version: 'v2.3.1',
  },
  {
    solutionCode: 'AIW',
    solutionName: 'Agentic Intelligent Workplace',
    moduleCode: 'AIW',
    moduleName: 'Agentic Intelligent Workplace',
    description: 'Intelligent workplace and collaboration',
    lead: 'Sarah Johnson',
    version: 'v1.5.0',
  },
  {
    solutionCode: 'ADLT',
    solutionName: 'Adaptive Learning & Talent',
    moduleCode: 'ADLT',
    moduleName: 'Adaptive Learning & Talent',
    description: 'Talent management and adaptive learning',
    lead: 'Michael Chen',
    version: 'v3.0.2',
  },
  {
    solutionCode: 'ACRM',
    solutionName: 'Agentic CRM & Marketer',
    moduleCode: 'ACRM',
    moduleName: 'Agentic CRM & Marketer',
    description: 'CRM and marketing automation',
    lead: 'Emily Davis',
    version: 'v2.1.0',
  },
];

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
});

export function ModuleMgmtPage() {
  const styles = useStyles();
  const [open, setOpen] = useState(false);
  const { isLoading: permLoading } = usePermissionContext();

  if (permLoading) return <PageSkeleton />;

  const handleOpenDialog = () => setOpen(true);
  const handleCancel = () => setOpen(false);
  const handleAdd = () => setOpen(false);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.titleSection}>
          <Text as="h1" className={styles.pageTitle}>
            Module Management System
          </Text>
          <Text className={styles.pageSubtitle}>
            Manage your Solutions and Modules
          </Text>
        </div>
        <Button appearance="primary" onClick={handleOpenDialog}>
          + Add New Module
        </Button>
      </div>

      <div className={styles.card}>
        <ModuleTable modules={STATIC_MODULES} />
      </div>

      <AddModuleDialog
        open={open}
        onOpenChange={setOpen}
        onCancel={handleCancel}
        onAdd={handleAdd}
      />
    </div>
  );
}

*/

// ============================================================
// ModuleMgmtPage.tsx — Module Management
// Replicates: module-mgmt.js from kernel_mock
// ============================================================

// ============================================================
// ModuleMgmtPage.tsx — Module Management
// Replicates: module-mgmt.js from kernel_mock
// ============================================================

import { useState } from 'react';

const SOLUTIONS = [
  { code: 'ADC', name: 'Adaptive CLaaS' },
  { code: 'AIW', name: 'Agentic Intelligent Workplace' },
  { code: 'ACM', name: 'Agentic CRM & Marketer' },
  { code: 'AES', name: 'Agentic ERP & Shared Services' },
];

interface Module {
  solution_module_id: string;
  solution_code: string;
  solution_name: string;
  module_code: string;
  module_name: string;
  description: string;
  module_lead: string;
  module_lead_email: string;
  module_version: string;
  documentation_url: string;
  is_active: boolean;
}

const INITIAL_MODULES: Module[] = [
  {
    solution_module_id: 'SM-001',
    solution_code: 'ADC',
    solution_name: 'Adaptive CLaaS',
    module_code: 'ADC_KERN',
    module_name: 'Kernel Core',
    description: 'Core kernel module for Adaptive CLaaS platform management',
    module_lead: 'Alice Tan',
    module_lead_email: 'alice.tan@lithan.com',
    module_version: 'v1.2.0',
    documentation_url: 'https://docs.example.com/kernel',
    is_active: true,
  },
  {
    solution_module_id: 'SM-002',
    solution_code: 'AIW',
    solution_name: 'Agentic Intelligent Workplace',
    module_code: 'AIW_AGNT',
    module_name: 'Agentic HR',
    description: 'Handles agentic HR workflows and intelligent automation tasks',
    module_lead: 'Bob Lee',
    module_lead_email: 'bob.lee@lithan.com',
    module_version: 'v1.0.0',
    documentation_url: '',
    is_active: true,
  },
];

interface ModalState {
  open: boolean;
  mode: 'add' | 'edit';
  editId?: string;
}

interface FormState {
  solution_code: string;
  solution_name: string;
  module_code: string;
  module_name: string;
  module_version: string;
  module_lead: string;
  description: string;
  documentation_url: string;
}

const emptyForm = (): FormState => ({
  solution_code: '',
  solution_name: '',
  module_code: '',
  module_name: '',
  module_version: '',
  module_lead: '',
  description: '',
  documentation_url: '',
});

function Toast({ message, type, onClose }: { message: string; type: string; onClose: () => void }) {
  return (
    <div className={`toast-msg toast-${type} show`} style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 3000 }}>
      <i className={`fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}`} />
      {' '}{message}
    </div>
  );
}

export function ModuleMgmtPage() {
  const [modules, setModules] = useState<Module[]>(INITIAL_MODULES);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState<ModalState>({ open: false, mode: 'add' });
  const [form, setForm] = useState<FormState>(emptyForm());
  const [descLen, setDescLen] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  const filteredModules = searchQuery
    ? modules.filter(m => {
        const q = searchQuery.toLowerCase();
        return (
          m.solution_code.toLowerCase().includes(q) ||
          m.solution_name.toLowerCase().includes(q) ||
          m.module_code.toLowerCase().includes(q) ||
          m.module_name.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.module_lead.toLowerCase().includes(q)
        );
      })
    : modules;

  const showToast = (message: string, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAddModal = () => {
    setForm(emptyForm());
    setDescLen(0);
    setModal({ open: true, mode: 'add' });
  };

  const openEditModal = (id: string) => {
    const m = modules.find(x => x.solution_module_id === id);
    if (!m) return;
    setForm({
      solution_code: m.solution_code,
      solution_name: m.solution_name,
      module_code: m.module_code,
      module_name: m.module_name,
      module_version: m.module_version,
      module_lead: m.module_lead,
      description: m.description,
      documentation_url: m.documentation_url,
    });
    setDescLen(m.description.length);
    setModal({ open: true, mode: 'edit', editId: id });
  };

  const closeModal = () => setModal({ open: false, mode: 'add' });

  const handleSolutionChange = (code: string) => {
    const sol = SOLUTIONS.find(s => s.code === code);
    setForm(f => ({ ...f, solution_code: code, solution_name: sol?.name || '' }));
  };

  const saveModule = () => {
    if (!form.solution_code || !form.module_code || !form.module_name) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    const newModule: Module = {
      solution_module_id: `SM-${Date.now()}`,
      solution_code: form.solution_code,
      solution_name: form.solution_name,
      module_code: form.module_code,
      module_name: form.module_name,
      description: form.description,
      module_lead: form.module_lead,
      module_lead_email: '',
      module_version: form.module_version || 'v1.0.0',
      documentation_url: form.documentation_url,
      is_active: true,
    };
    setModules(prev => [...prev, newModule]);
    closeModal();
    showToast('Module added successfully');
  };

  const updateModule = () => {
    setModules(prev =>
      prev.map(m =>
        m.solution_module_id === modal.editId
          ? { ...m, ...form, module_version: form.module_version || m.module_version }
          : m
      )
    );
    closeModal();
    showToast('Module updated successfully');
  };

  const deleteModule = (id: string) => {
    if (window.confirm('Are you sure you want to delete this module?')) {
      setModules(prev => prev.filter(m => m.solution_module_id !== id));
      showToast('Module deleted');
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
            <h1>Module Management System</h1>
            <p className="page-subtitle">Manage your Solutions and Modules</p>
          </div>
          <button className="btn-primary" onClick={openAddModal}>
            <i className="fas fa-plus" /> Add New Module
          </button>
        </div>

        <div className="data-table-wrapper">
          <div className="table-toolbar">
            <div className="table-title">Module Listing</div>
            <span className="table-count">{filteredModules.length} modules found</span>
          </div>
          <div className="search-bar">
            <i className="fas fa-search" />
            <input
              type="text"
              placeholder="Search by Solution, Module Code, Name, Lead..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Solution Code</th>
                <th>Solution Name</th>
                <th>Module Code</th>
                <th>Module Name</th>
                <th>Description</th>
                <th>Module Lead</th>
                <th>Version</th>
                <th>Documentation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredModules.map(m => (
                <tr key={m.solution_module_id}>
                  <td><span className="code-badge">{m.solution_code}</span></td>
                  <td>{m.solution_name}</td>
                  <td><span className="code-badge module-code">{m.module_code}</span></td>
                  <td><strong>{m.module_name}</strong></td>
                  <td className="desc-cell">{m.description.substring(0, 40)}...</td>
                  <td>
                    {m.module_lead ? (
                      <span
                        className="module-lead-link"
                        onClick={() => copyEmail(m.module_lead_email)}
                        title="Click to copy email"
                      >
                        {m.module_lead}
                      </span>
                    ) : '-'}
                  </td>
                  <td><span className="version-badge">{m.module_version}</span></td>
                  <td>
                    {m.documentation_url
                      ? <a href="#" className="link-btn"><i className="fas fa-external-link-alt" /> View</a>
                      : '-'}
                  </td>
                  <td className="actions-cell">
                    <button className="icon-btn edit" onClick={() => openEditModal(m.solution_module_id)} title="Edit">
                      <i className="fas fa-pen" />
                    </button>
                    <button className="icon-btn delete" onClick={() => deleteModule(m.solution_module_id)} title="Delete">
                      <i className="fas fa-trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="table-footer">Showing {filteredModules.length} of {modules.length} modules</div>
        </div>
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal.mode === 'edit' ? 'Edit Module' : 'Add New Module'}</h3>
              <button className="modal-close" onClick={closeModal}><i className="fas fa-times" /></button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-row">
                  <div className="form-group">
                    <label>Solution Code *</label>
                    <select
                      value={form.solution_code}
                      onChange={e => handleSolutionChange(e.target.value)}
                      required
                    >
                      <option value="">Select Solution Code</option>
                      {SOLUTIONS.map(s => (
                        <option key={s.code} value={s.code}>{s.code}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Solution Name *</label>
                    <input type="text" value={form.solution_name} readOnly placeholder="Auto-filled" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Module Code *</label>
                    <input
                      type="text"
                      value={form.module_code}
                      onChange={e => setForm(f => ({ ...f, module_code: e.target.value }))}
                      placeholder="e.g., AGNT_HR"
                    />
                  </div>
                  <div className="form-group">
                    <label>Module Name *</label>
                    <input
                      type="text"
                      value={form.module_name}
                      onChange={e => setForm(f => ({ ...f, module_name: e.target.value }))}
                      placeholder="e.g., Agentic HR"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Module Version *</label>
                    <input
                      type="text"
                      value={form.module_version}
                      onChange={e => setForm(f => ({ ...f, module_version: e.target.value }))}
                      placeholder="e.g., v1.0.0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Module Lead <span className="optional">(optional)</span></label>
                    <input
                      type="text"
                      value={form.module_lead}
                      onChange={e => setForm(f => ({ ...f, module_lead: e.target.value }))}
                      placeholder="Enter module lead name"
                    />
                  </div>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Description *</label>
                  <textarea
                    value={form.description}
                    onChange={e => { setForm(f => ({ ...f, description: e.target.value })); setDescLen(e.target.value.length); }}
                    rows={3}
                    placeholder="Enter module description"
                    maxLength={255}
                  />
                  <span className="char-count">{descLen}/255</span>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Documentation URL</label>
                  <input
                    type="url"
                    value={form.documentation_url}
                    onChange={e => setForm(f => ({ ...f, documentation_url: e.target.value }))}
                    placeholder="https://docs.example.com/module"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn-primary" onClick={modal.mode === 'edit' ? updateModule : saveModule}>
                {modal.mode === 'edit' ? 'Save Changes' : 'Add Module'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}