import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Modal,
  useWindowDimensions,
  Pressable,
  StatusBar,
} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import {useTheme} from '../theme/ThemeContext';
import {Text} from './Text';
import {PressableOpacity} from './PressableOpacity';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: AvatarSize;
  testID?: string;
  /** Enable tap to view full-screen image (only when uri is present) */
  enableFullscreen?: boolean;
}

const SIZES: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

const FONT_SIZES: Record<AvatarSize, number> = {
  sm: 12,
  md: 14,
  lg: 20,
  xl: 28,
};

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0]![0]?.toUpperCase() ?? '?';
  return `${parts[0]![0] ?? ''}${
    parts[parts.length - 1]![0] ?? ''
  }`.toUpperCase();
}

export function Avatar({
  uri,
  name,
  size = 'md',
  testID,
  enableFullscreen = false,
}: AvatarProps) {
  const {colors: c} = useTheme();
  const {width: SCREEN_WIDTH} = useWindowDimensions();
  const dim = SIZES[size];
  const fontSize = FONT_SIZES[size];
  const [visible, setVisible] = useState(false);

  const handleOpen = () => setVisible(true);
  const handleClose = () => setVisible(false);

  if (uri) {
    const imageElement = (
      <FastImage
        testID={testID}
        source={{uri}}
        style={[
          styles.image,
          {
            width: dim,
            height: dim,
            borderRadius: dim / 2,
            backgroundColor: c.skeleton,
          },
        ]}
        resizeMode={FastImage.resizeMode.cover}
      />
    );

    if (!enableFullscreen) {
      return imageElement;
    }

    return (
      <>
        <PressableOpacity
          testID={testID ? `${testID}-pressable` : undefined}
          onPress={handleOpen}
          activeOpacity={0.8}>
          {imageElement}
        </PressableOpacity>

        <Modal
          visible={visible}
          transparent
          animationType="fade"
          onRequestClose={handleClose}
          statusBarTranslucent>
          <StatusBar
            backgroundColor="rgba(0,0,0,0.95)"
            barStyle="light-content"
          />
          <Pressable style={styles.overlay} onPress={handleClose}>
            <PressableOpacity
              style={styles.closeBtn}
              onPress={handleClose}
              hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
              <Text variant="h2" color="#fff">
                X
              </Text>
            </PressableOpacity>
            <FastImage
              source={{uri}}
              style={{
                width: SCREEN_WIDTH,
                height: SCREEN_WIDTH,
                borderRadius: 0,
              }}
              resizeMode={FastImage.resizeMode.contain}
            />
            {name ? (
              <Text variant="body" color="#fff" center style={styles.fullName}>
                {name}
              </Text>
            ) : null}
          </Pressable>
        </Modal>
      </>
    );
  }

  return (
    <View
      testID={testID}
      style={[
        styles.fallback,
        {
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          backgroundColor: c.primaryLight,
        },
      ]}>
      <Text style={{fontSize, fontWeight: '600', color: c.primary}}>
        {getInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {},
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullName: {
    marginTop: 16,
  },
});
