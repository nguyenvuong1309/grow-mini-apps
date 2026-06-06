import React, {useEffect, useState} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Text,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRoute, type RouteProp} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../local/theme';
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
  selectUser,
  type SquadMessage,
} from '../local/state';
import {SquadChatSkeleton} from '../components/SquadChatSkeleton';

type SquadChatRouteParams = {squadId: string};
type RouteParams = RouteProp<
  {'Squad.Chat': SquadChatRouteParams},
  'Squad.Chat'
>;

function Avatar({
  name,
  uri,
  size = 32,
  bgColor,
}: {
  name?: string | null;
  uri?: string | null;
  size?: number;
  bgColor: string;
}) {
  if (uri) {
    return (
      <FastImage
        source={{uri}}
        style={{width: size, height: size, borderRadius: size / 2}}
      />
    );
  }
  const initials = (name ?? '?')
    .split(' ')
    .map(s => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bgColor,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={{color: '#fff', fontSize: 12, fontWeight: '600'}}>
        {initials}
      </Text>
    </View>
  );
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

const keyExtractor = (item: SquadMessage) => item.id;

export function SquadChatScreen() {
  const {colors: c, borderRadius: br, typography: t} = useTheme();
  const dispatch = useDispatch();
  const route = useRoute<RouteParams>();
  const {squadId} = route.params;

  const messages = useSelector(selectMessages);
  const isLoading = useSelector(selectSquadLoading);
  const isLoadingMore = useSelector(selectSquadLoadingMore);
  const hasMore = useSelector(selectHasMoreMessages);
  const messagesPage = useSelector(selectMessagesPage);
  const currentUser = useSelector(selectUser);

  const [inputText, setInputText] = useState('');

  useEffect(() => {
    dispatch(resetMessages());
    dispatch(fetchMessagesRequest({squadId, page: 0}));
    dispatch(subscribeChatRealtime(squadId));

    return () => {
      dispatch(unsubscribeChatRealtime());
      dispatch(resetMessages());
    };
  }, [dispatch, squadId]);

  const handleSend = () => {
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

    dispatch(sendMessageRequest({squadId, body, optimisticMessage}));
    setInputText('');
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      dispatch(fetchMessagesRequest({squadId, page: messagesPage + 1}));
    }
  };

  const renderMessage = ({item}: {item: SquadMessage}) => {
    const isMe = item.user_id === currentUser?.id;
    const isOptimistic = item.id.startsWith('optimistic-');

    return (
      <View
        style={[
          styles.messageBubbleContainer,
          isMe ? styles.myMessageContainer : styles.otherMessageContainer,
        ]}>
        {!isMe && (
          <Avatar
            name={item.profile?.display_name}
            uri={item.profile?.avatar_url}
            bgColor={c.primary}
          />
        )}
        <View
          style={[
            styles.bubbleContent,
            isMe ? styles.myBubbleContent : undefined,
          ]}>
          {!isMe && (
            <Text
              style={[
                styles.senderName,
                {color: c.primary, fontWeight: '600'},
              ]}>
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
            ]}>
            <Text
              style={{
                color: isMe ? '#fff' : c.text,
                fontSize: t.sizes.base,
              }}>
              {item.body}
            </Text>
          </View>
          <Text
            style={[
              styles.timestamp,
              {
                color: c.textSecondary,
                fontSize: t.sizes.caption,
              },
              isMe ? styles.myTimestamp : undefined,
            ]}>
            {formatTime(item.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading && messages.length === 0) {
    return (
      <SafeAreaView
        testID="squad-chat-screen"
        style={{flex: 1, backgroundColor: c.background}}>
        <SquadChatSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      testID="squad-chat-screen"
      style={{flex: 1, backgroundColor: c.background}}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
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
                <ActivityIndicator />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text
                style={{
                  color: c.textSecondary,
                  fontSize: t.sizes.base,
                  textAlign: 'center',
                }}>
                No messages yet. Start the conversation!
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            messages.length === 0 ? styles.emptyListContent : styles.listContent
          }
        />

        <View
          style={[
            styles.inputBar,
            {backgroundColor: c.background, borderTopColor: c.border},
          ]}>
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
          <Pressable
            testID="chat-send-btn"
            disabled={!inputText.trim()}
            onPress={handleSend}
            style={[
              styles.sendBtn,
              {
                backgroundColor: inputText.trim() ? c.primary : c.surface,
                borderRadius: br.full,
              },
            ]}>
            <Text
              style={{
                color: inputText.trim() ? '#fff' : c.textSecondary,
                fontSize: t.sizes.base,
                fontWeight: '700',
              }}>
              ↑
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  listContent: {paddingHorizontal: 8, paddingVertical: 8},
  emptyListContent: {flex: 1, justifyContent: 'center'},
  messageBubbleContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 4,
  },
  myMessageContainer: {justifyContent: 'flex-end'},
  otherMessageContainer: {justifyContent: 'flex-start'},
  bubbleContent: {maxWidth: '75%', marginLeft: 8},
  myBubbleContent: {alignItems: 'flex-end', marginLeft: 'auto', marginRight: 0},
  senderName: {marginBottom: 2, fontSize: 12},
  bubble: {paddingHorizontal: 12, paddingVertical: 8},
  timestamp: {marginTop: 2},
  myTimestamp: {textAlign: 'right'},
  loadingMore: {paddingVertical: 16, alignItems: 'center'},
  emptyChat: {padding: 24, alignItems: 'center'},
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
