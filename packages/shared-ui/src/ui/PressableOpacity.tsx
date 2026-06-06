import React from 'react';
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
  type PressableStateCallbackType,
} from 'react-native';

export interface PressableOpacityProps extends Omit<PressableProps, 'style'> {
  activeOpacity?: number;
  style?:
    | StyleProp<ViewStyle>
    | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);
}

export function PressableOpacity({
  activeOpacity = 0.7,
  style,
  ...rest
}: PressableOpacityProps) {
  return (
    <Pressable
      {...rest}
      style={state => {
        const resolved = typeof style === 'function' ? style(state) : style;
        return [resolved, state.pressed && {opacity: activeOpacity}];
      }}
    />
  );
}
