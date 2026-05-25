// Local action creators + selectors that talk to the host's Redux slices.
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

interface PointsState {
  balance: number;
}

interface AppState {
  subscription?: SubscriptionState;
  points?: PointsState;
}

export const selectTier = (state: AppState): SubscriptionTier =>
  state.subscription?.tier ?? SubscriptionTier.FREE;

export const selectIsPurchasing = (state: AppState): boolean =>
  state.subscription?.isPurchasing ?? false;

export const selectPointsBalance = (state: AppState): number =>
  state.points?.balance ?? 0;

// ── Action creators (plain objects matching host slice action types) ─────

export const purchaseRequest = (tier: SubscriptionTier) => ({
  type: 'subscription/purchaseRequest' as const,
  payload: tier,
});

export const purchaseSuccess = (tier: SubscriptionTier) => ({
  type: 'subscription/purchaseSuccess' as const,
  payload: tier,
});

export const purchaseFailure = (error: string) => ({
  type: 'subscription/purchaseFailure' as const,
  payload: error,
});
