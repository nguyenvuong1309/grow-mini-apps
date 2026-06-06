import React, {useEffect, useState} from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  useTheme,
  ScreenContainer,
  Text,
  EmptyState,
  SkeletonProvider,
} from '@grow/shared-ui';
import {useDispatch, useSelector} from 'react-redux';
import {FeedPostCard} from '../components/FeedPostCard';
import {FeedSkeleton} from '../components/FeedSkeleton';
import {FeedFilterTabs} from '../components/FeedFilterTabs';
import {CommentsSheet} from '../components/CommentsSheet';
import {QuickCheckinFAB} from '../components/QuickCheckinFAB';
import {
  fetchFeedRequest,
  refreshFeedRequest,
  subscribeFeedRealtime,
  unsubscribeFeedRealtime,
  setFeedFilter,
  selectFeedPosts,
  selectFeedLoading,
  selectFeedRefreshing,
  selectFeedHasMore,
  selectFeedPage,
  selectIsLoadingMore,
  selectFeedFilter,
  resetComments,
  fetchCommentsRequest,
} from '../local/state';
import type {FeedFilter, FeedPost} from '../local/state';
import type {FeedStackParamList} from '../FeedNavigator';

type Nav = NativeStackNavigationProp<FeedStackParamList>;

const EMPTY_STATE_CONFIG: Record<FeedFilter, {title: string; message: string}> =
  {
    all: {
      title: 'No posts yet',
      message:
        'Join a challenge and start checking in to see posts from your community!',
    },
    following: {
      title: 'No posts yet',
      message: 'Follow other users to see their check-ins here',
    },
    mine: {
      title: 'No posts yet',
      message: 'Complete a check-in to see it here',
    },
  };

export function FeedScreen() {
  const {colors: c, spacing: s} = useTheme();
  const dispatch = useDispatch();
  const {navigate} = useNavigation<Nav>();
  const posts = useSelector(selectFeedPosts);
  const isLoading = useSelector(selectFeedLoading);
  const isRefreshing = useSelector(selectFeedRefreshing);
  const hasMore = useSelector(selectFeedHasMore);
  const page = useSelector(selectFeedPage);
  const isLoadingMore = useSelector(selectIsLoadingMore);
  const activeFilter = useSelector(selectFeedFilter);

  const [commentsSheet, setCommentsSheet] = useState({
    visible: false,
    checkinId: '',
    instanceKey: 0,
  });

  useEffect(() => {
    dispatch(fetchFeedRequest({page: 0}));
    dispatch(subscribeFeedRealtime());

    return () => {
      dispatch(unsubscribeFeedRealtime());
    };
  }, [dispatch]);

  const handleFilterChange = (filter: FeedFilter) => {
    if (filter === activeFilter) {
      return;
    }
    dispatch(setFeedFilter(filter));
    dispatch(fetchFeedRequest({page: 0}));
  };

  const handleRefresh = () => {
    dispatch(refreshFeedRequest());
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore && !isLoading) {
      dispatch(fetchFeedRequest({page: page + 1}));
    }
  };

  const handlePostPress = (post: FeedPost) => {
    navigate('PostDetail', {postId: post.id});
  };

  const handleCommentPress = (post: FeedPost) => {
    dispatch(resetComments());
    dispatch(fetchCommentsRequest({checkinId: post.id, page: 0}));
    setCommentsSheet(prev => ({
      visible: true,
      checkinId: post.id,
      instanceKey: prev.instanceKey + 1,
    }));
  };

  const handleCloseComments = () => {
    setCommentsSheet(prev => ({...prev, visible: false}));
  };

  const renderItem = ({item}: {item: FeedPost}) => (
    <FeedPostCard
      post={item}
      onPress={handlePostPress}
      onCommentPress={handleCommentPress}
    />
  );

  const renderFooter = () => {
    if (!isLoadingMore) {
      return null;
    }
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={c.primary} />
      </View>
    );
  };

  const emptyConfig = EMPTY_STATE_CONFIG[activeFilter];

  if (isLoading && posts.length === 0) {
    return (
      <ScreenContainer>
        <FeedFilterTabs
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />
        <SkeletonProvider>
          <FeedSkeleton />
        </SkeletonProvider>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer testID="feed-screen">
      <View style={[styles.headerRow, {marginBottom: s.sm}]}>
        <Text variant="h2">Feed</Text>
      </View>

      <FeedFilterTabs
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />

      <FlatList
        testID="feed-list"
        data={posts}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={c.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        contentContainerStyle={
          posts.length === 0 ? styles.emptyList : styles.listContent
        }
        ListEmptyComponent={
          <EmptyState
            testID="feed-empty-state"
            title={emptyConfig.title}
            message={emptyConfig.message}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <CommentsSheet
        key={commentsSheet.instanceKey}
        checkinId={commentsSheet.checkinId}
        visible={commentsSheet.visible}
        onClose={handleCloseComments}
      />

      <QuickCheckinFAB />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyList: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
