import React, {useState} from 'react';
import {View, StyleSheet, Modal, useWindowDimensions} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme, Text, PressableOpacity} from '@grow/shared-ui';

interface ImageGalleryProps {
  images: string[];
  testID?: string;
}

export function ImageGallery({images, testID}: ImageGalleryProps) {
  const {colors: c, borderRadius: br} = useTheme();
  const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = useWindowDimensions();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImagePress = (uri: string) => {
    setSelectedImage(uri);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  if (images.length === 0) {
    return null;
  }

  let layout: React.ReactNode = null;

  if (images.length === 1) {
    const uri0 = images[0]!;
    layout = (
      <PressableOpacity
        testID="gallery-image-0"
        onPress={() => handleImagePress(uri0)}
        activeOpacity={0.9}>
        <FastImage
          source={{uri: uri0}}
          style={[
            styles.singleImage,
            {borderRadius: br.lg, backgroundColor: c.skeleton},
          ]}
          resizeMode={FastImage.resizeMode.cover}
        />
      </PressableOpacity>
    );
  } else if (images.length === 2) {
    layout = (
      <View style={styles.twoImageRow}>
        {images.map((uri, position) => (
          <PressableOpacity
            key={`gallery-${uri}`}
            testID={`gallery-image-${position}`}
            onPress={() => handleImagePress(uri)}
            activeOpacity={0.9}
            style={styles.twoImageItem}>
            <FastImage
              source={{uri}}
              style={[
                styles.twoImage,
                {
                  borderRadius: br.lg,
                  backgroundColor: c.skeleton,
                },
              ]}
              resizeMode={FastImage.resizeMode.cover}
            />
          </PressableOpacity>
        ))}
      </View>
    );
  } else if (images.length === 3) {
    const uri0 = images[0]!;
    const rightImages = images.slice(1, 3);
    layout = (
      <View style={styles.threeImageRow}>
        <PressableOpacity
          testID="gallery-image-0"
          onPress={() => handleImagePress(uri0)}
          activeOpacity={0.9}
          style={styles.threeImageLeft}>
          <FastImage
            source={{uri: uri0}}
            style={[
              styles.threeImageLarge,
              {borderRadius: br.lg, backgroundColor: c.skeleton},
            ]}
            resizeMode={FastImage.resizeMode.cover}
          />
        </PressableOpacity>
        <View style={styles.threeImageRight}>
          {rightImages.map((uri, offset) => {
            const position = offset + 1;
            return (
              <PressableOpacity
                key={`gallery-${uri}`}
                testID={`gallery-image-${position}`}
                onPress={() => handleImagePress(uri)}
                activeOpacity={0.9}>
                <FastImage
                  source={{uri}}
                  style={[
                    styles.threeImageSmall,
                    {borderRadius: br.lg, backgroundColor: c.skeleton},
                  ]}
                  resizeMode={FastImage.resizeMode.cover}
                />
              </PressableOpacity>
            );
          })}
        </View>
      </View>
    );
  } else {
    layout = (
      <View style={styles.fourImageGrid}>
        {images.slice(0, 4).map((uri, position) => (
          <PressableOpacity
            key={`gallery-${uri}`}
            testID={`gallery-image-${position}`}
            onPress={() => handleImagePress(uri)}
            activeOpacity={0.9}
            style={styles.fourImageItem}>
            <FastImage
              source={{uri}}
              style={[
                styles.fourImage,
                {borderRadius: br.lg, backgroundColor: c.skeleton},
              ]}
              resizeMode={FastImage.resizeMode.cover}
            />
          </PressableOpacity>
        ))}
      </View>
    );
  }

  return (
    <View testID={testID ?? 'image-gallery'}>
      {layout}

      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}>
        <SafeAreaView
          style={[styles.modalContainer, {backgroundColor: 'rgba(0,0,0,0.9)'}]}>
          <PressableOpacity
            testID="close-gallery-modal"
            onPress={handleCloseModal}
            style={styles.closeButton}>
            <Text variant="h3" color="#fff">
              {'X'}
            </Text>
          </PressableOpacity>
          {selectedImage && (
            <FastImage
              source={{uri: selectedImage}}
              style={{width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.7}}
              resizeMode={FastImage.resizeMode.contain}
            />
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  singleImage: {
    width: '100%',
    height: 200,
  },
  twoImageRow: {
    flexDirection: 'row',
    gap: 4,
  },
  twoImageItem: {
    flex: 1,
  },
  twoImage: {
    width: '100%',
    height: 160,
  },
  threeImageRow: {
    flexDirection: 'row',
    gap: 4,
    height: 200,
  },
  threeImageLeft: {
    flex: 1,
  },
  threeImageLarge: {
    width: '100%',
    height: '100%',
  },
  threeImageRight: {
    flex: 1,
    gap: 4,
  },
  threeImageSmall: {
    width: '100%',
    flex: 1,
  },
  fourImageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  fourImageItem: {
    width: '49%',
  },
  fourImage: {
    width: '100%',
    height: 120,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
