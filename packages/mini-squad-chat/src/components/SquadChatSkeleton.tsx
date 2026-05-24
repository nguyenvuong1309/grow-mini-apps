import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'host/theme';
import { Skeleton } from 'host/shared/ui';

export function SquadChatSkeleton() {
  const { spacing: s, borderRadius: br } = useTheme();
  const messages = [
    { id: 'm1', align: 'left' as const, width: '65%', h: 40 },
    { id: 'm2', align: 'right' as const, width: '55%', h: 36 },
    { id: 'm3', align: 'left' as const, width: '75%', h: 52 },
    { id: 'm4', align: 'right' as const, width: '50%', h: 36 },
    { id: 'm5', align: 'left' as const, width: '60%', h: 44 },
  ];
  return (
    <View style={styles.container}>
      {messages.map(msg => (
        <View
          key={msg.id}
          style={[
            styles.msgRow,
            msg.align === 'right' ? styles.msgRight : styles.msgLeft,
            { marginBottom: s.base },
          ]}
        >
          {msg.align === 'left' && (
            <Skeleton
              width={32}
              height={32}
              borderRadius={16}
              style={{ marginRight: s.sm }}
            />
          )}
          <View style={msg.align === 'right' ? styles.rightBubble : undefined}>
            <Skeleton width={msg.width} height={msg.h} borderRadius={br.lg} />
            <View style={{ height: s.xs }} />
            <Skeleton width={40} height={10} />
          </View>
        </View>
      ))}
      {/* Input bar */}
      <View style={[styles.inputRow, { marginTop: s.base }]}>
        <Skeleton width="85%" height={40} borderRadius={br.xl} />
        <Skeleton width={40} height={40} borderRadius={20} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'flex-end' },
  msgRow: { flexDirection: 'row' },
  msgLeft: { alignSelf: 'flex-start', alignItems: 'flex-end' },
  msgRight: { alignSelf: 'flex-end' },
  rightBubble: { alignItems: 'flex-end' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
