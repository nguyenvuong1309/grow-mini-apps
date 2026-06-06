import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useTheme} from '../theme/ThemeContext';
import {Skeleton} from '../ui/Skeleton';
import {Card} from '../ui/Card';

function ChallengeCardSkeleton() {
  const {spacing: s, borderRadius: br} = useTheme();
  return (
    <Card style={{marginBottom: s.sm}}>
      <View style={styles.row}>
        <Skeleton width={40} height={40} borderRadius={br.lg} />
        <View style={[styles.flex1, {marginLeft: s.md}]}>
          <Skeleton width="70%" height={14} />
          <View style={{height: s.xs}} />
          <Skeleton width="50%" height={12} />
        </View>
        <Skeleton width={60} height={20} borderRadius={br.full} />
      </View>
      <View style={{height: s.xs}} />
      <Skeleton width="90%" height={12} />
      <View style={{height: s.sm}} />
      <View style={styles.rowBetween}>
        <Skeleton width={80} height={12} />
        <Skeleton width={60} height={12} />
      </View>
    </Card>
  );
}

const CARD_KEYS = ['card-a', 'card-b', 'card-c', 'card-d'];

export function ChallengeListSkeleton() {
  return (
    <View>
      {CARD_KEYS.map(key => (
        <ChallengeCardSkeleton key={key} />
      ))}
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
