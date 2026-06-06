import React, {useEffect} from 'react';
import {StyleSheet, useWindowDimensions, type ViewStyle} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import {useTheme} from '../theme/ThemeContext';
import {useSkeletonShimmer} from './SkeletonContext';

interface SkeletonProps {
  width: ViewStyle['width'];
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({width, height, borderRadius, style}: SkeletonProps) {
  const {colors: c, borderRadius: br} = useTheme();
  const screenWidth = useWindowDimensions().width;
  const sharedShimmer = useSkeletonShimmer();

  // Fallback standalone animation when no SkeletonProvider
  const localShimmer = useSharedValue(0);
  useEffect(() => {
    if (!sharedShimmer) {
      localShimmer.set(
        withRepeat(
          withTiming(1, {duration: 1500, easing: Easing.linear}),
          -1,
          false,
        ),
      );
    }
  }, [sharedShimmer, localShimmer]);

  const shimmer = sharedShimmer ?? localShimmer;
  const bandWidth = screenWidth * 0.6;

  const bandStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmer.get(),
      [0, 1],
      [-bandWidth, screenWidth],
    );
    return {transform: [{translateX}]};
  });

  const radius = borderRadius ?? br.md;

  return (
    <Animated.View
      style={[
        styles.base,
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: c.skeleton,
        },
        style,
      ]}>
      <Animated.View
        style={[
          styles.band,
          {
            width: bandWidth,
            borderRadius: radius,
            backgroundColor: c.skeletonHighlight,
          },
          bandStyle,
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    position: 'relative',
  },
  band: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
});
