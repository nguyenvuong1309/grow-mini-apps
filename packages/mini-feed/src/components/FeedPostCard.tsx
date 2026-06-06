import React from 'react';
import {View, StyleSheet, Share} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import {useNavigation} from '@react-navigation/native';
import {
  useTheme,
  Card,
  Avatar,
  Badge,
  Text,
  PressableOpacity,
  GoalProgressIndicator,
} from '@grow/shared-ui';
import {useDispatch} from 'react-redux';
import {ReactionBar} from './ReactionBar';
import {ImageGallery} from './ImageGallery';
import {toggleReactionRequest} from '../local/state';
import type {FeedPost, ReactionEmoji} from '../local/state';

interface FeedPostCardProps {
  post: FeedPost;
  onPress: (post: FeedPost) => void;
  onCommentPress?: (post: FeedPost) => void;
}

// Loose nav typing: avatar press navigates into the host's SocialStack, which
// is not part of this mini-app's local navigator. The route name string is
// resolved against the host navigator at runtime.
type LooseNav = {navigate: (name: string, params?: unknown) => void};

function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffSeconds < 60) {
    return 'just now';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  if (diffWeeks < 4) {
    return `${diffWeeks}w ago`;
  }
  return new Date(dateString).toLocaleDateString();
}

export function FeedPostCard({
  post,
  onPress,
  onCommentPress,
}: FeedPostCardProps) {
  const {colors: c, spacing: s} = useTheme();
  const dispatch = useDispatch();
  const {navigate} = useNavigation<LooseNav>();

  const allImages = [
    ...(post.image_url ? [post.image_url] : []),
    ...(post.additional_images && Array.isArray(post.additional_images)
      ? post.additional_images
      : []),
  ];

  const handleReactionToggle = (emoji: ReactionEmoji) => {
    dispatch(toggleReactionRequest({checkinId: post.id, emoji}));
  };

  const handlePress = () => {
    onPress(post);
  };

  const handleCommentPress = () => {
    if (onCommentPress) {
      onCommentPress(post);
      return;
    }
    onPress(post);
  };

  const handleAvatarPress = () => {
    navigate('SocialStack', {
      screen: 'Social.PublicProfile',
      params: {userId: post.user_id},
    });
  };

  const handleShare = () => {
    const deepLink = `grow://post/${post.id}`;
    const message = post.text_content
      ? `Check-in by ${post.profile.display_name} for "${post.challenge_name}" on Grow!\n\n"${post.text_content}"\n\n${deepLink}`
      : `${post.profile.display_name} just checked in for "${post.challenge_name}" on Grow!\n\n${deepLink}`;
    Share.share({message});
  };

  return (
    <PressableOpacity
      testID="feed-post-card"
      onPress={handlePress}
      activeOpacity={0.9}
      style={{marginBottom: s.sm}}>
      <Card>
        {/* Header */}
        <View style={[styles.header, {marginBottom: s.sm}]}>
          <PressableOpacity
            testID="post-avatar-btn"
            onPress={handleAvatarPress}
            activeOpacity={0.7}>
            <Avatar
              uri={post.profile.avatar_url}
              name={post.profile.display_name}
              size="md"
              enableFullscreen
            />
          </PressableOpacity>
          <View style={[styles.headerInfo, {marginLeft: s.sm}]}>
            <View style={styles.nameRow}>
              <Text
                testID="post-author-name"
                variant="body"
                bold
                numberOfLines={1}
                style={styles.nameText}>
                {post.profile.display_name}
              </Text>
              <Text variant="caption" style={{marginLeft: s.xs}}>
                {formatRelativeTime(post.created_at)}
              </Text>
            </View>
            <Badge label={post.challenge_name} variant="secondary" />
          </View>
        </View>

        {/* Body - Proof content */}
        <View style={{marginBottom: s.sm}}>
          {allImages.length > 1 ? (
            <ImageGallery testID="post-image-gallery" images={allImages} />
          ) : post.image_url ? (
            <FastImage
              testID="post-image"
              source={{uri: post.image_url}}
              style={[
                styles.proofImage,
                {borderRadius: 12, backgroundColor: c.skeleton},
              ]}
              resizeMode={FastImage.resizeMode.cover}
            />
          ) : null}

          {post.text_content ? (
            <Text
              testID="post-content"
              variant="body"
              style={{marginTop: post.image_url ? s.sm : 0}}>
              {post.text_content}
            </Text>
          ) : null}

          {post.metric_value != null && (
            <View
              style={[
                styles.metricContainer,
                {
                  backgroundColor:
                    post.challenge_goal_value != null &&
                    post.challenge_goal_value > 0 &&
                    post.metric_value >= post.challenge_goal_value
                      ? c.successLight
                      : c.primaryLight,
                  borderRadius: 12,
                  padding: s.base,
                  marginTop: s.xs,
                },
              ]}>
              {post.challenge_goal_value != null &&
              post.challenge_goal_value > 0 ? (
                <GoalProgressIndicator
                  value={post.metric_value}
                  goal={post.challenge_goal_value}
                  unit={post.challenge_goal_unit ?? ''}
                  compact
                />
              ) : (
                <>
                  <Text variant="h2" color={c.primary} center>
                    {post.metric_value}
                  </Text>
                  <Text variant="caption" center>
                    metric value
                  </Text>
                </>
              )}
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
                    padding: s.base,
                  },
                ]}>
                <Text
                  variant="h2"
                  color={c.success}
                  center
                  style={styles.tickMark}>
                  {'✓'}
                </Text>
                <Text variant="bodySmall" center>
                  Checked in!
                </Text>
              </View>
            )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <ReactionBar
            testID="post-reactions-bar"
            reactions={post.reactions_count}
            userReaction={post.user_reaction}
            onToggle={handleReactionToggle}
          />
          <View style={styles.footerRight}>
            <PressableOpacity
              testID="post-comment-btn"
              onPress={handleCommentPress}
              style={[styles.commentButton, {gap: s.xs}]}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Text variant="caption">{'💬'}</Text>
              <Text variant="caption" color={c.textSecondary}>
                {post.comments_count > 0 ? post.comments_count : ''}
              </Text>
            </PressableOpacity>
            <PressableOpacity
              testID="share-post-btn"
              onPress={handleShare}
              style={[styles.shareButton, {marginLeft: s.sm}]}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Text variant="caption" color={c.textSecondary}>
                {'↗'}
              </Text>
            </PressableOpacity>
          </View>
        </View>
      </Card>
    </PressableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  nameText: {
    flexShrink: 1,
  },
  proofImage: {
    width: '100%',
    height: 200,
  },
  metricContainer: {
    alignItems: 'center',
  },
  tickContainer: {
    alignItems: 'center',
  },
  tickMark: {
    fontSize: 32,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
