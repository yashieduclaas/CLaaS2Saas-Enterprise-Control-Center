// LoginPage.tsx
// CLaaS2SaaS Enterprises — Enterprise Control Center
// Sign-in page using:
//   - Microsoft Fluent UI React v9 (Button, Text, Spinner)
//   - Fluent System Icons (ShieldCheckmark, ArrowRight)
//   - MSAL.js hook for Microsoft Entra ID authentication
//   - CSS Modules for scoped brand styling

import {
  Button,
  Spinner,
  Text,
} from "@fluentui/react-components";
import {
  ArrowRightRegular,
  ShieldCheckmarkRegular,
} from "@fluentui/react-icons";
import { MicrosoftLogo } from "./MicrosoftLogo";
import { useAuth } from "./useAuth";
import styles from "../styles/LoginPage.module.css";

// Feature bullet data
const FEATURES = [
  "Unified cloud lifecycle management across all SaaS workloads",
  "Real-time governance, compliance and audit dashboards",
  "Secure single sign-on via Microsoft 365 identity",
] as const;

export function LoginPage() {
  const { signIn, isLoading, error } = useAuth();

  return (
    <div className={styles.pageRoot} role="main">

      {/* ── Left branding panel ── */}
      <aside className={styles.panelLeft} aria-label="CLaaS2SaaS brand panel">
        <div className={styles.circleInner} aria-hidden="true" />

        <div className={styles.brandLockup}>
          {/* "Enterprise Platform" eyebrow */}
          <Text
            as="span"
            className={styles.enterpriseLabel}
            aria-label="Enterprise Platform"
          >
            Enterprise Platform
          </Text>

          {/* CLaaS2SaaS logotype */}
          <h1 className={styles.brandName} aria-label="CLaaS2SaaS">
            CL<span className={styles.gold}>aa</span>S2S<span className={styles.gold}>aa</span>S
          </h1>

          <Text as="p" className={styles.brandSub}>
            Enterprises
          </Text>

          <div className={styles.divider} aria-hidden="true" />

          {/* Access portal label */}
          <Text as="span" className={styles.accessLabel}>
            Access Portal
          </Text>

          {/* Enterprise Control Center heading */}
          <h2 className={styles.controlTitle}>
            Enterprise<br />
            <em>Control Center</em>
          </h2>
        </div>

        {/* Feature list */}
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

          {/* Eyebrow */}
          <Text as="p" className={styles.cardEyebrow}>
            Secure Access
          </Text>

          {/* Heading */}
          <h2 className={styles.cardHeading}>
            Sign in to<br />Enterprise Control Center
          </h2>

          {/* Description */}
          <Text as="p" className={styles.cardDesc}>
            Use your Microsoft 365 enterprise credentials to access
            the CLaaS2SaaS management portal.
          </Text>

          {/* Error state */}
          {error && (
            <Text
              as="p"
              style={{
                color: "#991547",
                fontSize: "13px",
                marginBottom: "16px",
                fontFamily: "'Source Sans 3', sans-serif",
              }}
              role="alert"
            >
              {error}
            </Text>
          )}

          {/* Microsoft 365 Sign-in button — Fluent UI Button component */}
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
            {isLoading ? "Signing in…" : "Sign in with Microsoft 365"}
            {!isLoading && (
              <ArrowRightRegular
                className={styles.btnArrow}
                aria-hidden="true"
              />
            )}
          </Button>

          {/* Secure access notice */}
          <div className={styles.secureNotice} aria-live="polite">
            <ShieldCheckmarkRegular
              style={{ width: 14, height: 14, color: "#B3A125" }}
              aria-hidden="true"
            />
            <Text as="span" style={{ color: "#B3A125", fontSize: "12px", fontWeight: 600 }}>
              Your Microsoft 365 account provides secure access
            </Text>
          </div>

        </div>
      </section>

    </div>
  );
}
