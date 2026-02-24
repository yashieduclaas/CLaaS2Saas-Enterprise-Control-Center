// ShieldIcon.tsx
// Renders a shield SVG using brand sunray colour
// Replaces FontAwesome — uses inline SVG per Fluent icon guidance

interface ShieldIconProps {
  size?: number;
  color?: string;
}

export function ShieldIcon({ size = 14, color = "#B3A125" }: ShieldIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"
        fill={color}
      />
    </svg>
  );
}
