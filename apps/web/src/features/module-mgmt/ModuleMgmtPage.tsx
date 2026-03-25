// apps/web/src/features/module-mgmt/ModuleMgmtPage.tsx
// Module Management System — static UI. Renders inside AppLayout.

import { useState } from 'react';
import { useModules, useRegisterModule, useUpdateModule } from './api/useModules';

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

function Toast({ message, type }: { message: string; type: string }) {
  return (
    <div className={`toast-msg toast-${type} show`} style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 3000 }}>
      <i className={`fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}`} />
      {' '}{message}
    </div>
  );
}

export function ModuleMgmtPage() {
  const { data: modulesData = [], isLoading } = useModules();
  const registerMutation = useRegisterModule();
  const updateMutation = useUpdateModule();

  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState<ModalState>({ open: false, mode: 'add' });
  const [form, setForm] = useState<FormState>(emptyForm());
  const [descLen, setDescLen] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  const modules: Module[] = modulesData.map((m) => ({
    solution_module_id: `${m.solutionCode}:${m.moduleCode}`,
    solution_code: m.solutionCode,
    solution_name: SOLUTIONS.find((s) => s.code === m.solutionCode)?.name ?? m.solutionCode,
    module_code: m.moduleCode,
    module_name: m.moduleName,
    description: m.description,
    module_lead: m.moduleLead,
    module_lead_email: m.moduleLeadEmail,
    module_version: m.moduleVersion || 'v1.0.0',
    documentation_url: m.baseUrl,
    is_active: true,
  }));

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

  const saveModule = async () => {
    if (!form.solution_code || !form.module_code || !form.module_name) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    try {
      await registerMutation.mutateAsync({
        solutionCode: form.solution_code,
        moduleCode: form.module_code,
        moduleName: form.module_name,
        description: form.description,
        baseUrl: form.documentation_url,
        moduleLead: form.module_lead,
        moduleLeadEmail: '',
        moduleVersion: form.module_version || 'v1.0.0',
      });
      closeModal();
      showToast('Module added successfully');
    } catch {
      showToast('Failed to add module', 'error');
    }
  };

  const updateModule = async () => {
    const existing = modules.find((m) => m.solution_module_id === modal.editId);
    if (!existing) {
      showToast('Module not found', 'error');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        solutionCode: existing.solution_code,
        moduleCode: existing.module_code,
        moduleName: form.module_name,
        description: form.description,
        baseUrl: form.documentation_url,
        moduleLead: form.module_lead,
        moduleLeadEmail: existing.module_lead_email,
        moduleVersion: form.module_version || existing.module_version,
      });
      closeModal();
      showToast('Module updated successfully');
    } catch {
      showToast('Failed to update module', 'error');
    }
  };

  const deleteModule = () => {
    if (window.confirm('Delete is not implemented yet in backend API.')) {
      showToast('Delete API not implemented yet', 'info');
    }
  };

  const copyEmail = (email: string) => {
    if (!email) { showToast('No email available', 'info'); return; }
    navigator.clipboard.writeText(email)
      .then(() => showToast('Email copied to clipboard', 'success'))
      .catch(() => showToast('Failed to copy email', 'error'));
  };

  return (
    <div className="center-stage feature-page feature-page-contained">
      <div className="page-content page-content-contained">
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
          <div className="search-bar">
            <i className="fas fa-search" />
            <input
              type="text"
              placeholder="Search by Solution, Module Code, Name, Lead..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="table-scroll-wrapper">
            {isLoading ? (
              <div className="table-footer">Loading modules...</div>
            ) : (
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
                      <button className="icon-btn delete" onClick={() => deleteModule()} title="Delete">
                        <i className="fas fa-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
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

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}