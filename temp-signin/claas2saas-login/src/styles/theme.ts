import { BrandVariants, createLightTheme, Theme } from "@fluentui/react-components";

// CLaaS2SaaS brand palette mapped to Fluent Design Token ramp
const claas2SaaSBrand: BrandVariants = {
  10:  "#0a1a2e",
  20:  "#0d2440",
  30:  "#102d52",
  40:  "#133664",
  50:  "#163f76",  // darkest variant
  60:  "#193e6b",  // --color-primary-midnight (primary)
  70:  "#1e4d85",
  80:  "#245c9f",
  90:  "#2a6bb9",
  100: "#3079cc",
  110: "#4d8ed4",
  120: "#6aa3dc",
  130: "#87b8e4",
  140: "#a4cded",
  150: "#c1e2f5",
  160: "#dff6ff",
};

export const claas2SaaSTheme: Theme = {
  ...createLightTheme(claas2SaaSBrand),

  // Override specific tokens to match brand exactly
  colorBrandBackground:         "#193e6b",  // midnight blue - buttons
  colorBrandBackgroundHover:    "#1e4d85",
  colorBrandBackgroundPressed:  "#102d52",
  colorBrandForeground1:        "#193e6b",
  colorBrandForeground2:        "#B3A125",  // gold

  // Neutral surface tokens
  colorNeutralBackground1:      "#EEE7E0",  // platinum beige - page bg
  colorNeutralBackground2:      "#FFFFFF",  // white - card surface
  colorNeutralBackground3:      "#E8E0D8",

  // Text
  colorNeutralForeground1:      "#193e6b",
  colorNeutralForeground2:      "#2c4f7c",
  colorNeutralForeground3:      "#5a7a9e",
  colorNeutralForeground4:      "#8a9db5",

  // Status - use sunray for info/warning
  colorStatusWarningBackground1: "#E9AC53",
  colorStatusWarningForeground1: "#B3A125",
};

// Brand color constants for use in components
export const brand = {
  midnight:  "#193e6b",
  gold:      "#B3A125",
  sunray:    "#E9AC53",
  beige:     "#EEE7E0",
  white:     "#FFFFFF",
} as const;
