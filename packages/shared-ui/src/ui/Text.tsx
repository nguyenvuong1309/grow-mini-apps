import React from 'react';
import {
  Text as RNText,
  type TextProps as RNTextProps,
  StyleSheet,
} from 'react-native';
import {useTheme} from '../theme/ThemeContext';

type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
  center?: boolean;
  bold?: boolean;
}

export function Text({
  variant = 'body',
  color,
  center,
  bold,
  style,
  children,
  ...props
}: TextProps) {
  const {colors: c, typography: t} = useTheme();

  const variantStyle = {
    h1: {
      fontSize: t.sizes['3xl'],
      fontWeight: t.weights.extrabold,
      color: c.text,
    },
    h2: {fontSize: t.sizes['2xl'], fontWeight: t.weights.bold, color: c.text},
    h3: {fontSize: t.sizes.xl, fontWeight: t.weights.semibold, color: c.text},
    body: {
      fontSize: t.sizes.base,
      fontWeight: t.weights.regular,
      color: c.text,
    },
    bodySmall: {
      fontSize: t.sizes.md,
      fontWeight: t.weights.regular,
      color: c.textSecondary,
    },
    caption: {
      fontSize: t.sizes.sm,
      fontWeight: t.weights.regular,
      color: c.textTertiary,
    },
    label: {
      fontSize: t.sizes.sm,
      fontWeight: t.weights.medium,
      color: c.textSecondary,
    },
  }[variant];

  return (
    <RNText
      style={[
        variantStyle,
        color != null && {color},
        center === true && styles.center,
        bold === true && {fontWeight: t.weights.bold},
        style,
      ]}
      {...props}>
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  center: {textAlign: 'center'},
});
