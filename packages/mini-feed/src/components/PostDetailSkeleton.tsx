import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useTheme, Skeleton} from '@grow/shared-ui';

const POST_DETAIL_COMMENT_KEYS = ['k0', 'k1', 'k2'] as const;

export function PostDetailSkeleton() {
  const {spacing: s, borderRadius: br} = useTheme();
  return (
    <View style={{paddingTop: s.xl}}>
      {/* Post header */}
      <View style={styles.row}>
        <Skeleton width={48} height={48} borderRadius={24} />
        <View style={[styles.flex1, {marginLeft: s.sm}]}>
          <Skeleton width="50%" height={16} />
          <View style={{height: s.xs}} />
          <Skeleton width={80} height={12} />
        </View>
      </View>
      {/* Image */}
      <View style={{height: s.base}} />
      <Skeleton width="100%" height={240} borderRadius={br.lg} />
      {/* Text */}
      <View style={{height: s.sm}} />
      <Skeleton width="100%" height={12} />
      <View style={{height: s.xs}} />
      <Skeleton width="80%" height={12} />
      <View style={{height: s.xs}} />
      <Skeleton width="60%" height={12} />
      {/* Reactions */}
      <View style={{height: s.base}} />
      <Skeleton width={200} height={28} borderRadius={br.lg} />
      {/* Divider */}
      <View style={{height: s.base}} />
      <Skeleton width="100%" height={1} />
      {/* Comments */}
      <View style={{height: s.base}} />
      <Skeleton width={120} height={14} />
      <View style={{height: s.sm}} />
      {POST_DETAIL_COMMENT_KEYS.map(slotKey => (
        <View key={slotKey} style={[styles.row, {marginBottom: s.sm}]}>
          <Skeleton width={32} height={32} borderRadius={16} />
          <View style={[styles.flex1, {marginLeft: s.sm}]}>
            <Skeleton width="70%" height={12} />
            <View style={{height: s.xs}} />
            <Skeleton width="50%" height={12} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center'},
  flex1: {flex: 1},
});
