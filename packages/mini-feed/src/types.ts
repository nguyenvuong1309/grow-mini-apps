// Self-contained type stubs for the mini-feed vertical.
//
// The host app defines richer versions of these in `types/models` / `types/enums`,
// but the mini-app must own its full vertical without importing host paths, so we
// keep self-contained stubs here. `FeedPost` is flattened (the host version extends
// `Checkin`) into a standalone interface.

// ── Enums ─────────────────────────────────────────────────────────────────

export enum ReactionEmoji {
  FIRE = 'fire',
  MUSCLE = 'muscle',
  CLAP = 'clap',
}

export enum CheckinStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum CheckinType {
  PHOTO = 'photo',
  TEXT = 'text',
  METRIC = 'metric',
  TICK = 'tick',
}

export type ChallengeCategory =
  | 'fitness'
  | 'nutrition'
  | 'mindfulness'
  | 'productivity'
  | 'learning'
  | 'finance'
  | 'social'
  | 'creativity'
  | 'health'
  | 'custom';

// ── Models ──────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  display_name: string;
  username?: string | null;
  avatar_url: string | null;
  [key: string]: unknown;
}

export interface Comment {
  id: string;
  checkin_id: string;
  user_id: string;
  body: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface FeedPost {
  id: string;
  challenge_id: string;
  user_id: string;
  checkin_date: string;
  image_url: string | null;
  additional_images?: string[] | null;
  text_content: string | null;
  metric_value: number | null;
  is_tick: boolean;
  status: CheckinStatus;
  verify_count: number;
  reject_count: number;
  created_at: string;
  profile: Profile;
  challenge_name: string;
  challenge_category: ChallengeCategory;
  challenge_goal_value?: number | null;
  challenge_goal_unit?: string | null;
  reactions_count: {fire: number; muscle: number; clap: number};
  user_reaction: ReactionEmoji | null;
  comments_count: number;
}

export interface Challenge {
  id: string;
  name: string;
  checkin_type: CheckinType | string;
  [key: string]: unknown;
}

export type FeedFilter = 'all' | 'following' | 'mine';
