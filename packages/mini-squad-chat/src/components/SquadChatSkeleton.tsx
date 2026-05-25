import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useTheme} from '../local/theme';

// Lightweight inline skeleton — plain RN, no host UI imports.
function SkeletonBox({
  width,
  height,
  borderRadius,
  style,
  color,
}: {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: object;
  color: string;
}) {
  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: borderRadius ?? 4,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

export function SquadChatSkeleton() {
  const {colors: c, spacing: s, borderRadius: br} = useTheme();
  const placeholderColor = c.border;
  const messages = [
    {id: 'm1', align: 'left' as const, width: '65%' as const, h: 40},
    {id: 'm2', align: 'right' as const, width: '55%' as const, h: 36},
    {id: 'm3', align: 'left' as const, width: '75%' as const, h: 52},
    {id: 'm4', align: 'right' as const, width: '50%' as const, h: 36},
    {id: 'm5', align: 'left' as const, width: '60%' as const, h: 44},
  ];
  return (
    <View style={styles.container}>
      {messages.map(msg => (
        <View
          key={msg.id}
          style={[
            styles.msgRow,
            msg.align === 'right' ? styles.msgRight : styles.msgLeft,
            {marginBottom: s.base},
          ]}>
          {msg.align === 'left' && (
            <SkeletonBox
              width={32}
              height={32}
              borderRadius={16}
              style={{marginRight: s.sm}}
              color={placeholderColor}
            />
          )}
          <View style={msg.align === 'right' ? styles.rightBubble : undefined}>
            <SkeletonBox
              width={msg.width}
              height={msg.h}
              borderRadius={br.lg}
              color={placeholderColor}
            />
            <View style={{height: s.xs}} />
            <SkeletonBox width={40} height={10} color={placeholderColor} />
          </View>
        </View>
      ))}
      <View style={[styles.inputRow, {marginTop: s.base}]}>
        <SkeletonBox
          width={'85%' as const}
          height={40}
          borderRadius={br.xl}
          color={placeholderColor}
        />
        <SkeletonBox
          width={40}
          height={40}
          borderRadius={20}
          color={placeholderColor}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'flex-end'},
  msgRow: {flexDirection: 'row'},
  msgLeft: {alignSelf: 'flex-start', alignItems: 'flex-end'},
  msgRight: {alignSelf: 'flex-end'},
  rightBubble: {alignItems: 'flex-end'},
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
