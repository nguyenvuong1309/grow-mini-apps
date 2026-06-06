import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useTheme, Avatar, Text, PressableOpacity} from '@grow/shared-ui';
import type {Comment} from '../local/state';

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

export interface CommentWithReplies extends Comment {
  replies: Comment[];
}

interface CommentItemProps {
  comment: CommentWithReplies;
  onReply: (comment: Comment) => void;
  depth?: number;
}

const MAX_DEPTH = 2;

export function CommentItem({comment, onReply, depth = 0}: CommentItemProps) {
  const {colors: c, spacing: s} = useTheme();

  return (
    <View
      testID={`comment-item-${comment.id}`}
      style={[styles.container, depth > 0 && {marginLeft: 32}]}>
      <View style={[styles.commentRow, {paddingVertical: s.sm}]}>
        <Avatar
          uri={comment.profile?.avatar_url}
          name={comment.profile?.display_name}
          size="sm"
        />
        <View style={[styles.commentContent, {marginLeft: s.sm}]}>
          <View style={styles.commentHeader}>
            <Text variant="bodySmall" bold>
              {comment.profile?.display_name ?? 'Unknown'}
            </Text>
            <Text variant="caption" style={{marginLeft: s.xs}}>
              {formatRelativeTime(comment.created_at)}
            </Text>
          </View>
          <Text variant="body" style={{marginTop: 2}}>
            {comment.body}
          </Text>
          <PressableOpacity
            testID={`reply-comment-btn-${comment.id}`}
            onPress={() => onReply(comment)}
            style={[styles.replyButton, {marginTop: s.xs}]}>
            <Text variant="caption" color={c.primary}>
              Reply
            </Text>
          </PressableOpacity>
        </View>
      </View>

      {/* Render replies, flatten deeper than MAX_DEPTH */}
      {comment.replies.length > 0 && depth < MAX_DEPTH && (
        <View>
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={{...reply, replies: []}}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
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
  replyButton: {
    alignSelf: 'flex-start',
  },
});
