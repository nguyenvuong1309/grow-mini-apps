import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useTheme} from '../theme';
import {Text} from '../ui/Text';

interface GoalProgressIndicatorProps {
  value: number;
  goal: number;
  unit: string;
  compact?: boolean;
  testID?: string;
}

export function GoalProgressIndicator({
  value,
  goal,
  unit,
  compact = false,
  testID = 'goal-progress-indicator',
}: GoalProgressIndicatorProps) {
  const {colors: c, spacing: s, borderRadius: br} = useTheme();

  const percentage = Math.min(100, Math.round((value / goal) * 100));
  const isComplete = percentage >= 100;

  const getProgressColor = () => {
    if (percentage >= 100) {
      return c.success;
    }
    if (percentage >= 50) {
      return c.warning ?? '#F59E0B';
    }
    return c.error;
  };

  const progressColor = getProgressColor();

  if (compact) {
    return (
      <View testID={testID} style={styles.compactContainer}>
        <View style={[styles.compactTextRow, {marginBottom: 4}]}>
          <Text variant="bodySmall" bold color={progressColor}>
            {value} / {goal} {unit}
          </Text>
          <Text
            variant="caption"
            color={isComplete ? c.success : c.textSecondary}>
            {isComplete ? ' ✓' : ` (${percentage}%)`}
          </Text>
        </View>
        <View
          style={[
            styles.progressBarBackground,
            {
              backgroundColor: c.border,
              borderRadius: br.full,
            },
          ]}>
          <View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: progressColor,
                borderRadius: br.full,
                width: `${percentage}%`,
              },
            ]}
          />
        </View>
      </View>
    );
  }

  return (
    <View testID={testID} style={styles.container}>
      {/* Circular-like display */}
      <View
        style={[
          styles.circleContainer,
          {
            borderColor: progressColor,
            borderRadius: br.full,
          },
        ]}>
        <Text variant="h2" color={progressColor}>
          {percentage}%
        </Text>
      </View>

      {/* Value display */}
      <Text variant="body" bold center style={{marginTop: s.sm}}>
        {value} / {goal} {unit}
      </Text>

      {/* Progress bar */}
      <View
        style={[
          styles.progressBarBackground,
          {
            backgroundColor: c.border,
            borderRadius: br.full,
            marginTop: s.sm,
          },
        ]}>
        <View
          style={[
            styles.progressBarFill,
            {
              backgroundColor: progressColor,
              borderRadius: br.full,
              width: `${percentage}%`,
            },
          ]}
        />
      </View>

      {/* Status text */}
      {isComplete && (
        <Text
          variant="bodySmall"
          color={c.success}
          bold
          center
          style={{marginTop: s.xs}}>
          Goal reached!
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  compactContainer: {
    width: '100%',
  },
  compactTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleContainer: {
    width: 80,
    height: 80,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
});
