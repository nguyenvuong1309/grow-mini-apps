import React, {createContext, use, useEffect} from 'react';
import {
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';

const SkeletonCtx = createContext<SharedValue<number> | null>(null);

export function SkeletonProvider({children}: {children: React.ReactNode}) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.set(
      withRepeat(
        withTiming(1, {duration: 1500, easing: Easing.linear}),
        -1,
        false,
      ),
    );
  }, [shimmer]);

  return (
    <SkeletonCtx.Provider value={shimmer}>{children}</SkeletonCtx.Provider>
  );
}

export function useSkeletonShimmer(): SharedValue<number> | null {
  return use(SkeletonCtx);
}
