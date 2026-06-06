import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useTheme, Skeleton, Card} from '@grow/shared-ui';

function PostCardSkeleton() {
  const {spacing: s, borderRadius: br} = useTheme();
  return (
    <Card style={{marginBottom: s.sm}}>
      {/* Header */}
      <View style={styles.row}>
        <Skeleton width={44} height={44} borderRadius={22} />
        <View style={[styles.flex1, {marginLeft: s.sm}]}>
          <View style={styles.row}>
            <Skeleton width="60%" height={14} />
            <View style={{width: s.xs}} />
            <Skeleton width={60} height={12} />
          </View>
          <View style={{height: s.xs}} />
          <Skeleton width={80} height={20} borderRadius={br.full} />
        </View>
      </View>
      {/* Image */}
      <View style={{height: s.sm}} />
      <Skeleton width="100%" height={200} borderRadius={br.lg} />
      {/* Text */}
      <View style={{height: s.sm}} />
      <Skeleton width="90%" height={12} />
      <View style={{height: s.xs}} />
      <Skeleton width="60%" height={12} />
      {/* Reactions */}
      <View style={{height: s.sm}} />
      <View style={styles.rowBetween}>
        <Skeleton width={120} height={24} borderRadius={br.lg} />
        <Skeleton width={40} height={24} borderRadius={br.lg} />
      </View>
    </Card>
  );
}

export function FeedSkeleton() {
  return (
    <View>
      <PostCardSkeleton />
      <PostCardSkeleton />
      <PostCardSkeleton />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center'},
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flex1: {flex: 1},
});
