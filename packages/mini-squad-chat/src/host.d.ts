// Module declarations for federated imports from the grow host.
//
// At runtime these are resolved by @callstack/repack's Module Federation
// against the host bundle. At build/type-check time we declare the API
// surface here so mini-app code can stay typed without dragging the host's
// internal `@theme`, `@store`, ... babel aliases into the mini-app
// TypeScript project.
//
// Keep the shapes in sync with the actual host exports:
//   - grow-host-app/src/theme/index.ts
//   - grow-host-app/src/services/supabase/client.ts
//   - grow-host-app/src/app/navigation/navigationRef.ts
//   - grow-host-app/src/store/store.ts
//   - grow-host-app/src/store/hooks.ts
//   - grow-host-app/src/shared/components/ui/index.ts
//   - grow-host-app/src/shared/components/layout/index.ts
//   - grow-host-app/src/features/auth/slice/auth.slice.ts
//   - grow-host-app/src/features/squad/slice/squad.slice.ts
//   - grow-host-app/src/types/models.ts

declare module 'host/theme' {
  export interface Theme {
    colors: Record<string, string>;
    typography: {
      sizes: Record<string, number>;
      weights: Record<string, string>;
      lineHeights: Record<string, number>;
    };
    spacing: Record<string, number>;
    borderRadius: Record<string, number>;
    shadows: Record<string, unknown>;
    mode: 'light' | 'dark';
  }
  export function useTheme(): Theme;
  export function useThemeMode(): {
    mode: 'light' | 'dark';
    setMode: (mode: 'light' | 'dark') => void;
    toggleMode: () => void;
  };
}

declare module 'host/supabase' {
  import type { SupabaseClient } from '@supabase/supabase-js';
  export const supabase: SupabaseClient;
}

declare module 'host/navigation' {
  export const navigationRef: {
    isReady(): boolean;
    navigate(name: string, params?: unknown): void;
  };
  export function navigate(name: string, params?: unknown): void;
}

declare module 'host/store' {
  import type { Reducer, Store } from '@reduxjs/toolkit';
  import type { Saga, Task } from 'redux-saga';
  export const store: Store;
  export function registerReducer(key: string, reducer: Reducer): boolean;
  export function runMiniAppSaga(saga: Saga): Task;
  export type RootState = unknown;
  export type AppDispatch = (action: unknown) => unknown;
}

declare module 'host/store/hooks' {
  import type { TypedUseSelectorHook } from 'react-redux';
  export const useAppDispatch: () => (action: unknown) => unknown;
  export const useAppSelector: TypedUseSelectorHook<any>;
}

declare module 'host/shared/ui' {
  import type { ComponentType, ReactNode } from 'react';
  export const Text: ComponentType<any>;
  export const Button: ComponentType<any>;
  export const Card: ComponentType<any>;
  export const Avatar: ComponentType<any>;
  export const Badge: ComponentType<any>;
  export const Divider: ComponentType<any>;
  export const Spinner: ComponentType<any>;
  export const EmptyState: ComponentType<any>;
  export const Skeleton: ComponentType<any>;
  export const SkeletonGroup: ComponentType<any>;
  export const SkeletonProvider: ComponentType<{ children: ReactNode }>;
  export const ErrorBoundary: ComponentType<{ children: ReactNode }>;
  export const ErrorState: ComponentType<any>;
  export const OfflineBanner: ComponentType<any>;
  export const PressableOpacity: ComponentType<any>;
}

declare module 'host/shared/layout' {
  import type { ComponentType, ReactNode } from 'react';
  export const ScreenContainer: ComponentType<{
    children?: ReactNode;
    testID?: string;
    [key: string]: unknown;
  }>;
}

declare module 'host/state/auth' {
  export const selectUser: (state: any) => {
    id: string;
    display_name?: string;
    avatar_url?: string | null;
    [key: string]: unknown;
  } | null;
}

declare module 'host/state/squad' {
  import type { Action } from '@reduxjs/toolkit';
  export const fetchMessagesRequest: (payload: {
    squadId: string;
    page: number;
  }) => Action;
  export const sendMessageRequest: (payload: {
    squadId: string;
    body: string;
    optimisticMessage: unknown;
  }) => Action;
  export const resetMessages: () => Action;
  export const subscribeChatRealtime: (squadId: string) => Action;
  export const unsubscribeChatRealtime: () => Action;
  export const selectMessages: (state: any) => any[];
  export const selectSquadLoading: (state: any) => boolean;
  export const selectSquadLoadingMore: (state: any) => boolean;
  export const selectHasMoreMessages: (state: any) => boolean;
  export const selectMessagesPage: (state: any) => number;
}

declare module 'host/types/models' {
  export interface SquadMessage {
    id: string;
    squad_id: string;
    user_id: string;
    body: string;
    image_url: string | null;
    reply_to_id: string | null;
    created_at: string;
    profile?: {
      id: string;
      display_name?: string;
      avatar_url?: string | null;
    } | null;
  }
}
