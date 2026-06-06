import React from 'react';
import {View, StyleSheet, Pressable} from 'react-native';
import {useTheme} from '../theme';
import {Text} from '../ui/Text';
import {Badge} from '../ui/Badge';
import {Card} from '../ui/Card';
import type {Challenge} from './types';
import {getCategoryConfig} from './constants';

interface ChallengeCardProps {
  challenge: Challenge;
  onPress: (challenge: Challenge) => void;
  /** If provided, shows a quick check-in button on active challenges */
  onQuickCheckin?: (challenge: Challenge) => void;
  /** Whether the user has already checked in today */
  hasCheckedInToday?: boolean;
}

export function ChallengeCard({
  challenge,
  onPress,
  onQuickCheckin,
  hasCheckedInToday = false,
}: ChallengeCardProps) {
  const {colors: c, spacing: s, borderRadius: br} = useTheme();
  const categoryInfo = getCategoryConfig(challenge.category);
  const [now] = React.useState(() => Date.now());

  const statusColor: Record<string, string> = {
    active: c.success,
    draft: c.warning,
    completed: c.info,
    cancelled: c.error,
  };

  const daysLeft = challenge.end_date
    ? Math.max(
        0,
        Math.ceil(
          (new Date(challenge.end_date).getTime() - now) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : null;

  const showQuickCheckin =
    onQuickCheckin && challenge.status === 'active' && !hasCheckedInToday;

  return (
    <Pressable
      testID="challenge-card"
      style={({pressed}) => [pressed && {opacity: 0.7}]}
      onPress={() => onPress(challenge)}>
      <Card style={{marginBottom: s.sm}}>
        <View style={styles.header}>
          <View
            style={[
              styles.categoryIcon,
              {backgroundColor: categoryInfo.bgColor, borderRadius: br.lg},
            ]}>
            <Text style={styles.emoji}>{categoryInfo.emoji}</Text>
          </View>
          <View style={styles.headerText}>
            <Text
              testID="challenge-card-title"
              variant="body"
              bold
              numberOfLines={1}>
              {challenge.name}
            </Text>
            <Text variant="caption" color={c.textSecondary}>
              {categoryInfo.label} {'·'} {challenge.duration_days} days
            </Text>
          </View>
          <View style={styles.badgeColumn}>
            <Badge
              testID="challenge-card-status"
              label={challenge.status}
              variant={
                challenge.status === 'active'
                  ? 'success'
                  : challenge.status === 'completed'
                    ? 'info'
                    : 'warning'
              }
            />
            {challenge.is_recurring && (
              <Badge
                testID={`recurring-badge-${challenge.id}`}
                label="Recurring"
                variant="secondary"
              />
            )}
          </View>
        </View>

        {challenge.description ? (
          <Text
            variant="bodySmall"
            color={c.textSecondary}
            numberOfLines={2}
            style={{marginTop: s.xs}}>
            {challenge.description}
          </Text>
        ) : null}

        <View style={[styles.footer, {marginTop: s.sm}]}>
          <View style={styles.footerLeft}>
            <View style={styles.stat}>
              <Text variant="caption" color={c.textTertiary}>
                {challenge.participant_count} member
                {challenge.participant_count !== 1 ? 's' : ''}
              </Text>
            </View>
            {challenge.min_stake > 0 && (
              <View style={styles.stat}>
                <Text variant="caption" color={c.textTertiary}>
                  {challenge.min_stake} pts stake
                </Text>
              </View>
            )}
            {daysLeft !== null && challenge.status === 'active' && (
              <Text
                variant="caption"
                color={statusColor[challenge.status]}
                bold>
                {daysLeft} days left
              </Text>
            )}
          </View>

          {showQuickCheckin && (
            <Pressable
              style={({pressed}) => [
                styles.quickCheckinBtn,
                {backgroundColor: c.primary, borderRadius: br.lg},
                pressed && {opacity: 0.7},
              ]}
              onPress={e => {
                e.stopPropagation();
                onQuickCheckin(challenge);
              }}>
              <Text variant="caption" color={c.textInverse} bold>
                Check In
              </Text>
            </Pressable>
          )}

          {hasCheckedInToday && challenge.status === 'active' && (
            <View
              style={[
                styles.checkedBadge,
                {backgroundColor: c.successLight, borderRadius: br.lg},
              ]}>
              <Text variant="caption" color={c.success} bold>
                {'✓'} Done
              </Text>
            </View>
          )}
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 20,
  },
  headerText: {
    flex: 1,
    marginRight: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickCheckinBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  checkedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  badgeColumn: {
    alignItems: 'flex-end',
    gap: 4,
  },
});
