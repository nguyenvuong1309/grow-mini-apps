import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {requireHostSDK, type HostSDK} from '@grow/host-sdk';
import {FeedScreen} from './screens/FeedScreen';
import {PostDetailScreen} from './screens/PostDetailScreen';
import {feedReducer} from './state/feed.slice';
import {feedSagas} from './state/feed.sagas';

// Minimum Host SDK contract this mini needs. The host binary freezes its SDK
// version per release; if a user is on an older binary than this mini (OTA)
// requires, we degrade gracefully instead of crashing.
const REQUIRED_SDK = '^1.0.0';

// Inject the feed reducer + saga into the host store exactly once, app-wide.
// Done at RENDER time (not in an effect) and BEFORE children render, because a
// child's mount effect (FeedScreen dispatching fetchFeedRequest) fires before
// the parent's effect would — so an effect-based injection would miss the very
// first fetch. Idempotent via the module-level guard (+ host-side dedupe).
let feedInjected = false;
function ensureFeedInjected(sdk: HostSDK): void {
  if (feedInjected) {
    return;
  }
  feedInjected = true;
  sdk.store.injectReducer('feed', feedReducer);
  sdk.store.injectSaga('feed', feedSagas);
}

// Kept as a navigator (not a plain screen) so the host can embed it directly
// in any parent navigator without leaking nav configuration up to the host.
export type FeedStackParamList = {
  Feed: undefined;
  PostDetail: {postId: string};
};

const Stack = createNativeStackNavigator<FeedStackParamList>();

interface FeedNavigatorProps {
  /**
   * Which route to land on. The host passes `'PostDetail'` (with
   * `initialParams={{ postId }}`) when a deep link or `navigate('PostDetail')`
   * routes into this mini; otherwise it defaults to the feed list.
   */
  initialRouteName?: keyof FeedStackParamList;
  /** Params forwarded to the initial route (e.g. `{ postId }` for PostDetail). */
  initialParams?: {postId?: string};
}

export default function FeedNavigator({
  initialRouteName = 'Feed',
  initialParams,
}: FeedNavigatorProps) {
  const sdk = requireHostSDK(REQUIRED_SDK);

  if (!sdk) {
    // Host binary too old (or SDK not registered) — degrade, don't crash.
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackTitle}>Feed unavailable</Text>
        <Text style={styles.fallbackBody}>
          Please update the app to the latest version to view your feed.
        </Text>
      </View>
    );
  }

  // Bootstrap the feed vertical into the host store before children render.
  ensureFeedInjected(sdk);

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Feed" component={FeedScreen} />
      <Stack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        initialParams={
          initialRouteName === 'PostDetail' ? initialParams : undefined
        }
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  fallbackTitle: {fontSize: 18, fontWeight: '600', marginBottom: 8},
  fallbackBody: {textAlign: 'center', opacity: 0.7},
});
