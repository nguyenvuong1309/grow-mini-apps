import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useTheme} from '../theme/ThemeContext';
import {Text} from './Text';
import {Button} from './Button';

interface EmptyStateProps {
  testID?: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  testID,
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const {spacing: s} = useTheme();

  return (
    <View
      testID={testID}
      accessibilityLabel={testID}
      style={[styles.container, {padding: s['2xl']}]}>
      <Text variant="h3" center style={{marginBottom: s.sm}}>
        {title}
      </Text>
      <Text variant="bodySmall" center style={{marginBottom: s.lg}}>
        {message}
      </Text>
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="secondary"
          size="sm"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
