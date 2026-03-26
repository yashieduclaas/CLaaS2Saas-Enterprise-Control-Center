// apps/web/src/app/TopBar.tsx
// Vanilla Navbar — plain HTML + CSS. No Fluent. No Demo.

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getRoutePath } from '@/rbac/RoutePermissionMap';
import { useAuth } from '@/auth/useAuth';
import './topbar-vanilla.css';

const ENVIRONMENTS = [
  'CLaaS2SaaS default',
  'CLaaS2SaaS testing',
  'CLaaS2SaaS production',
  'CLaaS2SaaS development',
];

function getInitials(displayName: string | null): string {
  if (!displayName || !displayName.trim()) return '?';
  const parts = displayName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return displayName.slice(0, 2).toUpperCase();
}

function getRoleLabel(displayName: string | null): string {
  if (!displayName) return 'User';
  if (displayName.includes('Global Admin')) return 'Global Admin';
  if (displayName.includes('Security Admin')) return 'Security Admin';
  if (displayName.includes('Module Admin')) return 'Module Admin';
  if (displayName.includes('Help Desk')) return 'Help Desk';
  if (displayName.includes('Standard User')) return 'Standard User';
  if (displayName.includes('No Role')) return 'No Role';
  return 'User';
}

export function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { displayName } = useAuth();

  const context = location.pathname.startsWith('/ecc') ? 'ecc' : 'kernel';

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [envOpen, setEnvOpen] = useState(false);
  const [currentEnvironment, setCurrentEnvironment] = useState(() =>
    typeof window !== 'undefined'
      ? (localStorage.getItem('selectedEnvironment') || 'CLaaS2SaaS default')
      : 'CLaaS2SaaS default'
  );

  const initials = getInitials(displayName);
  const roleLabel = getRoleLabel(displayName);
  const unreadCount = 0;
  const notifications: { notification_id: string }[] = [];

  const environmentList = ENVIRONMENTS.filter((env) => env !== currentEnvironment);

  function selectEnvironment(env: string) {
    localStorage.setItem('selectedEnvironment', env);
    setCurrentEnvironment(env);
    setEnvOpen(false);
  }

  const toggleEnvPanel = () => {
    setEnvOpen((prev) => !prev);
    setUserMenuOpen(false);
    setNotificationOpen(false);
  };

  const toggleNotificationPanel = () => {
    setNotificationOpen((prev) => !prev);
    setUserMenuOpen(false);
    setEnvOpen(false);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen((prev) => !prev);
    setNotificationOpen(false);
    setEnvOpen(false);
  };

  const handleNotificationClick = (n: { notification_id: string }) => {
    setNotificationOpen(false);
    navigate(getRoutePath('admin-access-requests'));
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    navigate(getRoutePath('login'));
  };

  useEffect(() => {
    if (!envOpen) return;
    const timeout = setTimeout(() => {
      function handleOutsideClick(e: MouseEvent) {
        const target = e.target as HTMLElement;
        if (!target.closest('.env-panel') && !target.closest('.nav-env-banner')) {
          setEnvOpen(false);
        }
      }
      document.addEventListener('click', handleOutsideClick);
      return () => document.removeEventListener('click', handleOutsideClick);
    }, 10);
    return () => clearTimeout(timeout);
  }, [envOpen]);

  useEffect(() => {
    if (!userMenuOpen && !notificationOpen) return;
    function handleOutsideClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (
        !target.closest('.nav-user') &&
        !target.closest('.user-dropdown') &&
        !target.closest('.nav-notification-wrapper')
      ) {
        setUserMenuOpen(false);
        setNotificationOpen(false);
      }
    }
    const timeout = setTimeout(() => {
      document.addEventListener('click', handleOutsideClick);
    }, 10);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [userMenuOpen, notificationOpen]);

  return (
    <nav className="top-nav" role="navigation">
      <div className="nav-left">
        <div
          className="nav-brand"
          onClick={() => navigate(getRoutePath('ecc'))}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(getRoutePath('ecc')); }}
        >
          <span className="brand-c">C</span>
          <span className="brand-l">L</span>
          <span className="brand-a1">a</span>
          <span className="brand-a2">a</span>
          <span className="brand-s1">S</span>
          <span className="brand-2">2</span>
          <span className="brand-s2">S</span>
          <span className="brand-a3">a</span>
          <span className="brand-a4">a</span>
          <span className="brand-s3">S</span>
        </div>

        <span className="nav-separator">|</span>

        {context === 'ecc' ? (
          <span className="nav-context-label">Enterprise Control Centre</span>
        ) : (
          <span
            className="nav-context-label"
            style={{ cursor: 'pointer' }}
            // when in kernel context the header should take user to the landing
            // page where the "Welcome, how can I help?" search UI lives. that
            // page lives at /scc (pageKey 'scc-dashboard'), not /kernel. the
            // previous implementation pointed at kernel-dashboard which is the
            // actual SCC dashboard behind the nav.
            onClick={() => navigate(getRoutePath('scc-dashboard'))}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(getRoutePath('scc-dashboard')); }}
          >
            Kernel Apps
          </span>
        )}
      </div>

      <div className="nav-search-wrapper">
        <div className="nav-search-bar">
          <i className="fas fa-search nav-search-icon" aria-hidden />
          <input
            type="text"
            className="nav-search-input"
            placeholder="Search Modules..."
            aria-label="Search Modules"
          />
          <span className="nav-search-role-badge">
            <i className="fas fa-user" aria-hidden /> {roleLabel}
          </span>
        </div>
      </div>

      <div className="nav-right">
        <div
          className="nav-env-banner"
          onClick={toggleEnvPanel}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleEnvPanel(); }}
          role="button"
          tabIndex={0}
          title="Select environment"
        >
          <i className="fas fa-globe nav-env-icon" aria-hidden />
          <div className="nav-env-text">
            <span className="nav-env-label">Environment</span>
            <span className="nav-env-name">{currentEnvironment}</span>
          </div>
        </div>

        <div className="nav-notification-wrapper">
          <button
            type="button"
            className="nav-icon-btn"
            title="Notifications"
            onClick={toggleNotificationPanel}
          >
            <i className="fas fa-bell" aria-hidden />
            {unreadCount > 0 && (
              <span className="badge-dot">{unreadCount}</span>
            )}
          </button>

          <div
            id="notification-panel"
            className={`notification-panel ${notificationOpen ? '' : 'd-none'}`}
          >
            <div className="notification-panel-header">Notifications</div>
            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="notification-empty">No new notifications</div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.notification_id}
                    type="button"
                    className="notification-item"
                    onClick={() => handleNotificationClick(n)}
                  >
                    <i className="fas fa-key" aria-hidden />
                    New access request
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <button type="button" className="nav-icon-btn" title="Settings">
          <i className="fas fa-gear" aria-hidden />
        </button>

        <button type="button" className="nav-icon-btn nav-copilot-btn" title="Copilot">
          <img src="/assets/icons/copilot.png" alt="Copilot" className="copilot-icon" />
        </button>

        <div
          className="nav-user"
          onClick={toggleUserMenu}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleUserMenu(); }}
          role="button"
          tabIndex={0}
        >
          <span className="user-avatar">{initials}</span>
        </div>

        <div
          id="user-dropdown"
          className={`user-dropdown ${userMenuOpen ? '' : 'd-none'}`}
        >
          <div className="dropdown-user-header">
            <span className="dropdown-avatar">{initials}</span>
            <div className="dropdown-user-info">
              <span className="dropdown-user-name">{displayName || 'User'}</span>
              <span className="dropdown-user-role">{roleLabel}</span>
            </div>
          </div>
          <div className="dropdown-divider" />
          <button type="button" onClick={() => { setUserMenuOpen(false); navigate(getRoutePath('user-profile')); }}>
            <i className="fas fa-user" aria-hidden /> My Profile
          </button>
          <button type="button" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt" aria-hidden /> Logout
          </button>
          <button type="button" onClick={() => window.location.reload()}>
            <i className="fas fa-database" aria-hidden /> Reset Data
          </button>
        </div>
      </div>

      <div
        id="env-panel"
        className={`env-panel ${envOpen ? '' : 'd-none'}`}
      >
        <div className="env-panel-header">
          <h3>Select environment</h3>
          <button type="button" onClick={toggleEnvPanel} className="env-panel-close" aria-label="Close">
            <i className="fas fa-times" aria-hidden />
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
          {environmentList.map((env) => (
            <button
              key={env}
              type="button"
              className="env-item"
              onClick={() => selectEnvironment(env)}
            >
              {env}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
