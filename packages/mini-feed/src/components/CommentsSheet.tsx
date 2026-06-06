import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import {
  useTheme,
  Avatar,
  Text,
  Spinner,
  PressableOpacity,
} from '@grow/shared-ui';
import {useDispatch, useSelector} from 'react-redux';
import {
  fetchCommentsRequest,
  addCommentRequest,
  selectComments,
  selectFeedLoading,
  selectIsCommenting,
  selectCommentsHasMore,
  selectCommentsPage,
} from '../local/state';
import type {Comment} from '../local/state';

interface CommentsSheetProps {
  checkinId: string;
  visible: boolean;
  onClose: () => void;
}

function formatCommentTime(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    return 'now';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }
  if (diffHours < 24) {
    return `${diffHours}h`;
  }
  return `${diffDays}d`;
}

export function CommentsSheet({
  checkinId,
  visible,
  onClose,
}: CommentsSheetProps) {
  const {colors: c, spacing: s, borderRadius: br, typography: t} = useTheme();
  const dispatch = useDispatch();
  const comments = useSelector(selectComments);
  const isLoading = useSelector(selectFeedLoading);
  const isCommenting = useSelector(selectIsCommenting);
  const commentsHasMore = useSelector(selectCommentsHasMore);
  const commentsPage = useSelector(selectCommentsPage);
  const [commentText, setCommentText] = useState('');
  const flatListRef = useRef<FlatList<Comment>>(null);

  // Auto-scroll to bottom when new comment is added
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

  const handleSend = useCallback(() => {
    const trimmed = commentText.trim();
    if (!trimmed || isCommenting) {
      return;
    }
    dispatch(addCommentRequest({checkinId, body: trimmed}));
    setCommentText('');
  }, [commentText, checkinId, dispatch, isCommenting]);

  const handleLoadMore = useCallback(() => {
    if (commentsHasMore && !isLoading) {
      dispatch(fetchCommentsRequest({checkinId, page: commentsPage + 1}));
    }
  }, [commentsHasMore, isLoading, checkinId, commentsPage, dispatch]);

  const renderComment = useCallback(
    ({item}: {item: Comment}) => (
      <View style={[styles.commentRow, {paddingVertical: s.sm}]}>
        <Avatar
          uri={item.profile?.avatar_url}
          name={item.profile?.display_name}
          size="sm"
        />
        <View style={[styles.commentContent, {marginLeft: s.sm}]}>
          <View style={styles.commentHeader}>
            <Text variant="bodySmall" bold>
              {item.profile?.display_name ?? 'Unknown'}
            </Text>
            <Text variant="caption" style={{marginLeft: s.xs}}>
              {formatCommentTime(item.created_at)}
            </Text>
          </View>
          <Text variant="body" style={{marginTop: 2}}>
            {item.body}
          </Text>
        </View>
      </View>
    ),
    [s],
  );

  return (
    <Modal
      animationType="slide"
      transparent={Platform.OS === 'android'}
      presentationStyle={Platform.OS === 'ios' ? 'formSheet' : undefined}
      visible={visible}
      onRequestClose={onClose}>
      {Platform.OS === 'android' ? (
        <Pressable style={styles.backdrop} onPress={onClose} />
      ) : null}
      <View
        style={[
          Platform.OS === 'android' ? styles.androidSheet : styles.iosSheet,
          {
            backgroundColor: c.surfaceElevated,
            borderTopLeftRadius: Platform.OS === 'android' ? br.xl : 0,
            borderTopRightRadius: Platform.OS === 'android' ? br.xl : 0,
          },
        ]}>
        <KeyboardAvoidingView
          style={styles.sheetContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
          <View style={[styles.sheetHeader, {paddingHorizontal: s.base}]}>
            <Text variant="h3">Comments</Text>
          </View>

          {isLoading && comments.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Spinner />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={comments}
              keyExtractor={item => item.id}
              renderItem={renderComment}
              contentContainerStyle={{
                paddingHorizontal: s.base,
                flexGrow: 1,
              }}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.3}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text variant="bodySmall" center>
                    No comments yet. Be the first!
                  </Text>
                </View>
              }
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Comment input */}
          <View
            style={[
              styles.inputContainer,
              {
                borderTopWidth: 1,
                borderTopColor: c.borderLight,
                paddingHorizontal: s.base,
                paddingVertical: s.sm,
                backgroundColor: c.surfaceElevated,
              },
            ]}>
            <TextInput
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
              placeholder="Add a comment..."
              placeholderTextColor={c.textTertiary}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
            />
            <PressableOpacity
              onPress={handleSend}
              disabled={!commentText.trim() || isCommenting}
              style={[
                styles.sendButton,
                {
                  backgroundColor:
                    commentText.trim() && !isCommenting
                      ? c.primary
                      : c.primaryLight,
                  borderRadius: br.full,
                  marginLeft: s.sm,
                },
              ]}>
              {isCommenting ? (
                <Spinner size="small" />
              ) : (
                <Text
                  variant="bodySmall"
                  bold
                  color={commentText.trim() ? c.textInverse : c.textTertiary}>
                  Send
                </Text>
              )}
            </PressableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  iosSheet: {
    flex: 1,
  },
  androidSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '90%',
  },
  sheetContainer: {
    flex: 1,
  },
  sheetHeader: {
    paddingTop: 4,
    paddingBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
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
});
