import React from 'react';
import {ScrollView, View, StyleSheet, type ViewStyle} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeContext';

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  padded?: boolean;
  style?: ViewStyle;
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
  testID?: string;
}

export function ScreenContainer({
  children,
  scrollable = false,
  padded = true,
  style,
  edges = ['top'],
  testID,
}: ScreenContainerProps) {
  const {colors: c, spacing: s} = useTheme();

  const content = (
    <View
      style={[styles.content, padded && {paddingHorizontal: s.base}, style]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView
      testID={testID}
      style={[styles.safe, {backgroundColor: c.background}]}
      edges={edges}>
      {scrollable ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
});
