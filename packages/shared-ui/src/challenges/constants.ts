import {ChallengeCategory, ChallengeDuration, CheckinType} from './types';

const DEFAULT_CATEGORY = {emoji: '⭐', label: 'Custom', bgColor: '#F3F4F6'};

export function getCategoryConfig(category: string) {
  return CATEGORY_CONFIG[category] ?? DEFAULT_CATEGORY;
}

export const CATEGORY_CONFIG: Record<
  string,
  {emoji: string; label: string; bgColor: string}
> = {
  [ChallengeCategory.FITNESS]: {
    emoji: '💪',
    label: 'Fitness',
    bgColor: '#FEE2E2',
  },
  [ChallengeCategory.NUTRITION]: {
    emoji: '🥗',
    label: 'Nutrition',
    bgColor: '#DCFCE7',
  },
  [ChallengeCategory.MINDFULNESS]: {
    emoji: '🧘',
    label: 'Mindfulness',
    bgColor: '#E0E7FF',
  },
  [ChallengeCategory.PRODUCTIVITY]: {
    emoji: '🚀',
    label: 'Productivity',
    bgColor: '#FEF3C7',
  },
  [ChallengeCategory.LEARNING]: {
    emoji: '📚',
    label: 'Learning',
    bgColor: '#DBEAFE',
  },
  [ChallengeCategory.FINANCE]: {
    emoji: '💰',
    label: 'Finance',
    bgColor: '#D1FAE5',
  },
  [ChallengeCategory.SOCIAL]: {
    emoji: '🤝',
    label: 'Social',
    bgColor: '#FCE7F3',
  },
  [ChallengeCategory.CREATIVITY]: {
    emoji: '🎨',
    label: 'Creativity',
    bgColor: '#EDE9FE',
  },
  [ChallengeCategory.HEALTH]: {
    emoji: '❤️',
    label: 'Health',
    bgColor: '#FFE4E6',
  },
  [ChallengeCategory.CUSTOM]: {
    emoji: '⭐',
    label: 'Custom',
    bgColor: '#F3F4F6',
  },
};

export const DURATION_OPTIONS: {value: ChallengeDuration; label: string}[] = [
  {value: ChallengeDuration.WEEK, label: '7 days'},
  {value: ChallengeDuration.TWO_WEEKS, label: '14 days'},
  {value: ChallengeDuration.THREE_WEEKS, label: '21 days'},
  {value: ChallengeDuration.MONTH, label: '30 days'},
  {value: ChallengeDuration.TWO_MONTHS, label: '60 days'},
  {value: ChallengeDuration.THREE_MONTHS, label: '90 days'},
];

export const CHECKIN_TYPE_OPTIONS: {
  value: CheckinType;
  label: string;
  description: string;
}[] = [
  {
    value: CheckinType.TICK,
    label: 'Simple Tick',
    description: 'Just mark done',
  },
  {
    value: CheckinType.PHOTO,
    label: 'Photo Proof',
    description: 'Upload a photo',
  },
  {value: CheckinType.TEXT, label: 'Text Entry', description: 'Write about it'},
  {value: CheckinType.METRIC, label: 'Metric', description: 'Track a number'},
];
