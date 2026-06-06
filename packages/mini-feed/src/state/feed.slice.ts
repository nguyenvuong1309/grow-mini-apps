import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type {Comment, ReactionEmoji, FeedPost, FeedFilter} from '../types';

interface FeedState {
  posts: FeedPost[];
  currentPost: FeedPost | null;
  comments: Comment[];
  replyingTo: Comment | null;
  feedFilter: FeedFilter;
  isLoading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  isCommenting: boolean;
  hasMore: boolean;
  page: number;
  commentsHasMore: boolean;
  commentsPage: number;
  error: string | null;
}

const initialState: FeedState = {
  posts: [],
  currentPost: null,
  comments: [],
  replyingTo: null,
  feedFilter: 'all' as FeedFilter,
  isLoading: false,
  isLoadingMore: false,
  isRefreshing: false,
  isCommenting: false,
  hasMore: true,
  page: 0,
  commentsHasMore: true,
  commentsPage: 0,
  error: null,
};

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearCurrentPost(state) {
      state.currentPost = null;
    },
    resetComments(state) {
      state.comments = [];
      state.commentsPage = 0;
      state.commentsHasMore = true;
    },
    setReplyingTo(state, action: PayloadAction<Comment | null>) {
      state.replyingTo = action.payload;
    },
    clearReplyingTo(state) {
      state.replyingTo = null;
    },

    setFeedFilter(state, action: PayloadAction<FeedFilter>) {
      state.feedFilter = action.payload;
      state.posts = [];
      state.page = 0;
      state.hasMore = true;
      state.error = null;
    },

    // Realtime Feed
    subscribeFeedRealtime(_state) {
      // Handled by saga
    },
    unsubscribeFeedRealtime(_state) {
      // Handled by saga
    },
    realtimeNewPost(state, action: PayloadAction<FeedPost>) {
      // Prepend new post, avoid duplicates by checking id
      const exists = state.posts.some(p => p.id === action.payload.id);
      if (!exists) {
        state.posts = [action.payload, ...state.posts];
      }
    },

    // Fetch Feed
    fetchFeedRequest(state, action: PayloadAction<{page: number}>) {
      const {page} = action.payload;
      if (page === 0) {
        state.isLoading = true;
      } else {
        state.isLoadingMore = true;
      }
      state.error = null;
    },
    fetchFeedSuccess(
      state,
      action: PayloadAction<{data: FeedPost[]; page: number}>,
    ) {
      state.isLoading = false;
      state.isLoadingMore = false;
      const {data, page} = action.payload;
      if (page === 0) {
        state.posts = data;
      } else {
        state.posts = [...state.posts, ...data];
      }
      state.page = page;
      state.hasMore = data.length === 20;
    },
    fetchFeedFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.isLoadingMore = false;
      state.error = action.payload;
    },

    // Refresh Feed
    refreshFeedRequest(state) {
      state.isRefreshing = true;
      state.error = null;
    },
    refreshFeedSuccess(state, action: PayloadAction<FeedPost[]>) {
      state.isRefreshing = false;
      state.posts = action.payload;
      state.page = 0;
      state.hasMore = action.payload.length === 20;
    },
    refreshFeedFailure(state, action: PayloadAction<string>) {
      state.isRefreshing = false;
      state.error = action.payload;
    },

    // Fetch Post Detail
    fetchPostDetailRequest(state, _action: PayloadAction<string>) {
      state.isLoading = true;
      state.error = null;
    },
    fetchPostDetailSuccess(state, action: PayloadAction<FeedPost>) {
      state.isLoading = false;
      state.currentPost = action.payload;
    },
    fetchPostDetailFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Toggle Reaction (optimistic)
    toggleReactionRequest(
      state,
      action: PayloadAction<{checkinId: string; emoji: ReactionEmoji}>,
    ) {
      const {checkinId, emoji} = action.payload;

      const updatePost = (post: FeedPost): FeedPost => {
        if (post.id !== checkinId) {
          return post;
        }

        const newCounts = {...post.reactions_count};
        let newUserReaction: ReactionEmoji | null;

        if (post.user_reaction === emoji) {
          // Toggle off
          newCounts[emoji] = Math.max(0, newCounts[emoji] - 1);
          newUserReaction = null;
        } else {
          // Remove old reaction count
          if (post.user_reaction) {
            newCounts[post.user_reaction] = Math.max(
              0,
              newCounts[post.user_reaction] - 1,
            );
          }
          // Add new reaction count
          newCounts[emoji] = newCounts[emoji] + 1;
          newUserReaction = emoji;
        }

        return {
          ...post,
          reactions_count: newCounts,
          user_reaction: newUserReaction,
        };
      };

      state.posts = state.posts.map(updatePost);
      if (state.currentPost?.id === checkinId) {
        state.currentPost = updatePost(state.currentPost);
      }
    },
    toggleReactionSuccess(_state) {
      // Optimistic update already applied
    },
    toggleReactionFailure(
      state,
      action: PayloadAction<{
        checkinId: string;
        emoji: ReactionEmoji;
        previousReaction: ReactionEmoji | null;
        previousCounts: {fire: number; muscle: number; clap: number};
      }>,
    ) {
      // Revert optimistic update
      const {checkinId, previousReaction, previousCounts} = action.payload;

      const revertPost = (post: FeedPost): FeedPost => {
        if (post.id !== checkinId) {
          return post;
        }
        return {
          ...post,
          reactions_count: previousCounts,
          user_reaction: previousReaction,
        };
      };

      state.posts = state.posts.map(revertPost);
      if (state.currentPost?.id === checkinId) {
        state.currentPost = revertPost(state.currentPost);
      }
    },

    // Fetch Comments
    fetchCommentsRequest(
      state,
      action: PayloadAction<{checkinId: string; page: number}>,
    ) {
      if (action.payload.page === 0) {
        state.isLoading = true;
      }
      state.error = null;
    },
    fetchCommentsSuccess(
      state,
      action: PayloadAction<{data: Comment[]; page: number}>,
    ) {
      state.isLoading = false;
      const {data, page} = action.payload;
      if (page === 0) {
        state.comments = data;
      } else {
        state.comments = [...state.comments, ...data];
      }
      state.commentsPage = page;
      state.commentsHasMore = data.length === 20;
    },
    fetchCommentsFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Add Comment
    addCommentRequest(
      state,
      _action: PayloadAction<{
        checkinId: string;
        body: string;
        parentId?: string;
      }>,
    ) {
      state.isCommenting = true;
      state.error = null;
    },
    addCommentSuccess(state, action: PayloadAction<Comment>) {
      state.isCommenting = false;
      state.replyingTo = null;
      state.comments = [...state.comments, action.payload];

      // Update comment count on the post
      const checkinId = action.payload.checkin_id;
      state.posts = state.posts.map(p =>
        p.id === checkinId ? {...p, comments_count: p.comments_count + 1} : p,
      );
      if (state.currentPost?.id === checkinId) {
        state.currentPost = {
          ...state.currentPost,
          comments_count: state.currentPost.comments_count + 1,
        };
      }
    },
    addCommentFailure(state, action: PayloadAction<string>) {
      state.isCommenting = false;
      state.error = action.payload;
    },
  },
});

export const {
  clearError,
  clearCurrentPost,
  resetComments,
  subscribeFeedRealtime,
  unsubscribeFeedRealtime,
  realtimeNewPost,
  setReplyingTo,
  clearReplyingTo,
  setFeedFilter,
  fetchFeedRequest,
  fetchFeedSuccess,
  fetchFeedFailure,
  refreshFeedRequest,
  refreshFeedSuccess,
  refreshFeedFailure,
  fetchPostDetailRequest,
  fetchPostDetailSuccess,
  fetchPostDetailFailure,
  toggleReactionRequest,
  toggleReactionSuccess,
  toggleReactionFailure,
  fetchCommentsRequest,
  fetchCommentsSuccess,
  fetchCommentsFailure,
  addCommentRequest,
  addCommentSuccess,
  addCommentFailure,
} = feedSlice.actions;

export const feedReducer = feedSlice.reducer;

// Selectors
//
// NULL-SAFE: the `feed` slice does not exist in the host store until the mini
// injects it at mount, so a selector firing before injection must not crash.
type StateWithFeed = {feed?: FeedState};

export const selectFeedPosts = (state: StateWithFeed) =>
  state.feed?.posts ?? [];
export const selectCurrentPost = (state: StateWithFeed) =>
  state.feed?.currentPost ?? null;
export const selectComments = (state: StateWithFeed) =>
  state.feed?.comments ?? [];
export const selectFeedLoading = (state: StateWithFeed) =>
  state.feed?.isLoading ?? false;
export const selectFeedRefreshing = (state: StateWithFeed) =>
  state.feed?.isRefreshing ?? false;
export const selectFeedHasMore = (state: StateWithFeed) =>
  state.feed?.hasMore ?? true;
export const selectCommentsHasMore = (state: StateWithFeed) =>
  state.feed?.commentsHasMore ?? true;
export const selectFeedPage = (state: StateWithFeed) => state.feed?.page ?? 0;
export const selectCommentsPage = (state: StateWithFeed) =>
  state.feed?.commentsPage ?? 0;
export const selectIsCommenting = (state: StateWithFeed) =>
  state.feed?.isCommenting ?? false;
export const selectIsLoadingMore = (state: StateWithFeed) =>
  state.feed?.isLoadingMore ?? false;
export const selectReplyingTo = (state: StateWithFeed) =>
  state.feed?.replyingTo ?? null;
export const selectFeedFilter = (state: StateWithFeed) =>
  state.feed?.feedFilter ?? 'all';
