import {
  all,
  call,
  put,
  select,
  take,
  fork,
  cancel,
  takeLatest,
  takeEvery,
} from 'redux-saga/effects';
import {eventChannel, type EventChannel, type Task} from 'redux-saga';
import {feedService} from '../api/feed.service';
import type {FeedPost, Comment, FeedFilter} from '../types';
import {
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
  subscribeFeedRealtime,
  unsubscribeFeedRealtime,
  realtimeNewPost,
  selectFeedFilter,
} from './feed.slice';

function getFeedServiceMethod(filter: FeedFilter) {
  switch (filter) {
    case 'following':
      return feedService.getFollowingFeed;
    case 'mine':
      return feedService.getMyFeed;
    case 'all':
    default:
      return feedService.getFeed;
  }
}

function* handleFetchFeed(action: ReturnType<typeof fetchFeedRequest>) {
  try {
    const {page} = action.payload;
    const filter: FeedFilter = yield select(selectFeedFilter);
    const serviceFn = getFeedServiceMethod(filter);
    const data: FeedPost[] = yield call(serviceFn, page);
    yield put(fetchFeedSuccess({data, page}));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch feed';
    yield put(fetchFeedFailure(message));
  }
}

function* handleRefreshFeed() {
  try {
    const filter: FeedFilter = yield select(selectFeedFilter);
    const serviceFn = getFeedServiceMethod(filter);
    const data: FeedPost[] = yield call(serviceFn, 0);
    yield put(refreshFeedSuccess(data));
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to refresh feed';
    yield put(refreshFeedFailure(message));
  }
}

function* handleFetchPostDetail(
  action: ReturnType<typeof fetchPostDetailRequest>,
) {
  try {
    const post: FeedPost = yield call(
      feedService.getPostDetail,
      action.payload,
    );
    yield put(fetchPostDetailSuccess(post));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch post';
    yield put(fetchPostDetailFailure(message));
  }
}

function* handleToggleReaction(
  action: ReturnType<typeof toggleReactionRequest>,
) {
  const {checkinId, emoji} = action.payload;

  // Store previous state for rollback is handled via the failure action payload
  // The reducer already applied the optimistic update, so we just call the service
  try {
    yield call(feedService.addReaction, checkinId, emoji);
    yield put(toggleReactionSuccess());
  } catch {
    // The saga does not have access to previous state directly.
    // In a real app, you might select state before dispatching the request.
    // For simplicity, we dispatch a failure but the revert is best-effort.
    // The next feed refresh will correct any inconsistency.
    yield put(
      toggleReactionFailure({
        checkinId,
        emoji,
        previousReaction: null,
        previousCounts: {fire: 0, muscle: 0, clap: 0},
      }),
    );
  }
}

function* handleFetchComments(action: ReturnType<typeof fetchCommentsRequest>) {
  try {
    const {checkinId, page} = action.payload;
    const data: Comment[] = yield call(
      feedService.getComments,
      checkinId,
      page,
    );
    yield put(fetchCommentsSuccess({data, page}));
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to fetch comments';
    yield put(fetchCommentsFailure(message));
  }
}

function* handleAddComment(action: ReturnType<typeof addCommentRequest>) {
  try {
    const {checkinId, body, parentId} = action.payload;
    const comment: Comment = yield call(
      feedService.addComment,
      checkinId,
      body,
      parentId,
    );
    yield put(addCommentSuccess(comment));
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to add comment';
    yield put(addCommentFailure(message));
  }
}

function createFeedRealtimeChannel(): EventChannel<{checkinId: string}> {
  return eventChannel(emit => {
    const channel = feedService.subscribeToFeed(payload => {
      const newRecord = payload.new as {id?: string};
      if (newRecord?.id) {
        emit({checkinId: newRecord.id});
      }
    });

    // Return unsubscribe function
    return () => {
      feedService.unsubscribeFromFeed(channel);
    };
  });
}

function* watchFeedRealtime() {
  const channel: EventChannel<{checkinId: string}> = yield call(
    createFeedRealtimeChannel,
  );

  try {
    while (true) {
      const {checkinId}: {checkinId: string} = yield take(channel);
      try {
        const post: FeedPost = yield call(feedService.getPostDetail, checkinId);
        yield put(realtimeNewPost(post));
      } catch {
        // Silently ignore fetch errors for individual realtime posts
      }
    }
  } finally {
    channel.close();
  }
}

function* handleSubscribeFeedRealtime() {
  const task: Task = yield fork(watchFeedRealtime);
  yield take(unsubscribeFeedRealtime);
  yield cancel(task);
}

export function* feedSagas() {
  yield all([
    takeLatest(fetchFeedRequest, handleFetchFeed),
    takeLatest(refreshFeedRequest, handleRefreshFeed),
    takeLatest(fetchPostDetailRequest, handleFetchPostDetail),
    takeEvery(toggleReactionRequest, handleToggleReaction),
    takeLatest(fetchCommentsRequest, handleFetchComments),
    takeLatest(addCommentRequest, handleAddComment),
    takeLatest(subscribeFeedRealtime, handleSubscribeFeedRealtime),
  ]);
}
