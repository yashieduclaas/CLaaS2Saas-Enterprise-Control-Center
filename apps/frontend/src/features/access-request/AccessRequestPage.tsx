// apps/web/src/features/access-request/AccessRequestPage.tsx
// Vanilla spec — pixel-for-pixel match. No Fluent UI. ECC header via EccLayout.

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAccessRequestStyles } from './accessRequest.styles';
import { getRoutePath } from '@/rbac/RoutePermissionMap';
import type { CreateAccessRequestDTO } from './accessRequest.types';

async function submitAccessRequest(data: CreateAccessRequestDTO): Promise<void> {
  console.log('[AccessRequest] submitAccessRequest', data);
  return Promise.resolve();
}

export function AccessRequestPage() {
  const styles = useAccessRequestStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const { appId = '', appName = '' } = (location.state as { appId?: string; appName?: string }) || {};

  const [reason, setReason] = useState('');
  const [justification, setJustification] = useState('');
  const [durationNeeded, setDurationNeeded] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const showToast = useCallback((message: string, type: 'error' | 'success') => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!appId && !appName) {
      navigate(getRoutePath('ecc'), { replace: true });
    }
  }, [appId, appName, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || !justification.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    try {
      const requestData: CreateAccessRequestDTO = {
        appId,
        appName,
        reason: reason.trim(),
        businessJustification: justification.trim(),
      };
      if (durationNeeded.trim()) {
        requestData.durationNeeded = durationNeeded.trim();
      }
      await submitAccessRequest(requestData);
      showToast('Access request submitted successfully', 'success');
      navigate(getRoutePath('ecc'));
    } catch {
      showToast('Request failed. Please try again.', 'error');
    }
  };

  const handleCancel = () => {
    navigate(getRoutePath('ecc'));
  };

  if (!appId && !appName) {
    return null;
  }

  return (
    <div className={`${styles.centerStage} center-stage feature-page`}>
      <div className="page-content">
        <header className={`${styles.pageHeader} page-header`}>
          <h1 className={styles.pageTitle}>Request Access</h1>
          <p className={`${styles.pageSubtitle} page-subtitle`}>
            Request access to an application you do not have permissions for.
          </p>
        </header>

        <div className={`${styles.accessRequestCard} access-request-card`}>
          <form
            className={`${styles.formGrid} form-grid`}
            onSubmit={handleSubmit}
            noValidate
          >
            {/* 1. Application Name — readonly, prefilled */}
            <div className={`${styles.formGroup} form-group`}>
              <label htmlFor="app-name" className={styles.label}>
                Application Name
              </label>
              <input
                id="app-name"
                type="text"
                readOnly
                value={appName}
                className={`${styles.input} ${styles.inputReadonly}`}
                aria-readonly
              />
            </div>

            {/* 2. Reason for Access * — required */}
            <div className={`${styles.formGroup} form-group`}>
              <label htmlFor="reason" className={styles.label}>
                Reason for Access *
              </label>
              <textarea
                id="reason"
                rows={3}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={styles.textarea}
                placeholder="Describe why you need access..."
              />
            </div>

            {/* 3. Business Justification * — required */}
            <div className={`${styles.formGroup} form-group`}>
              <label htmlFor="justification" className={styles.label}>
                Business Justification *
              </label>
              <textarea
                id="justification"
                rows={3}
                required
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                className={styles.textarea}
                placeholder="Provide business justification..."
              />
            </div>

            {/* 4. Duration Needed — optional */}
            <div className={`${styles.formGroup} form-group`}>
              <label htmlFor="duration" className={styles.label}>
                Duration Needed <span className={styles.labelOptional}>(optional)</span>
              </label>
              <input
                id="duration"
                type="text"
                value={durationNeeded}
                onChange={(e) => setDurationNeeded(e.target.value)}
                className={styles.input}
                placeholder="e.g. 6 months, Permanent"
              />
            </div>

            <div className={`${styles.formActions} form-actions`}>
              <button type="submit" className={styles.btnPrimary}>
                Submit
              </button>
              <button type="button" className={styles.btnSecondary} onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : styles.toastSuccess}`}
          role="alert"
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
