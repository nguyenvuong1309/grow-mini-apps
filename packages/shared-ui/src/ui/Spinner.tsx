import React from 'react';
import {ActivityIndicator, View, StyleSheet} from 'react-native';
import {useTheme} from '../theme/ThemeContext';

interface SpinnerProps {
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export function Spinner({size = 'large', fullScreen = false}: SpinnerProps) {
  const {colors: c} = useTheme();

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, {backgroundColor: c.background}]}>
        <ActivityIndicator size={size} color={c.primary} />
      </View>
    );
  }

  return <ActivityIndicator size={size} color={c.primary} />;
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
