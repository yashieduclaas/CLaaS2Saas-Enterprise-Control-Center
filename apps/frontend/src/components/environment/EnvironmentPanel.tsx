// apps/web/src/components/environment/EnvironmentPanel.tsx
// Fixed slide-in panel — matches Vanilla behavior.

import { useEffect } from 'react';

const ENVIRONMENTS = [
  'CLaaS2SaaS default',
  'CLaaS2SaaS testing',
  'CLaaS2SaaS production',
  'CLaaS2SaaS development',
];

interface Props {
  isOpen: boolean;
  currentEnv: string;
  onClose: () => void;
  onSelect: (env: string) => void;
}

export default function EnvironmentPanel({
  isOpen,
  currentEnv,
  onClose,
  onSelect,
}: Props) {
  const visibleEnvs = ENVIRONMENTS.filter((env) => env !== currentEnv);

  useEffect(() => {
    if (!isOpen) return;

    const timeout = setTimeout(() => {
      function handleOutsideClick(e: MouseEvent) {
        const target = e.target as HTMLElement;
        if (
          !target.closest('.env-panel') &&
          !target.closest('.nav-env-banner')
        ) {
          onClose();
        }
      }

      document.addEventListener('click', handleOutsideClick);
      return () => document.removeEventListener('click', handleOutsideClick);
    }, 10);

    return () => clearTimeout(timeout);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="env-panel">
      <div className="env-panel-header">
        <h3>Select environment</h3>
        <button
          type="button"
          className="env-panel-close"
          onClick={onClose}
          aria-label="Close environment panel"
        >
          ✕
        </button>
      </div>

      <p className="env-panel-desc">
        Spaces to create, store, and work with data and apps.
        <br />
        <a href="#" className="env-learn-more" onClick={(e) => e.preventDefault()}>
          Learn more
        </a>
      </p>

      <div className="env-list">
        {visibleEnvs.map((env) => (
          <div
            key={env}
            role="button"
            tabIndex={0}
            className="env-item"
            onClick={() => onSelect(env)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(env);
              }
            }}
          >
            <span>{env}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
