// apps/web/src/features/module-mgmt/components/AddModuleDialog.tsx
// Add New Module modal — static UI. No backend integration.

import { useState } from 'react';
import {
  makeStyles,
  tokens,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Input,
  Dropdown,
  Option,
} from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';

const SOLUTION_OPTIONS = [
  { value: 'ADC', label: 'ADC' },
  { value: 'AIW', label: 'AIW' },
  { value: 'ACM', label: 'ACM' },
  { value: 'AES', label: 'AES' },
];

const useStyles = makeStyles({
  surface: {
    borderRadius: tokens.borderRadiusLarge,
    boxShadow: tokens.shadow64,
    padding: tokens.spacingVerticalXL,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacingVerticalL,
  },
  title: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  closeButton: {
    minWidth: '32px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: tokens.spacingHorizontalL,
    marginBottom: tokens.spacingVerticalM,
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },
  fullWidth: {
    gridColumn: '1 / -1',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  label: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  labelOptional: {
    fontWeight: tokens.fontWeightRegular,
    color: tokens.colorNeutralForeground2,
  },
  textareaWrapper: {
    position: 'relative',
  },
  textarea: {
    width: '100%',
    minHeight: '120px',
    resize: 'vertical',
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    fontSize: tokens.fontSizeBase300,
    fontFamily: 'inherit',
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
  },
  charCount: {
    position: 'absolute',
    bottom: tokens.spacingVerticalXS,
    right: tokens.spacingHorizontalS,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalL,
  },
});

export interface AddModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onAdd: () => void;
}

export function AddModuleDialog({ open, onOpenChange, onCancel, onAdd }: AddModuleDialogProps) {
  const styles = useStyles();
  const [description, setDescription] = useState('');

  const handleAdd = () => {
    console.log('Add Module clicked (static)');
    onAdd();
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const descLength = description.length;
  const maxDescLength = 255;

  return (
    <Dialog open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
      <DialogSurface className={styles.surface}>
        <DialogBody>
          <div className={styles.header}>
            <DialogTitle className={styles.title}>Add New Module</DialogTitle>
            <Button
              appearance="subtle"
              icon={<DismissRegular fontSize={20} />}
              aria-label="Close"
              onClick={handleClose}
              className={styles.closeButton}
            />
          </div>

          <DialogContent>
            <div className={styles.grid}>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="solution-code">
                  Solution Code *
                </label>
                <Dropdown
                  id="solution-code"
                  placeholder="Select Solution Code"
                  aria-label="Solution Code"
                >
                  {SOLUTION_OPTIONS.map((opt) => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Dropdown>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="solution-name">
                  Solution Name *
                </label>
                <Input
                  id="solution-name"
                  placeholder="Auto-filled"
                  disabled
                  aria-label="Solution Name"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="module-code">
                  Module Code *
                </label>
                <Input
                  id="module-code"
                  placeholder="e.g., AGNT_HR"
                  aria-label="Module Code"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="module-name">
                  Module Name *
                </label>
                <Input
                  id="module-name"
                  placeholder="e.g., Agentic HR"
                  aria-label="Module Name"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="module-version">
                  Module Version *
                </label>
                <Input
                  id="module-version"
                  placeholder="e.g., v1.0.0"
                  aria-label="Module Version"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="module-lead">
                  Module Lead <span className={styles.labelOptional}>(optional)</span>
                </label>
                <Input
                  id="module-lead"
                  placeholder="Enter module lead name"
                  aria-label="Module Lead"
                />
              </div>

              <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                <label className={styles.label} htmlFor="description">
                  Description *
                </label>
                <div className={styles.textareaWrapper}>
                  <textarea
                    id="description"
                    className={styles.textarea}
                    placeholder="Enter module description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={maxDescLength}
                    aria-label="Description"
                  />
                  <span className={styles.charCount}>
                    {descLength}/{maxDescLength}
                  </span>
                </div>
              </div>

              <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                <label className={styles.label} htmlFor="doc-url">
                  Documentation URL
                </label>
                <Input
                  id="doc-url"
                  placeholder="https://docs.example.com/module"
                  aria-label="Documentation URL"
                />
              </div>
            </div>
          </DialogContent>

          <DialogActions className={styles.footer}>
            <Button appearance="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button appearance="primary" onClick={handleAdd}>
              Add Module
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
