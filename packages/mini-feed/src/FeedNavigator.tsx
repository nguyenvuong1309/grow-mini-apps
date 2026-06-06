import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {getHostSDK} from '@grow/host-sdk';
import {FeedScreen} from './screens/FeedScreen';
import {PostDetailScreen} from './screens/PostDetailScreen';
import {feedReducer} from './state/feed.slice';
import {feedSagas} from './state/feed.sagas';

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
  useEffect(() => {
    // Graft the feed vertical into the host store at mount. injectReducer is
    // idempotent host-side; the saga is cancelled on unmount.
    const sdk = getHostSDK();
    sdk.store.injectReducer('feed', feedReducer);
    const cancelSaga = sdk.store.injectSaga('feed', feedSagas);
    return () => {
      cancelSaga();
    };
  }, []);

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
