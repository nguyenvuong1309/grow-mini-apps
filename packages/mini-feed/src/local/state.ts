// Thin barrel so screens/components keep importing from `../local/state`.
//
// The feed vertical now lives IN this mini: types in ../types, the real Redux
// slice (reducer + actions + null-safe selectors) in ../state/feed.slice. We
// re-export both here.
//
// auth + challenges are STILL host-owned slices the mini does not own, so they
// remain MIRRORS: plain selectors/action creators whose `type` strings match
// the host's auth / challenges slices byte-for-byte.

import type {Challenge} from '../types';

export * from '../types';
export * from '../state/feed.slice';

// ── Host store shape for the mirrored (non-owned) slices ──────────────────
// The feed slice's own selectors are typed against `{ feed?: FeedState }`; here
// we only describe the auth / challenges slices the mirrors read.

interface ChallengesState {
  myChallenges: Challenge[];
}

interface MirrorState {
  challenges?: ChallengesState;
}

// ── challenges.* mirror (host challenges.slice.ts) ────────────────────────
export const selectMyChallenges = (state: MirrorState): Challenge[] =>
  state.challenges?.myChallenges ?? [];

// QuickCheckinFAB requests the user's active challenges, then reads them from
// the store via selectMyChallenges. Payload is the optional status filter.
export const fetchMyChallengesRequest = (status?: string) => ({
  type: 'challenges/fetchMyChallengesRequest' as const,
  payload: status,
});
