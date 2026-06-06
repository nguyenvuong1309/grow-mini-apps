import React, {useCallback} from 'react';
import {View, StyleSheet} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import {useTheme, Text, PressableOpacity} from '@grow/shared-ui';
import {ReactionEmoji} from '../local/state';

interface ReactionBarProps {
  testID?: string;
  reactions: {fire: number; muscle: number; clap: number};
  userReaction: ReactionEmoji | null;
  onToggle: (emoji: ReactionEmoji) => void;
}

const EMOJI_MAP: {key: ReactionEmoji; icon: string}[] = [
  {key: ReactionEmoji.FIRE, icon: '🔥'},
  {key: ReactionEmoji.MUSCLE, icon: '💪'},
  {key: ReactionEmoji.CLAP, icon: '👏'},
];

function ReactionButton({
  emoji,
  icon,
  count,
  isActive,
  onPress,
}: {
  emoji: ReactionEmoji;
  icon: string;
  count: number;
  isActive: boolean;
  onPress: (emoji: ReactionEmoji) => void;
}) {
  const {colors: c, borderRadius: br, spacing: s} = useTheme();
  const scaleAnim = useSharedValue(1);

  const animatedEmojiStyle = useAnimatedStyle(() => ({
    transform: [{scale: scaleAnim.get()}],
  }));

  const handlePress = useCallback(() => {
    scaleAnim.set(
      withSequence(
        withSpring(1.3, {damping: 3, stiffness: 200}),
        withSpring(1, {damping: 3, stiffness: 200}),
      ),
    );
    onPress(emoji);
  }, [emoji, onPress, scaleAnim]);

  return (
    <PressableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[
        styles.reactionButton,
        {
          backgroundColor: isActive ? c.primaryLight : c.surface,
          borderRadius: br.full,
          borderWidth: isActive ? 1.5 : 1,
          borderColor: isActive ? c.primary : c.borderLight,
          paddingHorizontal: s.sm,
          paddingVertical: s.xs,
        },
      ]}>
      <Animated.Text style={[styles.emojiText, animatedEmojiStyle]}>
        {icon}
      </Animated.Text>
      {count > 0 && (
        <Text
          variant="caption"
          color={isActive ? c.primary : c.textSecondary}
          bold={isActive}
          style={styles.countText}>
          {count}
        </Text>
      )}
    </PressableOpacity>
  );
}

export function ReactionBar({
  testID,
  reactions,
  userReaction,
  onToggle,
}: ReactionBarProps) {
  const {spacing: s} = useTheme();

  return (
    <View
      testID={testID}
      accessibilityLabel={testID}
      style={[styles.container, {gap: s.xs}]}>
      {EMOJI_MAP.map(({key, icon}) => (
        <ReactionButton
          key={key}
          emoji={key}
          icon={icon}
          count={reactions[key]}
          isActive={userReaction === key}
          onPress={onToggle}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emojiText: {
    fontSize: 16,
  },
  countText: {
    marginLeft: 2,
  },
});
