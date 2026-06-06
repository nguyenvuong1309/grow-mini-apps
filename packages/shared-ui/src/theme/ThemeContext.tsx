// Self-contained theme — see mini-squad-chat/src/local/theme.ts for rationale.
// Mini-apps CANNOT import `host/theme` via Module Federation because the
// federation runtime re-evaluates the host's module in a separate chunk,
// triggering Hermes EXC_BAD_ACCESS on iOS production builds. So this theme
// reads ONLY `state.theme.mode` from the shared redux store via `useSelector`
// and computes all tokens locally. It never imports a redux slice.
import React, {useMemo} from 'react';
import {useColorScheme} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {colors} from './colors';
import type {ColorScheme, ThemeMode} from './colors';
import {typography} from './typography';
import {spacing} from './spacing';
import {borderRadius} from './borderRadius';
import {shadows} from './shadows';

export interface Theme {
  colors: ColorScheme;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  mode: ThemeMode;
}

// Minimal shape of the host store slice this package depends on.
interface StateWithTheme {
  theme?: {mode?: ThemeMode};
}

const selectThemeMode = (state: StateWithTheme): ThemeMode | undefined =>
  state.theme?.mode;

// `ThemeProvider` is kept as a no-op pass-through so call sites that wrap
// children (`<ThemeProvider>{children}</ThemeProvider>`) continue to work.
// Theme state lives in redux, not React Context — Context identity does not
// survive the federation boundary.
export function ThemeProvider({children}: {children: React.ReactNode}) {
  return <>{children}</>;
}

export function useTheme(): Theme {
  const mode = useSelector(selectThemeMode);
  const systemScheme = useColorScheme();
  const effectiveMode: ThemeMode =
    mode ?? (systemScheme === 'dark' ? 'dark' : 'light');

  return useMemo(
    () => ({
      colors: colors[effectiveMode],
      typography,
      spacing,
      borderRadius,
      shadows,
      mode: effectiveMode,
    }),
    [effectiveMode],
  );
}

// Dispatches plain actions matching the host theme slice's action `type`
// strings (`theme/setMode`, `theme/toggleMode`). We do NOT import the slice —
// the consuming store owns the reducer; we only emit the actions it listens
// for. Reading mode stays a pure `state.theme.mode` selector.
export function useThemeMode() {
  const dispatch = useDispatch();
  const mode = useSelector(selectThemeMode);
  return {
    mode,
    setMode: (next: ThemeMode) =>
      dispatch({type: 'theme/setMode', payload: next}),
    toggleMode: () => dispatch({type: 'theme/toggleMode'}),
  };
}
