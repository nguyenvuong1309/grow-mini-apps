// Local type stubs mirroring host `@types/enums` and `@types/models`.
// shared-ui must not import host path aliases; these mirror the host shapes
// 1:1 so the ported challenge components stay type-compatible and drop-in.

export enum ChallengeDuration {
  WEEK = '7',
  TWO_WEEKS = '14',
  THREE_WEEKS = '21',
  MONTH = '30',
  TWO_MONTHS = '60',
  THREE_MONTHS = '90',
}

export enum CheckinType {
  PHOTO = 'photo',
  TEXT = 'text',
  METRIC = 'metric',
  TICK = 'tick',
}

export enum ChallengeVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
}

export enum ChallengeStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ChallengeCategory {
  FITNESS = 'fitness',
  NUTRITION = 'nutrition',
  MINDFULNESS = 'mindfulness',
  PRODUCTIVITY = 'productivity',
  LEARNING = 'learning',
  FINANCE = 'finance',
  SOCIAL = 'social',
  CREATIVITY = 'creativity',
  HEALTH = 'health',
  CUSTOM = 'custom',
}

export interface Challenge {
  id: string;
  creator_id: string;
  template_id: string | null;
  name: string;
  description: string;
  category: ChallengeCategory;
  duration_days: ChallengeDuration;
  checkin_type: CheckinType;
  deadline_time: string;
  max_miss_days: number;
  visibility: ChallengeVisibility;
  status: ChallengeStatus;
  cover_image_url: string | null;
  start_date: string | null;
  end_date: string | null;
  min_stake: number;
  max_participants: number | null;
  participant_count: number;
  squad_id: string | null;
  goal_value?: number | null;
  goal_unit?: string | null;
  is_recurring?: boolean;
  recurrence_type?: 'weekly' | 'monthly' | 'custom' | null;
  recurrence_interval_days?: number | null;
  created_at: string;
  updated_at: string;
}
