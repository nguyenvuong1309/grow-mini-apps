import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useTheme} from '../theme/ThemeContext';

interface DividerProps {
  spacing?: number;
}

export function Divider({spacing: s}: DividerProps) {
  const {colors: c, spacing: sp} = useTheme();
  const margin = s ?? sp.base;

  return (
    <View
      style={[
        styles.line,
        {
          backgroundColor: c.border,
          marginVertical: margin,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  line: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
});
