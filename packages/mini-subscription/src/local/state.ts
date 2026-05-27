// Local action creators + selectors that talk to host-owned Redux slices.
//
// We can't import from `host/state/*` via Module Federation (see local/theme.ts
// for context). Instead, we dispatch plain action objects with the same `type`
// strings the host's slices listen for, and read state with hand-written
// selectors that match the host's state shape.
//
// **Contract:** if the host's slice changes its action type or state shape,
// update this file too. The strings here are part of the public mini-app API.

export enum SubscriptionTier {
  FREE = 'free',
  PRO = 'pro',
  SQUAD_PRO = 'squad_pro',
}

// ── State selectors (read against the host store) ────────────────────────

interface SubscriptionState {
  tier: SubscriptionTier;
  isPurchasing: boolean;
}

interface MiniProfile {
  subscription_tier?: SubscriptionTier | null;
}

interface AuthState {
  user: MiniProfile | null;
}

interface PointsState {
  balance: number;
}

interface AppState {
  auth?: AuthState;
  subscription?: SubscriptionState;
  points?: PointsState;
}

export const selectTier = (state: AppState): SubscriptionTier | null =>
  state.auth?.user?.subscription_tier ?? state.subscription?.tier ?? null;

export const selectIsPurchasing = (state: AppState): boolean =>
  state.subscription?.isPurchasing ?? false;

export const selectPointsBalance = (state: AppState): number =>
  state.points?.balance ?? 0;

// ── Action creators (plain objects matching host slice action types) ─────

export const purchaseRequest = (tier: SubscriptionTier) => ({
  type: 'subscription/purchaseRequest' as const,
  payload: tier,
});
