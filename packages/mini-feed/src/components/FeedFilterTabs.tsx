import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, LayoutChangeEvent} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {useTheme, Text, PressableOpacity} from '@grow/shared-ui';
import type {FeedFilter} from '../local/state';

interface FeedFilterTabsProps {
  activeFilter: FeedFilter;
  onFilterChange: (filter: FeedFilter) => void;
}

const TABS: {key: FeedFilter; label: string; testID: string}[] = [
  {key: 'all', label: 'All', testID: 'feed-filter-all'},
  {key: 'following', label: 'Following', testID: 'feed-filter-following'},
  {key: 'mine', label: 'Mine', testID: 'feed-filter-mine'},
];

export function FeedFilterTabs({
  activeFilter,
  onFilterChange,
}: FeedFilterTabsProps) {
  const {colors: c, spacing: s, typography: t} = useTheme();
  const translateX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const tabWidths = useRef<number[]>([0, 0, 0]);
  const tabOffsets = useRef<number[]>([0, 0, 0]);

  const activeIndex = TABS.findIndex(tab => tab.key === activeFilter);

  useEffect(() => {
    const offset = tabOffsets.current[activeIndex] ?? 0;
    const width = tabWidths.current[activeIndex] ?? 0;
    translateX.set(
      withSpring(offset + width / 2, {
        stiffness: 300,
        damping: 30,
      }),
    );
    indicatorWidth.set(withSpring(width, {stiffness: 300, damping: 30}));
  }, [activeIndex, translateX, indicatorWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.get()}, {scaleX: indicatorWidth.get()}],
  }));

  const handleLayout = (index: number) => (event: LayoutChangeEvent) => {
    const {x, width} = event.nativeEvent.layout;
    tabWidths.current[index] = width;
    tabOffsets.current[index] = x;

    // Update indicator position for the active tab once layout is measured
    if (index === activeIndex) {
      translateX.set(x + width / 2);
      indicatorWidth.set(width);
    }
  };

  return (
    <View
      testID="feed-filter-tabs"
      style={[styles.container, {borderBottomColor: c.borderLight}]}>
      <View style={styles.tabRow}>
        {TABS.map((tab, index) => {
          const isActive = tab.key === activeFilter;
          return (
            <PressableOpacity
              key={tab.key}
              testID={tab.testID}
              onPress={() => onFilterChange(tab.key)}
              onLayout={handleLayout(index)}
              style={[
                styles.tab,
                {paddingVertical: s.sm, paddingHorizontal: s.base},
              ]}
              activeOpacity={0.7}>
              <Text
                variant="label"
                style={{
                  color: isActive ? c.primary : c.textSecondary,
                  fontWeight: isActive
                    ? (t.weights.semibold as any)
                    : (t.weights.regular as any),
                }}>
                {tab.label}
              </Text>
            </PressableOpacity>
          );
        })}
      </View>

      {/* Animated underline indicator */}
      <Animated.View
        style={[styles.indicator, {backgroundColor: c.primary}, indicatorStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  tabRow: {
    flexDirection: 'row',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    height: 2,
    width: 1,
    position: 'absolute',
    bottom: 0,
    left: -0.5,
  },
});
