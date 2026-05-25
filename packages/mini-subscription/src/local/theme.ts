// Local theme — minimal subset duplicated from the host's theme tokens.
//
// We can't reliably import from `host/theme` via Module Federation because
// the federation runtime re-evaluates the host's theme module in a separate
// chunk, triggering Hermes EXC_BAD_ACCESS crashes on iOS production builds.
//
// Theme MODE (light/dark) still comes from the host's Redux store via
// `useSelector` (react-redux IS a true shared singleton). Theme TOKENS
// (color values, spacing, etc.) are duplicated here as static constants —
// they change rarely; when they do, redeploy the mini bundle.
import {useSelector} from 'react-redux';

type ThemeMode = 'light' | 'dark';

const colors = {
  light: {
    primary: '#22C55E',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textSecondary: '#6B7280',
    textInverse: '#FFFFFF',
    border: '#E5E7EB',
    success: '#22C55E',
    successLight: '#DCFCE7',
    error: '#EF4444',
    pointsGold: '#F59E0B',
  },
  dark: {
    primary: '#22C55E',
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textInverse: '#111827',
    border: '#374151',
    success: '#22C55E',
    successLight: '#064E3B',
    error: '#F87171',
    pointsGold: '#FBBF24',
  },
};

const spacing = {
  xs: 4,
  sm: 8,
  base: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

const typography = {
  sizes: {
    caption: 12,
    bodySmall: 14,
    base: 16,
    h3: 20,
    h2: 24,
  },
};

export interface MiniTheme {
  colors: typeof colors.light;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  typography: typeof typography;
  mode: ThemeMode;
}

/**
 * Hook backed by the host's Redux store (read via the singleton react-redux).
 * Always returns a stable theme object derived from the host's current mode.
 */
export function useTheme(): MiniTheme {
  const mode = useSelector(
    (state: {theme?: {mode?: ThemeMode}}) => state.theme?.mode ?? 'light',
  );
  return {
    colors: colors[mode],
    spacing,
    borderRadius,
    typography,
    mode,
  };
}
