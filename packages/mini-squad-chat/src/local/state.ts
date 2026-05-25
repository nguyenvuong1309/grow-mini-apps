// Local action creators + selectors talking to host's Redux slices.
// String action types must match host's auth + squad slice listeners.

// ── Minimal type stubs (mirror host's types/models.ts) ───────────────────

export interface MiniProfile {
  id: string;
  display_name?: string | null;
  avatar_url?: string | null;
}

export interface SquadMessage {
  id: string;
  squad_id: string;
  user_id: string;
  body: string;
  image_url: string | null;
  reply_to_id: string | null;
  created_at: string;
  profile?: MiniProfile | null;
}

// ── State shape (mirrors host's slices) ──────────────────────────────────

interface AuthState {
  user: MiniProfile | null;
}

interface SquadState {
  messages: SquadMessage[];
  loading: boolean;
  loadingMore: boolean;
  hasMoreMessages: boolean;
  messagesPage: number;
}

interface AppState {
  auth?: AuthState;
  squad?: SquadState;
}

// ── Selectors ────────────────────────────────────────────────────────────

export const selectUser = (state: AppState): MiniProfile | null =>
  state.auth?.user ?? null;

export const selectMessages = (state: AppState): SquadMessage[] =>
  state.squad?.messages ?? [];

export const selectSquadLoading = (state: AppState): boolean =>
  state.squad?.loading ?? false;

export const selectSquadLoadingMore = (state: AppState): boolean =>
  state.squad?.loadingMore ?? false;

export const selectHasMoreMessages = (state: AppState): boolean =>
  state.squad?.hasMoreMessages ?? true;

export const selectMessagesPage = (state: AppState): number =>
  state.squad?.messagesPage ?? 0;

// ── Action creators (plain objects matching host slice action types) ─────

export const fetchMessagesRequest = (payload: {
  squadId: string;
  page: number;
}) => ({
  type: 'squad/fetchMessagesRequest' as const,
  payload,
});

export const sendMessageRequest = (payload: {
  squadId: string;
  body: string;
  optimisticMessage: SquadMessage;
}) => ({
  type: 'squad/sendMessageRequest' as const,
  payload,
});

export const resetMessages = () => ({
  type: 'squad/resetMessages' as const,
});

export const subscribeChatRealtime = (squadId: string) => ({
  type: 'squad/subscribeChatRealtime' as const,
  payload: squadId,
});

export const unsubscribeChatRealtime = () => ({
  type: 'squad/unsubscribeChatRealtime' as const,
});
