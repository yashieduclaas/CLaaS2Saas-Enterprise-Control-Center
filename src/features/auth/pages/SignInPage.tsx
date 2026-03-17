// features/auth/pages/SignInPage.tsx
// CLaaS2SaaS Enterprise Control Center — Sign-In page
// Migrated from claas2saas-login archive.
// Uses: Fluent UI v9, CSS Modules, useLogin hook (no direct service calls).
// Renders outside AppLayout — no sidebar, no NavRail.

import { Button, Spinner, Text } from '@fluentui/react-components';
import { ArrowRightRegular, ShieldCheckmarkRegular } from '@fluentui/react-icons';
import { MicrosoftLogo } from '../components/MicrosoftLogo';
import { useLogin } from '../hooks/useLogin';
import styles from './SignInPage.module.css';

const FEATURES = [
    'Unified cloud lifecycle management across all SaaS workloads',
    'Real-time governance, compliance and audit dashboards',
    'Secure single sign-on via Microsoft 365 identity',
] as const;

export function SignInPage() {
    const { signIn, isLoading, error } = useLogin();

    return (
        <div className={styles.pageRoot} role="main">

            {/* ── Left branding panel ── */}
            <aside className={styles.panelLeft} aria-label="CLaaS2SaaS brand panel">
                <div className={styles.circleInner} aria-hidden="true" />

                <div className={styles.brandLockup}>
                    <Text as="span" className={styles.enterpriseLabel} aria-label="Enterprise Platform">
                        Enterprise Platform
                    </Text>

                    <h1 className={styles.brandName} aria-label="CLaaS2SaaS">
                        CL<span className={styles.gold}>aa</span>S2S<span className={styles.gold}>aa</span>S
                    </h1>

                    <Text as="p" className={styles.brandSub}>
                        Enterprises
                    </Text>

                    <div className={styles.divider} aria-hidden="true" />

                    <Text as="span" className={styles.accessLabel}>
                        Access Portal
                    </Text>

                    <h2 className={styles.controlTitle}>
                        Enterprise<br />
                        <em>Control Center</em>
                    </h2>
                </div>

                <ul className={styles.featureList} aria-label="Platform features">
                    {FEATURES.map((text, i) => (
                        <li key={i} className={styles.featureItem}>
                            <span className={styles.featureDot} aria-hidden="true" />
                            <Text as="span" className={styles.featureText}>{text}</Text>
                        </li>
                    ))}
                </ul>
            </aside>

            {/* ── Right login panel ── */}
            <section className={styles.panelRight} aria-label="Sign in">
                <div className={styles.loginCard} role="region" aria-label="Sign in form">

                    <Text as="p" className={styles.cardEyebrow}>
                        Secure Access
                    </Text>

                    <h2 className={styles.cardHeading}>
                        Sign in to<br />Enterprise Control Center
                    </h2>

                    <Text as="p" className={styles.cardDesc}>
                        Use your Microsoft 365 enterprise credentials to access
                        the CLaaS2SaaS management portal.
                    </Text>

                    {error && (
                        <Text as="p" className={styles.errorText} role="alert">
                            {error}
                        </Text>
                    )}

                    <Button
                        className={styles.msButton}
                        appearance="primary"
                        size="large"
                        onClick={signIn}
                        disabled={isLoading}
                        aria-label="Sign in with Microsoft 365"
                        icon={
                            isLoading
                                ? <Spinner size="tiny" appearance="inverted" />
                                : <MicrosoftLogo size={20} />
                        }
                        iconPosition="before"
                    >
                        {isLoading ? 'Signing in…' : 'Sign in with Microsoft 365'}
                        {!isLoading && (
                            <ArrowRightRegular className={styles.btnArrow ?? ''} aria-hidden="true" />
                        )}
                    </Button>

                    <div className={styles.secureNotice} aria-live="polite">
                        <ShieldCheckmarkRegular
                            style={{ width: 14, height: 14, color: 'var(--color-brand-accent)' }}
                            aria-hidden="true"
                        />
                        <Text as="span" style={{ color: 'var(--color-brand-accent)', fontSize: '12px', fontWeight: 600 }}>
                            Your Microsoft 365 account provides secure access
                        </Text>
                    </div>

                </div>
            </section>

        </div>
    );
}
