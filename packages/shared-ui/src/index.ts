// @grow/shared-ui — single source of truth for the design system
// (theme + UI primitives) and shared challenge components.
// Consumed by the host app and federated mini-apps. SOURCE package:
// consumers transpile it (no build step).

// Theme
export {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  ThemeProvider,
  useTheme,
  useThemeMode,
} from './theme';
export type {ColorScheme, ThemeMode, Theme} from './theme';

// UI primitives + layout
export {
  Text,
  Button,
  Card,
  Avatar,
  Badge,
  Divider,
  Spinner,
  EmptyState,
  Skeleton,
  SkeletonGroup,
  SkeletonProvider,
  useSkeletonShimmer,
  PressableOpacity,
  ScreenContainer,
} from './ui';
export type {PressableOpacityProps} from './ui';

// Challenge components + constants + types
export {
  getCategoryConfig,
  CATEGORY_CONFIG,
  DURATION_OPTIONS,
  CHECKIN_TYPE_OPTIONS,
  GoalProgressIndicator,
  ChallengeCard,
  ChallengeListSkeleton,
  ChallengeCategory,
  ChallengeDuration,
  ChallengeStatus,
  ChallengeVisibility,
  CheckinType,
} from './challenges';
export type {Challenge} from './challenges';
