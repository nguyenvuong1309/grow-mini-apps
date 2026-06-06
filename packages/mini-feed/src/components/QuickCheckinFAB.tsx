import React, {useState} from 'react';
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme, Text, Spinner, PressableOpacity} from '@grow/shared-ui';
import {useDispatch, useSelector} from 'react-redux';
import {
  fetchMyChallengesRequest,
  selectMyChallenges,
  selectFeedLoading,
} from '../local/state';
import type {Challenge} from '../local/state';

// Loose nav typing: check-in navigates into the host's ChallengeStack, which
// is not part of this mini-app's local navigator. The route name strings are
// resolved against the host navigator at runtime.
type LooseNav = {navigate: (name: string, params?: unknown) => void};

export function QuickCheckinFAB() {
  const {colors: c, spacing: s, borderRadius: br, shadows: sh} = useTheme();
  const {navigate} = useNavigation<LooseNav>();
  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);
  const challenges = useSelector(selectMyChallenges);
  // The host challenges slice toggles isLoading while fetching myChallenges.
  // We don't have a dedicated selector, so surface the shared feed/challenges
  // loading state via a local fetching flag set on open instead.
  const isLoadingFromStore = useSelector(selectFeedLoading);
  const [hasRequested, setHasRequested] = useState(false);

  const fetchActiveChallenges = () => {
    setHasRequested(true);
    dispatch(fetchMyChallengesRequest('active'));
  };

  const handleFABPress = () => {
    setIsOpen(true);
    fetchActiveChallenges();
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleChallengePress = (challenge: Challenge) => {
    handleClose();
    navigate('ChallengeStack', {
      screen: 'Challenge.CheckIn',
      params: {challengeId: challenge.id},
    });
  };

  // Show the spinner only until challenges arrive in the store after a request.
  const isFetching =
    hasRequested && challenges.length === 0 && isLoadingFromStore;

  const renderChallengeItem = ({item}: {item: Challenge}) => (
    <Pressable
      testID={`quick-checkin-item-${item.id}`}
      onPress={() => handleChallengePress(item)}
      style={[
        styles.challengeItem,
        {
          backgroundColor: c.surfaceElevated,
          borderRadius: br.lg,
          borderColor: c.borderLight,
          padding: s.base,
          marginBottom: s.sm,
          marginHorizontal: s.base,
        },
      ]}>
      <View style={{flex: 1}}>
        <Text variant="body" bold numberOfLines={1}>
          {item.name}
        </Text>
        <Text variant="caption" color={c.textSecondary}>
          {item.checkin_type} check-in
        </Text>
      </View>
      <Text variant="body" color={c.primary}>
        {'>'}
      </Text>
    </Pressable>
  );

  return (
    <>
      {/* FAB */}
      <PressableOpacity
        testID="quick-checkin-fab"
        onPress={handleFABPress}
        activeOpacity={0.8}
        style={[
          styles.fab,
          {
            backgroundColor: c.primary,
            borderRadius: br.full ?? 999,
          },
          sh.lg,
        ]}>
        <Text style={styles.fabIcon} color={c.textInverse}>
          +
        </Text>
      </PressableOpacity>

      {/* Bottom Sheet */}
      <Modal
        animationType="slide"
        transparent={Platform.OS === 'android'}
        presentationStyle={Platform.OS === 'ios' ? 'formSheet' : undefined}
        visible={isOpen}
        onRequestClose={handleClose}>
        {Platform.OS === 'android' && (
          <Pressable style={styles.backdrop} onPress={handleClose} />
        )}
        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: c.surface,
              borderTopLeftRadius: Platform.OS === 'android' ? br.xl : 0,
              borderTopRightRadius: Platform.OS === 'android' ? br.xl : 0,
            },
          ]}>
          <View style={[styles.sheetHeader, {paddingHorizontal: s.base}]}>
            <Text variant="h3">Quick Check-in</Text>
            <PressableOpacity
              testID="quick-checkin-close-btn"
              onPress={handleClose}>
              <Text variant="body" color={c.textSecondary}>
                Close
              </Text>
            </PressableOpacity>
          </View>

          <Text
            variant="bodySmall"
            color={c.textSecondary}
            style={{
              paddingHorizontal: s.base,
              marginBottom: s.sm,
            }}>
            Select a challenge to check in
          </Text>

          {isFetching ? (
            <View style={styles.loadingContainer}>
              <Spinner />
            </View>
          ) : (
            <FlatList
              testID="quick-checkin-list"
              data={challenges}
              keyExtractor={(item: Challenge) => item.id}
              renderItem={renderChallengeItem}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text variant="body" color={c.textSecondary} center>
                    No active challenges
                  </Text>
                  <Text variant="caption" color={c.textTertiary} center>
                    Join a challenge first to check in
                  </Text>
                </View>
              }
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 3px 6px rgba(0,0,0,0.27)',
    zIndex: 10,
  },
  fabIcon: {
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 30,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheetContainer: {
    flex: 1,
    paddingTop: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 4,
  },
});
