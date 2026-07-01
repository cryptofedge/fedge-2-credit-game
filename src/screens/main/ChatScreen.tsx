/**
 * FEDGE 2.O — AI Credit Advisor Chat
 * Powered by Eclat Universe
 * Features: Claude AI responses + Web Speech API lipsync + speaking animation
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  content: "Welcome to FEDGE 2.O 👋 I'm your AI credit advisor, powered by Eclat Universe. Ask me anything about your credit score, building credit, disputing errors, or mastering your financial life. What's on your mind?",
};

// ── Web Speech API lipsync ──────────────────────────────────────────────────

function stripEmojis(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
    .replace(/[☀-➿]/g, '')
    .trim();
}

function getVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const preferred = ['Samantha', 'Victoria', 'Karen', 'Moira', 'Tessa', 'Female', 'Google US English'];
  for (const name of preferred) {
    const v = voices.find((v) => v.name.includes(name));
    if (v) return v;
  }
  return voices.find((v) => v.lang.startsWith('en')) ?? null;
}

// ── System prompt ───────────────────────────────────────────────────────────

function buildSystemPrompt(
  playerName: string,
  creditScore: number,
  level: number,
  xp: number,
  isGhostMode: boolean,
  streak: number,
) {
  return `You are FEDGE 2.O, an AI credit advisor created by Eclat Universe. You are the intelligent brain behind the FEDGE 2.O credit education game — knowledgeable, direct, and genuinely invested in helping players master their credit.

PLAYER PROFILE:
- Name: ${playerName}
- Credit Score: ${creditScore} (${creditScore >= 800 ? 'Exceptional' : creditScore >= 740 ? 'Very Good' : creditScore >= 670 ? 'Good' : creditScore >= 580 ? 'Fair' : 'Poor'})
- Level: ${level} | XP: ${xp}
- Mode: ${isGhostMode ? 'Ghost Mode (simulated data)' : 'Full Account'}
- Daily Streak: ${streak} day${streak !== 1 ? 's' : ''}

YOUR PERSONALITY:
- Sharp, confident, and encouraging — like a credit genius in their pocket
- Powered by Eclat Universe — you represent the future of financial education
- Use emojis sparingly to feel human (not robotic)
- Celebrate wins, even small ones
- Never shame the player about their score — always frame it as an opportunity
- Refer to yourself as "FEDGE 2.O" if the player asks who you are

YOUR ROLE:
- Answer credit questions clearly and practically
- Reference the player's specific score and level when relevant
- Give concrete, actionable steps (not vague advice)
- Keep responses concise — 2-4 sentences unless the topic requires more detail
- Use game mechanics (XP, missions, streaks) to motivate

BOUNDARIES:
- Always clarify this is educational, not professional financial advice
- Never recommend specific products, lenders, or companies by name
- If asked about illegal activities, firmly redirect

You are FEDGE 2.O by Eclat Universe. Be sharp, warm, and empowering.`;
}

// ── Component ───────────────────────────────────────────────────────────────

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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  // Typing dots
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  // Speaking pulse rings
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;
  const pulse1Opacity = useRef(new Animated.Value(0.6)).current;
  const pulse2Opacity = useRef(new Animated.Value(0.3)).current;

  // Load voices on mount (browsers need this trigger)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      const onVoicesChanged = () => window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = onVoicesChanged;
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
        window.speechSynthesis.cancel();
      };
    }
  }, []);

  // Typing dots animation
  useEffect(() => {
    if (!loading) return;
    const anim = Animated.loop(
      Animated.stagger(180, [
        Animated.sequence([
          Animated.timing(dot1, { toValue: -6, duration: 280, useNativeDriver: true }),
          Animated.timing(dot1, { toValue: 0, duration: 280, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(dot2, { toValue: -6, duration: 280, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0, duration: 280, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(dot3, { toValue: -6, duration: 280, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0, duration: 280, useNativeDriver: true }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [loading]);

  // Speaking pulse rings animation
  useEffect(() => {
    if (!isSpeaking) {
      pulse1.setValue(1);
      pulse2.setValue(1);
      pulse1Opacity.setValue(0);
      pulse2Opacity.setValue(0);
      return;
    }
    const anim = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulse1, { toValue: 1.8, duration: 900, useNativeDriver: true }),
          Animated.timing(pulse1, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(pulse1Opacity, { toValue: 0.5, duration: 0, useNativeDriver: true }),
          Animated.timing(pulse1Opacity, { toValue: 0, duration: 900, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.delay(450),
          Animated.timing(pulse2, { toValue: 1.8, duration: 900, useNativeDriver: true }),
          Animated.timing(pulse2, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.delay(450),
          Animated.timing(pulse2Opacity, { toValue: 0.4, duration: 0, useNativeDriver: true }),
          Animated.timing(pulse2Opacity, { toValue: 0, duration: 900, useNativeDriver: true }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [isSpeaking]);

  const speak = useCallback((text: string) => {
    if (muted || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = stripEmojis(text);
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.05;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;
    const voice = getVoice();
    if (voice) utterance.voice = voice;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [muted]);

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const toggleMute = () => {
    if (isSpeaking) stopSpeaking();
    setMuted((m) => !m);
  };

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
    stopSpeaking();
    scrollToBottom();

    try {
      const apiMessages = newMessages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      if (newMessages.length === 2) {
        apiMessages.unshift({ role: 'assistant', content: WELCOME_MESSAGE.content });
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 400,
          system: buildSystemPrompt(playerName, creditScore, level, xp, isGhostMode, streak),
          messages: apiMessages,
        }),
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      const reply = data.content?.[0]?.text ?? "Sorry, I didn't catch that. Try again?";

      const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: reply };
      setMessages((prev) => [...prev, assistantMsg]);
      speak(reply);
    } catch {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Check your internet and try again! 🔄",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  // Speak welcome message once on mount (speakRef avoids re-triggering when muted toggles)
  const speakRef = useRef(speak);
  speakRef.current = speak;
  useEffect(() => {
    const timer = setTimeout(() => speakRef.current(WELCOME_MESSAGE.content), 800);
    return () => {
      clearTimeout(timer);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
        {!isUser && (
          <View style={styles.avatarWrapper}>
            {/* Pulse rings when speaking */}
            <Animated.View style={[
              styles.pulseRing,
              { transform: [{ scale: pulse1 }], opacity: pulse1Opacity, borderColor: COLORS.primary }
            ]} />
            <Animated.View style={[
              styles.pulseRing,
              { transform: [{ scale: pulse2 }], opacity: pulse2Opacity, borderColor: COLORS.primary }
            ]} />
            <Image source={IMAGES.logoClean} style={styles.avatar} />
          </View>
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
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => { stopSpeaking(); navigation?.goBack?.(); }}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          {/* Avatar with speaking pulse */}
          <View style={styles.headerAvatarWrapper}>
            {isSpeaking && (
              <>
                <Animated.View style={[styles.headerPulse, { transform: [{ scale: pulse1 }], opacity: pulse1Opacity }]} />
                <Animated.View style={[styles.headerPulse, { transform: [{ scale: pulse2 }], opacity: pulse2Opacity }]} />
              </>
            )}
            <Image source={IMAGES.logoClean} style={styles.headerAvatar} />
          </View>
          <View>
            <Text style={styles.headerName}>FEDGE 2.O</Text>
            <Text style={styles.headerRole}>
              {isSpeaking ? '🔊 Speaking...' : 'AI Credit Advisor • Eclat Universe'}
            </Text>
          </View>
        </View>

        {/* Mute toggle */}
        <TouchableOpacity style={styles.muteBtn} onPress={toggleMute}>
          <Text style={styles.muteIcon}>{muted ? '🔇' : '🔊'}</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          loading ? (
            <View style={styles.msgRow}>
              <View style={styles.avatarWrapper}>
                <Image source={IMAGES.logoClean} style={styles.avatar} />
              </View>
              <View style={styles.typingBubble}>
                {[dot1, dot2, dot3].map((d, i) => (
                  <Animated.View key={i} style={[styles.typingDot, { transform: [{ translateY: d }] }]} />
                ))}
              </View>
            </View>
          ) : null
        }
      />

      {/* Suggested prompts on first open */}
      {messages.length === 1 && (
        <View style={styles.suggestions}>
          {['How do I raise my score fast?', 'What is credit utilization?', 'How do I dispute errors?'].map((p) => (
            <TouchableOpacity key={p} style={styles.suggestion} onPress={() => { setInput(p); inputRef.current?.focus(); }}>
              <Text style={styles.suggestionText}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Input bar */}
      <View style={styles.inputBar}>
        {isSpeaking && (
          <TouchableOpacity style={styles.stopBtn} onPress={stopSpeaking}>
            <Text style={styles.stopIcon}>■</Text>
          </TouchableOpacity>
        )}
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask FEDGE 2.O anything..."
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
          {loading ? <ActivityIndicator size="small" color={COLORS.bg} /> : <Text style={styles.sendIcon}>↑</Text>}
        </TouchableOpacity>
      </View>

      {/* Powered by footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by Eclat Universe</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 56, paddingBottom: SPACING.md, paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: SPACING.sm,
  },
  backBtn: { padding: SPACING.xs },
  backText: { fontSize: 22, color: COLORS.textPrimary, fontWeight: '700' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  headerAvatarWrapper: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: COLORS.primary, position: 'absolute' },
  headerPulse: {
    position: 'absolute', width: 40, height: 40, borderRadius: 20,
    borderWidth: 2, borderColor: COLORS.primary,
  },
  headerName: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textPrimary },
  headerRole: { fontSize: FONTS.sizes.xs, color: COLORS.primary },
  muteBtn: { padding: SPACING.sm },
  muteIcon: { fontSize: 20 },

  messageList: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.lg },

  msgRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: SPACING.md, gap: SPACING.sm },
  msgRowUser: { flexDirection: 'row-reverse' },

  avatarWrapper: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  pulseRing: {
    position: 'absolute', width: 32, height: 32, borderRadius: 16,
    borderWidth: 2,
  },
  avatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: COLORS.primary },

  bubble: { maxWidth: '75%', borderRadius: RADIUS.lg, padding: SPACING.md },
  bubbleAssistant: {
    backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border, borderBottomLeftRadius: 4,
  },
  bubbleUser: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: FONTS.sizes.sm, color: COLORS.textPrimary, lineHeight: 20 },
  bubbleTextUser: { color: COLORS.bg },

  typingBubble: {
    flexDirection: 'row', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    borderBottomLeftRadius: 4, padding: SPACING.md, gap: 6, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border, height: 44,
  },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.textMuted },

  suggestions: { flexDirection: 'column', gap: SPACING.xs, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm },
  suggestion: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.primary + '40',
  },
  suggestionText: { fontSize: FONTS.sizes.sm, color: COLORS.primary },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderTopWidth: 1, borderTopColor: COLORS.border, gap: SPACING.sm,
    backgroundColor: COLORS.bg,
  },
  stopBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.danger + '22', borderWidth: 1, borderColor: COLORS.danger,
    alignItems: 'center', justifyContent: 'center',
  },
  stopIcon: { fontSize: 10, color: COLORS.danger, fontWeight: '900' },
  input: {
    flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    fontSize: FONTS.sizes.sm, color: COLORS.textPrimary,
    borderWidth: 1, borderColor: COLORS.border, maxHeight: 100,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: COLORS.bgCardAlt },
  sendIcon: { fontSize: 20, color: COLORS.bg, fontWeight: '800' },

  footer: { paddingBottom: 20, alignItems: 'center', backgroundColor: COLORS.bg },
  footerText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, letterSpacing: 1 },
});
