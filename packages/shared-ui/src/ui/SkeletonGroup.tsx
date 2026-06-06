import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useTheme} from '../theme';
import {Skeleton} from './Skeleton';

type SkeletonLayout = 'card' | 'listItem' | 'profile';

interface SkeletonGroupProps {
  layout: SkeletonLayout;
  count?: number;
}

function CardSkeleton() {
  const {spacing: s, borderRadius: br} = useTheme();

  return (
    <View
      style={[
        styles.card,
        {padding: s.base, borderRadius: br.xl, marginBottom: s.base},
      ]}>
      <Skeleton width="60%" height={16} />
      <View style={{height: s.sm}} />
      <Skeleton width="100%" height={12} />
      <View style={{height: s.xs}} />
      <Skeleton width="80%" height={12} />
      <View style={{height: s.base}} />
      <View style={styles.row}>
        <Skeleton width={32} height={32} borderRadius={16} />
        <View style={{width: s.sm}} />
        <Skeleton width={100} height={12} />
      </View>
    </View>
  );
}

function ListItemSkeleton() {
  const {spacing: s} = useTheme();

  return (
    <View
      style={[
        styles.listItem,
        {paddingVertical: s.sm, paddingHorizontal: s.base},
      ]}>
      <Skeleton width={44} height={44} borderRadius={22} />
      <View style={[styles.listItemContent, {marginLeft: s.sm}]}>
        <Skeleton width="70%" height={14} />
        <View style={{height: s.xs}} />
        <Skeleton width="50%" height={12} />
      </View>
    </View>
  );
}

function ProfileSkeleton() {
  const {spacing: s} = useTheme();

  return (
    <View style={[styles.profile, {padding: s.base}]}>
      <Skeleton width={80} height={80} borderRadius={40} />
      <View style={{height: s.base}} />
      <Skeleton width={140} height={18} />
      <View style={{height: s.sm}} />
      <Skeleton width={100} height={14} />
      <View style={{height: s.base}} />
      <Skeleton width="90%" height={12} />
      <View style={{height: s.xs}} />
      <Skeleton width="70%" height={12} />
    </View>
  );
}

const LAYOUT_COMPONENTS: Record<SkeletonLayout, React.FC> = {
  card: CardSkeleton,
  listItem: ListItemSkeleton,
  profile: ProfileSkeleton,
};

export function SkeletonGroup({layout, count = 3}: SkeletonGroupProps) {
  const Component = LAYOUT_COMPONENTS[layout];
  const items = Array.from({length: count}, (_, i) => `${layout}-${i}`);

  return (
    <View>
      {items.map(key => (
        <Component key={key} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemContent: {
    flex: 1,
  },
  profile: {
    alignItems: 'center',
  },
});
