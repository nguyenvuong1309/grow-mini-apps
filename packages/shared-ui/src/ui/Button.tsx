import React from 'react';
import {
  Pressable,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {useTheme} from '../theme';
import {Text} from './Text';

// Inlined from host `@shared/utils/animations` to keep shared-ui self-contained.
const PRESS_SCALE = 0.96;

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  testID?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  testID,
}: ButtonProps) {
  const {colors: c, borderRadius: br} = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.get()}],
  }));

  const isDisabled = disabled || loading;

  const containerStyles: Record<ButtonVariant, ViewStyle> = {
    primary: {backgroundColor: isDisabled ? c.primaryLight : c.primary},
    secondary: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: c.primary,
    },
    ghost: {backgroundColor: 'transparent'},
    danger: {backgroundColor: isDisabled ? c.errorLight : c.error},
  };

  const textColors: Record<ButtonVariant, string> = {
    primary: c.textInverse,
    secondary: c.primary,
    ghost: c.primary,
    danger: c.textInverse,
  };

  const sizeStyles: Record<ButtonSize, ViewStyle> = {
    sm: {paddingVertical: 8, paddingHorizontal: 16},
    md: {paddingVertical: 12, paddingHorizontal: 24},
    lg: {paddingVertical: 16, paddingHorizontal: 32},
  };

  const textSizes: Record<ButtonSize, TextStyle> = {
    sm: {fontSize: 13},
    md: {fontSize: 15},
    lg: {fontSize: 17},
  };

  return (
    <AnimatedPressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      onPressIn={() => {
        scale.set(withSpring(PRESS_SCALE, {damping: 15, stiffness: 200}));
      }}
      onPressOut={() => {
        scale.set(withSpring(1, {damping: 15, stiffness: 200}));
      }}
      style={[
        styles.base,
        {borderRadius: br.lg},
        containerStyles[variant],
        sizeStyles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        animatedStyle,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={textColors[variant]} size="small" />
      ) : (
        <Text
          style={[styles.text, {color: textColors[variant]}, textSizes[size]]}>
          {title}
        </Text>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontWeight: '600',
  },
});
