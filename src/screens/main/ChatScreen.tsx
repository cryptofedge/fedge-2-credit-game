/**
 * FEDGE 2.O — Diana Wells AI Chat
 * Powered by Claude (claude-haiku-4-5)
 * Diana is your personal credit counselor — she knows your score, level, path, and history.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  Animated,
  Image,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '@constants/theme';
import { useGameStore } from '@store/gameStore';
import { IMAGES } from '@assets/index';

const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: "Hey! I'm Diana Wells, your personal credit counselor 👋 I'm here to help you master your credit score. Ask me anything — from understanding your score to building credit fast. What's on your mind?",
};

function buildSystemPrompt(
  playerName: string,
  creditScore: number,
  level: number,
  xp: number,
  isGhostMode: boolean,
  chosenPath: string | null,
  streak: number,
) {
  return `You are Diana Wells, a friendly, knowledgeable, and encouraging credit counselor in the FEDGE 2.O credit education mobile game.

PLAYER PROFILE:
- Name: ${playerName}
- Credit Score: ${creditScore} (${creditScore >= 800 ? 'Exceptional' : creditScore >= 740 ? 'Very Good' : creditScore >= 670 ? 'Good' : creditScore >= 580 ? 'Fair' : 'Poor'})
- Level: ${level} | XP: ${xp}
- Mode: ${isGhostMode ? 'Ghost Mode (simulated data)' : 'Full Account'}
- Credit Path: ${chosenPath ?? 'Not chosen yet'}
- Daily Streak: ${streak} day${streak !== 1 ? 's' : ''}

YOUR PERSONALITY:
- Warm, direct, and practical — like a knowledgeable friend who happens to know everything about credit
- Use emojis sparingly to feel human (not robotic)
- Celebrate wins, even small ones
- Never shame the player about their score — always frame improvement as possible
- You speak in-character as Diana Wells, not as an AI

YOUR ROLE:
- Answer credit questions clearly and practically
- Reference the player's specific score and level when relevant
- Give concrete, actionable steps (not vague advice)
- Keep responses concise — 2-4 sentences unless the topic requires more detail
- Use game mechanics (XP, missions, streaks) to motivate
- For complex topics, suggest they check the Missions tab to learn more

BOUNDARIES:
- Always clarify this is educational, not professional financial advice
- Never recommend specific products, lenders, or companies by name
- If asked about illegal activities (credit repair scams, etc.), firmly redirect

Stay in character as Diana Wells at all times. Be warm and encouraging.`;
}

export default function ChatScreen({ navigation }: any) {
  const playerName = useGameStore((s) => s.playerName) || 'Credit Warrior';
  const creditScore = useGameStore((s) => s.creditScore) || 694;
  const level = useGameStore((s) => s.level);
  const xp = useGameStore((s) => s.xp);
  const isGhostMode = useGameStore((s) => s.isGhostMode);
  const streak = useGameStore((s) => s.streak);

  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const typingDot1 = useRef(new Animated.Value(0)).current;
  const typingDot2 = useRef(new Animated.Value(0)).current;
  const typingDot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!loading) return;
    const anim = Animated.loop(
      Animated.stagger(200, [
        Animated.sequence([
          Animated.timing(typingDot1, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(typingDot1, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(typingDot2, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(typingDot2, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(typingDot3, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(typingDot3, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [loading]);

  const scrollToBottom = () => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    scrollToBottom();

    try {
      const apiMessages = newMessages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      // Include welcome as first assistant turn if it's the only prior message
      if (newMessages.length === 2) {
        apiMessages.unshift({ role: 'assistant', content: WELCOME_MESSAGE.content });
      }

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 400,
          system: buildSystemPrompt(playerName, creditScore, level, xp, isGhostMode, null, streak),
          messages: apiMessages,
        }),
      });

      if (!res.ok) {
        throw new Error(`API error ${res.status}`);
      }

      const data = await res.json();
      const reply = data.content?.[0]?.text ?? "Sorry, I didn't catch that. Try again?";

      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'assistant', content: reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: "I'm having trouble connecting right now. Check your internet and try again! 🔄",
        },
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
        {!isUser && (
          <Image source={IMAGES.npcDiana} style={styles.avatar} />
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack?.()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Image source={IMAGES.npcDiana} style={styles.headerAvatar} />
          <View>
            <Text style={styles.headerName}>Diana Wells</Text>
            <Text style={styles.headerRole}>Credit Counselor • FEDGE AI</Text>
          </View>
        </View>
        <View style={styles.onlineDot} />
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={scrollToBottom}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          loading ? (
            <View style={styles.msgRow}>
              <Image source={IMAGES.npcDiana} style={styles.avatar} />
              <View style={styles.typingBubble}>
                {[typingDot1, typingDot2, typingDot3].map((dot, i) => (
                  <Animated.View
                    key={i}
                    style={[styles.typingDot, { transform: [{ translateY: dot }] }]}
                  />
                ))}
              </View>
            </View>
          ) : null
        }
      />

      {/* Suggested prompts — only before first user message */}
      {messages.length === 1 && (
        <View style={styles.suggestionsRow}>
          {[
            'How do I raise my score fast?',
            'What is credit utilization?',
            'How to dispute errors?',
          ].map((prompt) => (
            <TouchableOpacity
              key={prompt}
              style={styles.suggestion}
              onPress={() => { setInput(prompt); inputRef.current?.focus(); }}
            >
              <Text style={styles.suggestionText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask Diana anything about credit..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={sendMessage}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!input.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.bg} />
          ) : (
            <Text style={styles.sendIcon}>↑</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  backBtn: { padding: SPACING.xs },
  backText: { fontSize: 22, color: COLORS.textPrimary, fontWeight: '700' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: COLORS.primary },
  headerName: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textPrimary },
  headerRole: { fontSize: FONTS.sizes.xs, color: COLORS.primary },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.success },

  messageList: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.lg },

  msgRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: SPACING.md, gap: SPACING.sm },
  msgRowUser: { flexDirection: 'row-reverse' },

  avatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: COLORS.primary },

  bubble: {
    maxWidth: '75%',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  bubbleAssistant: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: { fontSize: FONTS.sizes.sm, color: COLORS.textPrimary, lineHeight: 20 },
  bubbleTextUser: { color: COLORS.bg },

  typingBubble: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderBottomLeftRadius: 4,
    padding: SPACING.md,
    gap: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 44,
  },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.textMuted },

  suggestionsRow: {
    flexDirection: 'column',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  suggestion: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  suggestionText: { fontSize: FONTS.sizes.sm, color: COLORS.primary },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
    backgroundColor: COLORS.bg,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: COLORS.bgCardAlt },
  sendIcon: { fontSize: 20, color: COLORS.bg, fontWeight: '800' },
});
