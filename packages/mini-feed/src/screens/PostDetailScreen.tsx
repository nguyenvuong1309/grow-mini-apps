import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import {useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import {
  useTheme,
  ScreenContainer,
  Badge,
  Text,
  Spinner,
  Divider,
  SkeletonProvider,
  Avatar,
  PressableOpacity,
} from '@grow/shared-ui';
import {useDispatch, useSelector} from 'react-redux';
import {PostDetailSkeleton} from '../components/PostDetailSkeleton';
import {ReactionBar} from '../components/ReactionBar';
import {CommentItem} from '../components/CommentItem';
import type {CommentWithReplies} from '../components/CommentItem';
import {ImageGallery} from '../components/ImageGallery';
import {
  fetchPostDetailRequest,
  fetchCommentsRequest,
  addCommentRequest,
  toggleReactionRequest,
  resetComments,
  clearCurrentPost,
  setReplyingTo,
  clearReplyingTo,
  selectCurrentPost,
  selectComments,
  selectFeedLoading,
  selectIsCommenting,
  selectCommentsHasMore,
  selectCommentsPage,
  selectReplyingTo,
} from '../local/state';
import type {Comment, ReactionEmoji, FeedPost} from '../local/state';
import type {FeedStackParamList} from '../FeedNavigator';

type PostDetailRoute = RouteProp<FeedStackParamList, 'PostDetail'>;

function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'just now';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  return `${diffDays}d ago`;
}

/**
 * Groups flat comments into threaded structure.
 * Top-level comments (parent_id === null) get their replies nested.
 * Replies deeper than 2 levels are flattened under the level-1 parent.
 */
function buildCommentTree(comments: Comment[]): CommentWithReplies[] {
  const topLevel: CommentWithReplies[] = [];
  const childMap = new Map<string, Comment[]>();

  // First pass: separate top-level and child comments
  for (const comment of comments) {
    if (!comment.parent_id) {
      topLevel.push({...comment, replies: []});
    } else {
      const existing = childMap.get(comment.parent_id) ?? [];
      existing.push(comment);
      childMap.set(comment.parent_id, existing);
    }
  }

  // Second pass: attach replies to their parents
  // For replies whose parent is also a reply (depth > 1), flatten under the
  // nearest top-level ancestor by attaching to the level-1 parent.
  for (const parent of topLevel) {
    const directReplies = childMap.get(parent.id) ?? [];
    parent.replies = [...directReplies];

    // Collect deeper replies: iterate through direct replies and gather
    // any comments that reference them (depth 2+), flatten them into
    // the direct replies array of the top-level comment
    for (const reply of directReplies) {
      const deeperReplies = childMap.get(reply.id) ?? [];
      parent.replies.push(...deeperReplies);
      // Continue flattening even deeper levels
      const queue = [...deeperReplies];
      while (queue.length > 0) {
        const current = queue.shift()!;
        const evenDeeper = childMap.get(current.id) ?? [];
        parent.replies.push(...evenDeeper);
        queue.push(...evenDeeper);
      }
    }
  }

  // Handle orphan replies whose parent_id doesn't match any known comment
  // (e.g. parent was deleted or not loaded). Show them as top-level.
  const allAssignedIds = new Set<string>();
  for (const parent of topLevel) {
    allAssignedIds.add(parent.id);
    for (const reply of parent.replies) {
      allAssignedIds.add(reply.id);
    }
  }
  for (const comment of comments) {
    if (!allAssignedIds.has(comment.id)) {
      topLevel.push({...comment, replies: []});
    }
  }

  return topLevel;
}

interface PostAuthorHeaderProps {
  post: FeedPost;
}

function PostAuthorHeader({post}: PostAuthorHeaderProps) {
  const {spacing: s} = useTheme();
  return (
    <View style={[styles.postHeader, {marginBottom: s.sm}]}>
      <Avatar
        uri={post.profile.avatar_url}
        name={post.profile.display_name}
        size="lg"
      />
      <View style={[styles.postHeaderInfo, {marginLeft: s.sm}]}>
        <Text variant="h3">{post.profile.display_name}</Text>
        <View style={[styles.metaRow, {marginTop: 2}]}>
          <Badge label={post.challenge_name} variant="secondary" />
          <Text variant="caption" style={{marginLeft: s.sm}}>
            {formatRelativeTime(post.created_at)}
          </Text>
        </View>
      </View>
    </View>
  );
}

interface PostMediaProps {
  post: FeedPost;
  images: string[];
}

function PostMedia({post, images}: PostMediaProps) {
  const {colors: c, spacing: s} = useTheme();

  return (
    <>
      {images.length > 1 ? (
        <ImageGallery testID="post-detail-image-gallery" images={images} />
      ) : post.image_url ? (
        <FastImage
          source={{uri: post.image_url}}
          style={[
            styles.fullImage,
            {borderRadius: 12, backgroundColor: c.skeleton},
          ]}
          resizeMode={FastImage.resizeMode.cover}
        />
      ) : null}

      {post.text_content ? (
        <Text variant="body" style={{marginTop: post.image_url ? s.sm : 0}}>
          {post.text_content}
        </Text>
      ) : null}

      {post.metric_value != null && (
        <View
          style={[
            styles.metricContainer,
            {
              backgroundColor: c.primaryLight,
              borderRadius: 12,
              padding: s.lg,
              marginTop: s.sm,
            },
          ]}>
          <Text variant="h2" color={c.primary} center>
            {post.metric_value}
          </Text>
          <Text variant="caption" center>
            metric value
          </Text>
        </View>
      )}

      {post.is_tick &&
        !post.image_url &&
        !post.text_content &&
        post.metric_value == null && (
          <View
            style={[
              styles.tickContainer,
              {
                backgroundColor: c.successLight,
                borderRadius: 12,
                padding: s.lg,
                marginTop: s.sm,
              },
            ]}>
            <Text variant="h2" color={c.success} center>
              {'✓'}
            </Text>
            <Text variant="bodySmall" center>
              Checked in!
            </Text>
          </View>
        )}
    </>
  );
}

interface PostReactionsSectionProps {
  post: FeedPost;
  onToggle: (emoji: ReactionEmoji) => void;
}

function PostReactionsSection({post, onToggle}: PostReactionsSectionProps) {
  const {spacing: s} = useTheme();
  return (
    <>
      <View style={{marginTop: s.base}}>
        <ReactionBar
          reactions={post.reactions_count}
          userReaction={post.user_reaction}
          onToggle={onToggle}
        />
      </View>

      <Divider />

      <Text variant="label" style={{marginBottom: s.xs}}>
        Comments ({post.comments_count})
      </Text>
    </>
  );
}

interface PostDetailHeaderProps {
  post: FeedPost;
  images: string[];
  onReactionToggle: (emoji: ReactionEmoji) => void;
}

function PostDetailHeader({
  post,
  images,
  onReactionToggle,
}: PostDetailHeaderProps) {
  const {spacing: s} = useTheme();
  return (
    <View
      testID="post-detail-content"
      style={{paddingTop: s.xl, paddingBottom: s.sm}}>
      <PostAuthorHeader post={post} />
      <PostMedia post={post} images={images} />
      <PostReactionsSection post={post} onToggle={onReactionToggle} />
    </View>
  );
}

interface ReplyIndicatorProps {
  replyingTo: Comment;
  onCancel: () => void;
}

function ReplyIndicator({replyingTo, onCancel}: ReplyIndicatorProps) {
  const {colors: c, spacing: s} = useTheme();
  return (
    <View
      style={[
        styles.replyIndicator,
        {
          paddingHorizontal: s.base,
          paddingVertical: s.xs,
          backgroundColor: c.surface,
          borderTopWidth: 1,
          borderTopColor: c.borderLight,
        },
      ]}>
      <Text
        variant="caption"
        color={c.textSecondary}
        style={styles.replyIndicatorText}>
        Replying to {replyingTo.profile?.display_name ?? 'Unknown'}
      </Text>
      <PressableOpacity onPress={onCancel}>
        <Text variant="caption" color={c.primary} bold>
          Cancel
        </Text>
      </PressableOpacity>
    </View>
  );
}

interface CommentInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  isSending: boolean;
  replyingTo: Comment | null;
  ref?: React.Ref<TextInput>;
}

function CommentInput({
  value,
  onChangeText,
  onSend,
  isSending,
  replyingTo,
  ref,
}: CommentInputProps) {
  const {colors: c, spacing: s, borderRadius: br, typography: t} = useTheme();
  const trimmed = value.trim();
  const canSend = Boolean(trimmed) && !isSending;

  return (
    <View
      style={[
        styles.inputContainer,
        {
          borderTopWidth: replyingTo ? 0 : 1,
          borderTopColor: c.borderLight,
          paddingHorizontal: s.base,
          paddingVertical: s.sm,
          backgroundColor: c.background,
        },
      ]}>
      <TextInput
        ref={ref}
        style={[
          styles.textInput,
          {
            backgroundColor: c.surface,
            borderRadius: br.lg,
            color: c.text,
            fontSize: t.sizes.base,
            paddingHorizontal: s.sm,
            paddingVertical: s.xs,
          },
        ]}
        placeholder={
          replyingTo
            ? `Reply to ${replyingTo.profile?.display_name ?? 'Unknown'}...`
            : 'Add a comment...'
        }
        placeholderTextColor={c.textTertiary}
        value={value}
        onChangeText={onChangeText}
        multiline
        maxLength={500}
      />
      <PressableOpacity
        onPress={onSend}
        disabled={!trimmed || isSending}
        style={[
          styles.sendButton,
          {
            backgroundColor: canSend ? c.primary : c.primaryLight,
            borderRadius: br.full,
            marginLeft: s.sm,
          },
        ]}>
        {isSending ? (
          <Spinner size="small" />
        ) : (
          <Text
            variant="bodySmall"
            bold
            color={trimmed ? c.textInverse : c.textTertiary}>
            Send
          </Text>
        )}
      </PressableOpacity>
    </View>
  );
}

export function PostDetailScreen() {
  const {spacing: s} = useTheme();
  const dispatch = useDispatch();
  const route = useRoute<PostDetailRoute>();
  const {postId} = route.params;

  const post = useSelector(selectCurrentPost);
  const comments = useSelector(selectComments);
  const isLoading = useSelector(selectFeedLoading);
  const isCommenting = useSelector(selectIsCommenting);
  const commentsHasMore = useSelector(selectCommentsHasMore);
  const commentsPage = useSelector(selectCommentsPage);
  const replyingTo = useSelector(selectReplyingTo);
  const [commentText, setCommentText] = useState('');
  const flatListRef = useRef<FlatList<CommentWithReplies>>(null);
  const inputRef = useRef<TextInput>(null);

  const threadedComments = buildCommentTree(comments);

  useEffect(() => {
    dispatch(fetchPostDetailRequest(postId));
    dispatch(resetComments());
    dispatch(fetchCommentsRequest({checkinId: postId, page: 0}));

    return () => {
      dispatch(clearCurrentPost());
      dispatch(resetComments());
      dispatch(clearReplyingTo());
    };
  }, [dispatch, postId]);

  const prevCommentsLength = useRef(comments.length);
  useEffect(() => {
    if (comments.length > prevCommentsLength.current && comments.length > 0) {
      const id = setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 100);
      prevCommentsLength.current = comments.length;
      return () => clearTimeout(id);
    }
    prevCommentsLength.current = comments.length;
  }, [comments.length]);

  const handleReactionToggle = (emoji: ReactionEmoji) => {
    dispatch(toggleReactionRequest({checkinId: postId, emoji}));
  };

  const handleReply = (comment: Comment) => {
    dispatch(setReplyingTo(comment));
    inputRef.current?.focus();
  };

  const handleCancelReply = () => {
    dispatch(clearReplyingTo());
  };

  const handleSendComment = () => {
    const trimmed = commentText.trim();
    if (!trimmed || isCommenting) {
      return;
    }
    dispatch(
      addCommentRequest({
        checkinId: postId,
        body: trimmed,
        parentId: replyingTo?.id,
      }),
    );
    setCommentText('');
  };

  const handleLoadMoreComments = () => {
    if (commentsHasMore && !isLoading) {
      dispatch(
        fetchCommentsRequest({checkinId: postId, page: commentsPage + 1}),
      );
    }
  };

  const renderComment = ({item}: {item: CommentWithReplies}) => (
    <CommentItem comment={item} onReply={handleReply} />
  );

  const allPostImages = post
    ? [
        ...(post.image_url ? [post.image_url] : []),
        ...(post.additional_images && Array.isArray(post.additional_images)
          ? post.additional_images
          : []),
      ]
    : [];

  const renderHeader = () => {
    if (!post) {
      return null;
    }
    return (
      <PostDetailHeader
        post={post}
        images={allPostImages}
        onReactionToggle={handleReactionToggle}
      />
    );
  };

  if (isLoading && !post) {
    return (
      <ScreenContainer>
        <SkeletonProvider>
          <PostDetailSkeleton />
        </SkeletonProvider>
      </ScreenContainer>
    );
  }

  if (!post) {
    return (
      <ScreenContainer>
        <View style={styles.errorContainer}>
          <Text variant="bodySmall" center>
            Post not found
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer testID="post-detail-screen" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <FlatList
          testID="post-detail-comments"
          ref={flatListRef}
          data={threadedComments}
          keyExtractor={item => item.id}
          renderItem={renderComment}
          ListHeaderComponent={renderHeader}
          onEndReached={handleLoadMoreComments}
          onEndReachedThreshold={0.3}
          ListFooterComponent={<View style={{height: s.base}} />}
          ListEmptyComponent={
            <View style={styles.emptyComments}>
              <Text variant="bodySmall" center>
                No comments yet. Be the first!
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />

        {replyingTo && (
          <ReplyIndicator
            replyingTo={replyingTo}
            onCancel={handleCancelReply}
          />
        )}

        <CommentInput
          ref={inputRef}
          value={commentText}
          onChangeText={setCommentText}
          onSend={handleSendComment}
          isSending={isCommenting}
          replyingTo={replyingTo}
        />
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postHeaderInfo: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: 300,
  },
  metricContainer: {
    alignItems: 'center',
  },
  tickContainer: {
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    minHeight: 36,
    maxHeight: 80,
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyComments: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  replyIndicatorText: {
    flex: 1,
  },
});
