import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useWebSocket } from '../context/WebSocketContext';
import { EmptyState } from '../components';
import { colors, typography, radii, layout } from '../theme';

// Messages here live only in this component's memory for as long as the
// screen is mounted. Nothing is written to AsyncStorage or the backend —
// leaving this screen (or closing the app) destroys the conversation.
const SessionChatScreen = ({ route }) => {
  const { partnerId, partnerName, bountyTitle } = route.params;
  const { messages, sendMessage } = useWebSocket();
  const [chatMessages, setChatMessages] = useState([]);
  const [input, setInput] = useState('');
  const processedIndex = useRef(0);
  const listRef = useRef(null);
  const msgCounter = useRef(0);

  useEffect(() => {
    for (let i = processedIndex.current; i < messages.length; i++) {
      const msg = messages[i];
      if (msg.type === 'chat_message' && Number(msg.sender_id) === Number(partnerId)) {
        msgCounter.current += 1;
        setChatMessages((prev) => [
          ...prev,
          { id: `in-${msgCounter.current}`, text: msg.payload?.text ?? '', fromMe: false },
        ]);
      }
    }
    processedIndex.current = messages.length;
  }, [messages, partnerId]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    sendMessage({
      type: 'chat_message',
      target_id: Number(partnerId),
      payload: { text },
    });

    msgCounter.current += 1;
    setChatMessages((prev) => [...prev, { id: `out-${msgCounter.current}`, text, fromMe: true }]);
    setInput('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.outer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{partnerName || 'Chat'}</Text>
          {bountyTitle ? (
            <Text style={styles.headerSubtitle} numberOfLines={1}>{bountyTitle}</Text>
          ) : null}
        </View>

        <View style={styles.noticeBar}>
          <Text style={styles.noticeText}>
            🔒 Not saved anywhere — this chat disappears when you leave this screen
          </Text>
        </View>

        <FlatList
          ref={listRef}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={chatMessages}
          keyExtractor={(item) => item.id}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.fromMe ? styles.bubbleMine : styles.bubbleTheirs]}>
              <Text style={item.fromMe ? styles.bubbleTextMine : styles.bubbleTextTheirs}>{item.text}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <EmptyState title="No messages yet" hint="Say hello to get started" />
            </View>
          }
        />

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.textTertiary}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!input.trim()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h2,
  },
  headerSubtitle: {
    ...typography.caption,
    marginTop: 2,
  },
  noticeBar: {
    backgroundColor: colors.warningBg,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  noticeText: {
    fontSize: 12,
    color: colors.warning,
    textAlign: 'center',
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  bubble: {
    maxWidth: '80%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.lg,
    marginBottom: 10,
  },
  bubbleMine: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: colors.surface,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleTextMine: {
    color: colors.onPrimary,
    fontSize: 15,
  },
  bubbleTextTheirs: {
    color: colors.textPrimary,
    fontSize: 15,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 10,
    outlineStyle: 'none',
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radii.pill,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonText: {
    color: colors.onPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
});

export default SessionChatScreen;
