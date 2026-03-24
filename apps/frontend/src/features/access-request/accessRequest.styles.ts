// apps/web/src/features/access-request/accessRequest.styles.ts
// Vanilla spec — exact pixel values, no tokens.

import { makeStyles } from '@fluentui/react-components';

export const useAccessRequestStyles = makeStyles({
  centerStage: {
    width: '100%',
    minHeight: '100%',
    background: '#EEE7E0',
    padding: '30px',
    fontFamily: 'Montserrat, sans-serif',
  },
  pageHeader: {
    marginBottom: '24px',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#193e6b',
    fontFamily: 'Montserrat, sans-serif',
    margin: 0,
  },
  pageSubtitle: {
    fontSize: '15px',
    color: '#666',
    margin: 0,
  },
  accessRequestCard: {
    background: '#FFFFFF',
    padding: '28px',
    borderRadius: '12px',
    boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
    maxWidth: '640px',
  },
  formGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#193e6b',
    fontFamily: 'Montserrat, sans-serif',
  },
  labelOptional: {
    color: '#999',
    fontWeight: 400,
  },
  input: {
    fontSize: '14px',
    padding: '10px 14px',
    border: '1px solid rgba(0,0,0,0.12)',
    borderRadius: '6px',
    fontFamily: 'inherit',
    outline: 'none',
    ':focus': {
      boxShadow: '0 0 0 3px rgba(179,161,37,0.15)',
    },
  },
  inputReadonly: {
    background: '#f5f5f5',
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  textarea: {
    fontSize: '14px',
    padding: '10px 14px',
    border: '1px solid rgba(0,0,0,0.12)',
    borderRadius: '6px',
    fontFamily: 'inherit',
    outline: 'none',
    resize: 'vertical' as const,
    minHeight: '80px',
    ':focus': {
      boxShadow: '0 0 0 3px rgba(179,161,37,0.15)',
    },
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  btnPrimary: {
    background: '#193e6b',
    color: '#FFFFFF',
    padding: '10px 18px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.2s, transform 0.2s',
    ':hover': {
      background: '#142a53',
      transform: 'translateY(-1px)',
    },
  },
  btnSecondary: {
    background: 'rgba(0,0,0,0.05)',
    color: '#555',
    padding: '10px 18px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.2s',
    ':hover': {
      background: 'rgba(0,0,0,0.1)',
    },
  },
  toast: {
    position: 'fixed' as const,
    bottom: '24px',
    right: '24px',
    padding: '12px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    fontFamily: 'Montserrat, sans-serif',
    boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
    zIndex: 9999,
    maxWidth: '320px',
  },
  toastError: {
    background: '#dc3545',
    color: '#FFFFFF',
  },
  toastSuccess: {
    background: '#28a745',
    color: '#FFFFFF',
  },
});
