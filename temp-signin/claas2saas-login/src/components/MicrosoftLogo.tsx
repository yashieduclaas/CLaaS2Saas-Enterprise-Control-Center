// MicrosoftLogo.tsx
// Renders the official 4-square Microsoft logo as an inline SVG
// Used alongside MSAL sign-in flow

interface MicrosoftLogoProps {
  size?: number;
}

export function MicrosoftLogo({ size = 20 }: MicrosoftLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 21 21"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="1"  y="1"  width="9" height="9" fill="#F25022" />
      <rect x="11" y="1"  width="9" height="9" fill="#7FBA00" />
      <rect x="1"  y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}
