// Kernel UI Palette — Fluent theme override
// Brand primary: #193e6b (midnight)

import { createLightTheme } from '@fluentui/react-components';
import type { BrandVariants } from '@fluentui/react-components';

/** Brand ramp derived from #193e6b (midnight) — Fluent 80 = primary */
const brandKernel: BrandVariants = {
  10: '#050d14',
  20: '#0a1622',
  30: '#0f1f30',
  40: '#122a42',
  50: '#153554',
  60: '#184066',
  70: '#1a4a78',
  80: '#193e6b',  // primary — Kernel midnight
  90: '#1e4d85',
  100: '#2d5d94',
  110: '#4a7aa8',
  120: '#6b95bc',
  130: '#8fb0d0',
  140: '#b3cce4',
  150: '#d4e4f2',
  160: '#eef5fb',
};

/** Light theme with Kernel brand (midnight #193e6b) */
export const kernelLightTheme = createLightTheme(brandKernel);
