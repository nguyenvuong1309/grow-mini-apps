import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useTheme } from 'host/theme';
import { useAppDispatch, useAppSelector } from 'host/store/hooks';
import { ScreenContainer } from 'host/shared/layout';
import {
  Text,
  Avatar,
  Spinner,
  SkeletonProvider,
  PressableOpacity,
} from 'host/shared/ui';
import { SquadChatSkeleton } from '../components/SquadChatSkeleton';
import { selectUser } from 'host/state/auth';
import {
  fetchMessagesRequest,
  sendMessageRequest,
  resetMessages,
  subscribeChatRealtime,
  unsubscribeChatRealtime,
  selectMessages,
  selectSquadLoading,
  selectSquadLoadingMore,
  selectHasMoreMessages,
  selectMessagesPage,
} from 'host/state/squad';
import type { SquadMessage } from 'host/types/models';

type SquadChatRouteParams = { squadId: string };
type RouteParams = RouteProp<
  { 'Squad.Chat': SquadChatRouteParams },
  'Squad.Chat'
>;

export function SquadChatScreen() {
  const { colors: c, borderRadius: br, typography: t } = useTheme();
  const dispatch = useAppDispatch();
  const route = useRoute<RouteParams>();
  const { squadId } = route.params;

  const messages = useAppSelector(selectMessages);
  const isLoading = useAppSelector(selectSquadLoading);
  const isLoadingMore = useAppSelector(selectSquadLoadingMore);
  const hasMore = useAppSelector(selectHasMoreMessages);
  const messagesPage = useAppSelector(selectMessagesPage);
  const currentUser = useAppSelector(selectUser);

  const [inputText, setInputText] = useState('');

  useEffect(() => {
    dispatch(resetMessages());
    dispatch(fetchMessagesRequest({ squadId, page: 0 }));
    dispatch(subscribeChatRealtime(squadId));

    return () => {
      dispatch(unsubscribeChatRealtime());
      dispatch(resetMessages());
    };
  }, [dispatch, squadId]);

  const handleSend = useCallback(() => {
    const body = inputText.trim();
    if (!body || !currentUser) {
      return;
    }

    const optimisticMessage: SquadMessage = {
      id: `optimistic-${Date.now()}`,
      squad_id: squadId,
      user_id: currentUser.id,
      body,
      image_url: null,
      reply_to_id: null,
      created_at: new Date().toISOString(),
      profile: currentUser,
    };

    dispatch(
      sendMessageRequest({
        squadId,
        body,
        optimisticMessage,
      }),
    );
    setInputText('');
  }, [dispatch, squadId, inputText, currentUser]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      dispatch(fetchMessagesRequest({ squadId, page: messagesPage + 1 }));
    }
  }, [dispatch, squadId, isLoadingMore, hasMore, messagesPage]);

  const formatTime = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const renderMessage = useCallback(
    ({ item }: { item: SquadMessage }) => {
      const isMe = item.user_id === currentUser?.id;
      const isOptimistic = item.id.startsWith('optimistic-');

      return (
        <View
          style={[
            styles.messageBubbleContainer,
            isMe ? styles.myMessageContainer : styles.otherMessageContainer,
          ]}
        >
          {!isMe && (
            <Avatar
              name={item.profile?.display_name}
              uri={item.profile?.avatar_url}
              size="sm"
            />
          )}
          <View
            style={[
              styles.bubbleContent,
              isMe ? styles.myBubbleContent : undefined,
            ]}
          >
            {!isMe && (
              <Text
                variant="caption"
                bold
                color={c.primary}
                style={styles.senderName}
              >
                {item.profile?.display_name ?? 'Member'}
              </Text>
            )}
            <View
              style={[
                styles.bubble,
                {
                  backgroundColor: isMe ? c.primary : c.surface,
                  borderRadius: br.lg,
                  opacity: isOptimistic ? 0.6 : 1,
                },
              ]}
            >
              <Text variant="body" color={isMe ? '#fff' : c.text}>
                {item.body}
              </Text>
            </View>
            <Text
              variant="caption"
              color={c.textSecondary}
              style={[styles.timestamp, isMe ? styles.myTimestamp : undefined]}
            >
              {formatTime(item.created_at)}
            </Text>
          </View>
        </View>
      );
    },
    [currentUser, c, br, formatTime],
  );

  const keyExtractor = useCallback((item: SquadMessage) => item.id, []);

  if (isLoading && messages.length === 0) {
    return (
      <ScreenContainer testID="squad-chat-screen">
        <SkeletonProvider>
          <SquadChatSkeleton />
        </SkeletonProvider>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer testID="squad-chat-screen">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          testID="chat-messages-list"
          data={messages}
          keyExtractor={keyExtractor}
          renderItem={renderMessage}
          inverted
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.loadingMore}>
                <Spinner />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text variant="body" color={c.textSecondary} center>
                No messages yet. Start the conversation!
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            messages.length === 0 ? styles.emptyListContent : styles.listContent
          }
        />

        {/* Input Bar */}
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: c.background,
              borderTopColor: c.border,
            },
          ]}
        >
          <TextInput
            testID="chat-input"
            style={[
              styles.textInput,
              {
                backgroundColor: c.surface,
                borderRadius: br.lg,
                color: c.text,
                fontSize: t.sizes.base,
              },
            ]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={c.textSecondary}
            multiline
            maxLength={2000}
          />
          <PressableOpacity
            testID="chat-send-btn"
            style={[
              styles.sendBtn,
              {
                backgroundColor: inputText.trim() ? c.primary : c.surface,
                borderRadius: br.full,
              },
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Text
              variant="body"
              bold
              color={inputText.trim() ? '#fff' : c.textSecondary}
            >
              {'↑'}
            </Text>
          </PressableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  messageBubbleContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 4,
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  bubbleContent: {
    maxWidth: '75%',
    marginLeft: 8,
  },
  myBubbleContent: {
    alignItems: 'flex-end',
    marginLeft: 'auto',
    marginRight: 0,
  },
  senderName: {
    marginBottom: 2,
  },
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  timestamp: {
    marginTop: 2,
  },
  myTimestamp: {
    textAlign: 'right',
  },
  loadingMore: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyChat: {
    padding: 24,
    alignItems: 'center',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 100,
    minHeight: 40,
  },
  sendBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
