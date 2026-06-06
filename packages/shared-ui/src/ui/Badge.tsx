import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useTheme} from '../theme';
import {Text} from './Text';

type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  testID?: string;
}

export function Badge({label, variant = 'primary', testID}: BadgeProps) {
  const {colors: c, borderRadius: br} = useTheme();

  const colorMap: Record<BadgeVariant, {bg: string; text: string}> = {
    primary: {bg: c.primaryLight, text: c.primary},
    secondary: {bg: c.secondaryLight, text: c.secondary},
    success: {bg: c.successLight, text: c.success},
    warning: {bg: c.warningLight, text: c.warning},
    error: {bg: c.errorLight, text: c.error},
    info: {bg: c.infoLight, text: c.info},
  };

  const badgeColors = colorMap[variant];

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        {backgroundColor: badgeColors.bg, borderRadius: br.full},
      ]}>
      <Text style={[styles.label, {color: badgeColors.text}]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});
