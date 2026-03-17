import { useState, useEffect } from "react";
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogActions,
  Button,
  Input,
  Select,
  Label,
} from "@fluentui/react-components";
import { DismissRegular } from "@fluentui/react-icons";

import type { SecurityRole } from "../types/securityRole";
import styles from "./AddSecurityRoleModal.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (role: SecurityRole) => void;
}

interface FormState {
  solution: string;
  module: string;
  roleCode: string;
  roleName: string;
  roleType: string;
}

const INITIAL_FORM: FormState = {
  solution: "",
  module: "",
  roleCode: "",
  roleName: "",
  roleType: "Custom Role",
};

const SOLUTION_OPTIONS = [
  { code: "AIW", name: "Agentic Intelligent Workplace" },
  { code: "AESS", name: "Agentic ERP & Shared Services" },
  { code: "ADLT", name: "Adaptive Learning & Talent" },
  { code: "ACRM", name: "Agentic CRM & Marketer" },
];

const MODULE_OPTIONS: Record<string, string[]> = {
  AIW: ["AIW"],
  AESS: ["AESS"],
  ADLT: ["ADLT"],
  ACRM: ["ACRM"],
};

const ROLE_CODES = [
  "GLOBAL_ADMIN",
  "ADMIN",
  "CONTRIBUTOR",
  "VIEWER",
  "CUSTOM_ROLE_01",
  "CUSTOM_ROLE_02",
];

export function AddSecurityRoleModal({ open, onClose, onCreated }: Props) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  useEffect(() => {
    if (open) setForm(INITIAL_FORM);
  }, [open]);

  const availableModules = form.solution
    ? MODULE_OPTIONS[form.solution] ?? []
    : [];

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    const newRole: SecurityRole = {
      id: crypto.randomUUID(),
      solutionCode: form.solution,
      solutionName: form.solution,
      moduleCode: form.module,
      moduleName: form.module,
      roleCode: form.roleCode,
      roleName: form.roleName,
      roleType: form.roleType === "System Role" ? "SYSTEM" : "CUSTOM",
    };

    onCreated(newRole);
    onClose();
  }

  return (
    <Dialog open={open}>
      <DialogSurface className={styles.surface}>
        <DialogBody>

          <div className={styles.layout}>

            {/* LEFT TITLE BLOCK */}
           <div className={styles.header}>
  <div className={styles.titleWrapper}>
    <h2 className={styles.title}>Add New Security Role</h2>

    <Button
      appearance="subtle"
      icon={<DismissRegular />}
      onClick={onClose}
      className={styles.closeBtn}
    />
  </div>
</div>

            {/* RIGHT FORM AREA */}
            <div className={styles.formArea}>

                <div className={styles.grid}>

                {/* Solution */}
                <div className={styles.field}>
                  <Label>Solution *</Label>
                  <Select
                    value={form.solution}
                    onChange={(_, d) => {
                      setField("solution", d.value);
                      setField("module", "");
                    }}
                  >
                    <option value="">Select Solution</option>
                    {SOLUTION_OPTIONS.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Module */}
                <div className={styles.field}>
                  <Label>Module *</Label>
                  <Select
                    value={form.module}
                    disabled={!form.solution}
                    onChange={(_, d) => setField("module", d.value)}
                  >
                    <option value="">Select Module</option>
                    {availableModules.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Role Code */}
                <div className={styles.field}>
                  <Label>Role Code *</Label>
                  <Select
                    value={form.roleCode}
                    onChange={(_, d) => setField("roleCode", d.value)}
                  >
                    <option value="">Select Role Code</option>
                    {ROLE_CODES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Role Name */}
                <div className={styles.field}>
                  <Label>Role Name *</Label>
                  <Input
                    placeholder="e.g. Administrator"
                    value={form.roleName}
                    onChange={(_, d) => setField("roleName", d.value)}
                  />
                </div>

                {/* Role Type */}
                <div className={styles.field}>
                  <Label>Role Type *</Label>
                  <Select
                    value={form.roleType}
                    onChange={(_, d) => setField("roleType", d.value)}
                  >
                    <option value="Custom Role">Custom Role</option>
                    <option value="System Role">System Role</option>
                  </Select>
                </div>

              </div>

              <DialogActions className={styles.footer}>
                <Button appearance="secondary" onClick={onClose}>
                  Cancel
                </Button>

                <Button appearance="primary" onClick={handleSubmit}>
                  Add Role
                </Button>
              </DialogActions>

            </div>
          </div>

        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}