import React from 'react';
import {View, StyleSheet, type ViewStyle, type ViewProps} from 'react-native';
import {useTheme} from '../theme/ThemeContext';

interface CardProps extends ViewProps {
  padding?: number;
  style?: ViewStyle;
}

export function Card({padding, style, children, ...props}: CardProps) {
  const {colors: c, borderRadius: br, spacing: s, shadows: sh} = useTheme();

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: c.surfaceElevated,
          borderRadius: br.xl,
          padding: padding ?? s.base,
          borderWidth: 1,
          borderColor: c.borderLight,
        },
        sh.md,
        style,
      ]}
      {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
