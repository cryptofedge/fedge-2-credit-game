/**
 * FEDGE 2.O — Leaderboard Screen
 * Global and Weekly rankings. The social proof engine.
 *
 * Addictive hooks:
 * - Podium top-3 with gold/silver/bronze glow — visual aspiration target
 * - Player's own rank always visible (sticky) — drives urgency to improve
 * - Weekly tab resets every Sunday — infinite replay loop
 * - "You're in the top X%" social comparison to motivate
 * - Rank change indicators (+2 ↑, -1 ↓) — makes the board feel alive
 * - Near-rank players visible — seeing rank 23 when you're 25 = must close the gap
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  FlatList,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@constants/theme';
import { useGameStore } from '@store/gameStore';

// ─────────────────────────────────────────────
// Mock leaderboard data
// ─────────────────────────────────────────────
const MOCK_PLAYERS_GLOBAL = [
  { id: 'p1',  name: 'CreditKing_J',   xp: 12450, level: 24, score: 812, streak: 47, change: +3,  avatar: '👑' },
  { id: 'p2',  name: 'ScoreQueen99',   xp: 11820, level: 23, score: 798, streak: 35, change: 0,   avatar: '💎' },
  { id: 'p3',  name: 'MoneyMindset',   xp: 10990, level: 21, score: 784, streak: 29, change: +1,  avatar: '🦅' },
  { id: 'p4',  name: 'FinancialFree',  xp: 9870,  level: 19, score: 771, streak: 21, change: -1,  avatar: '🔥' },
  { id: 'p5',  name: 'DebtDestroyer',  xp: 8950,  level: 17, score: 762, streak: 18, change: +2,  avatar: '⚡' },
  { id: 'p6',  name: 'WealthBuilder',  xp: 8200,  level: 16, score: 751, streak: 14, change: -2,  avatar: '💰' },
  { id: 'p7',  name: 'ScoreMaster_K',  xp: 7650,  level: 15, score: 744, streak: 12, change: +4,  avatar: '🏆' },
  { id: 'p8',  name: 'CreditPhoenix',  xp: 7100,  level: 14, score: 739, streak: 9,  change: 0,   avatar: '🦋' },
  { id: 'p9',  name: '800ClubBound',   xp: 6550,  level: 13, score: 728, streak: 8,  change: -1,  avatar: '🎯' },
  { id: 'p10', name: 'RisingCredit',   xp: 5990,  level: 11, score: 715, streak: 6,  change: +1,  avatar: '🚀' },
  { id: 'p11', name: 'FICOFighter',    xp: 5440,  level: 10, score: 708, streak: 5,  change: 0,   avatar: '⚔️' },
  { id: 'p12', name: 'CreditNinja_X',  xp: 4900,  level: 9,  score: 694, streak: 4,  change: +2,  avatar: '🥷' },
  { id: 'p13', name: 'SmartMoney_T',   xp: 4380,  level: 8,  score: 683, streak: 3,  change: -3,  avatar: '🧠' },
  { id: 'p14', name: 'CreditHustler',  xp: 3850,  level: 7,  score: 672, streak: 3,  change: 0,   avatar: '💪' },
  { id: 'p15', name: 'FutureMillion',  xp: 3330,  level: 6,  score: 661, streak: 2,  change: +1,  avatar: '🌟' },
];

const MOCK_PLAYERS_WEEKLY = [
  { id: 'w1',  name: 'ScoreQueen99',   xp: 1840, level: 23, score: 798, streak: 35, change: +2,  avatar: '💎' },
  { id: 'w2',  name: 'DebtDestroyer',  xp: 1720, level: 17, score: 762, streak: 18, change: +5,  avatar: '⚡' },
  { id: 'w3',  name: 'CreditNinja_X',  xp: 1650, level: 9,  score: 694, streak: 4,  change: +9,  avatar: '🥷' },
  { id: 'w4',  name: 'CreditKing_J',   xp: 1590, level: 24, score: 812, streak: 47, change: -2,  avatar: '👑' },
  { id: 'w5',  name: 'WealthBuilder',  xp: 1480, level: 16, score: 751, streak: 14, change: +1,  avatar: '💰' },
  { id: 'w6',  name: 'MoneyMindset',   xp: 1360, level: 21, score: 784, streak: 29, change: -3,  avatar: '🦅' },
  { id: 'w7',  name: 'FICOFighter',    xp: 1250, level: 10, score: 708, streak: 5,  change: +4,  avatar: '⚔️' },
  { id: 'w8',  name: 'RisingCredit',   xp: 1130, level: 11, score: 715, streak: 6,  change: +2,  avatar: '🚀' },
  { id: 'w9',  name: '800ClubBound',   xp: 1010, level: 13, score: 728, streak: 8,  change: -1,  avatar: '🎯' },
  { id: 'w10', name: 'CreditHustler',  xp:  920, level: 7,  score: 672, streak: 3,  change: +3,  avatar: '💪' },
];

type Tab = 'global' | 'weekly';

// ─────────────────────────────────────────────
// Podium component (top 3)
// ─────────────────────────────────────────────
function Podium({ players }: { players: typeof MOCK_PLAYERS_GLOBAL }) {
  const top3 = players.slice(0, 3);
  const order = [top3[1], top3[0], top3[2]]; // 2nd | 1st | 3rd
  const heights = [80, 110, 60];
  const medals = ['🥈', '🥇', '🥉'];
  const glows = [COLORS.textSecondary, COLORS.secondary, COLORS.warning];
  const podiumFade = useRef(new Animated.Value(0)).current;
  const podiumSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(podiumFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(podiumSlide, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[podiumStyles.wrap, { opacity: podiumFade, transform: [{ translateY: podiumSlide }] }]}>
      {order.map((player, i) => (
        <View key={player.id} style={podiumStyles.slot}>
          {/* Avatar */}
          <View style={[podiumStyles.avatarWrap, { borderColor: glows[i] + '60', shadowColor: glows[i] }]}>
            <Text style={podiumStyles.avatar}>{player.avatar}</Text>
          </View>
          <Text style={[podiumStyles.medal]}>{medals[i]}</Text>
          <Text style={podiumStyles.playerName} numberOfLines={1}>{player.name}</Text>
          <Text style={[podiumStyles.xpVal, { color: glows[i] }]}>{player.xp.toLocaleString()} XP</Text>
          {/* Podium block */}
          <View style={[podiumStyles.block, { height: heights[i], backgroundColor: glows[i] + '20', borderColor: glows[i] + '40' }]}>
            <Text style={[podiumStyles.rankNum, { color: glows[i] }]}>
              #{i === 0 ? 2 : i === 1 ? 1 : 3}
            </Text>
          </View>
        </View>
      ))}
    </Animated.View>
  );
}

const podiumStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  slot: { flex: 1, alignItems: 'center', gap: 4 },
  avatarWrap: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: COLORS.bgCard,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 6,
  },
  avatar: { fontSize: 26 },
  medal: { fontSize: 18 },
  playerName: { fontSize: FONTS.sizes.xs, fontWeight: '800', color: COLORS.textSecondary, width: '100%', textAlign: 'center' },
  xpVal: { fontSize: FONTS.sizes.xs, fontWeight: '900' },
  block: {
    width: '100%', borderRadius: RADIUS.md,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  rankNum: { fontSize: FONTS.sizes.xl, fontWeight: '900' },
});

// ─────────────────────────────────────────────
// Rank Row
// ─────────────────────────────────────────────
function RankRow({
  player,
  rank,
  isMe,
  index,
}: {
  player: typeof MOCK_PLAYERS_GLOBAL[0];
  rank: number;
  isMe: boolean;
  index: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, delay: index * 50, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, delay: index * 50, useNativeDriver: true }),
    ]).start();
  }, []);

  const changeColor = player.change > 0 ? COLORS.success : player.change < 0 ? COLORS.danger : COLORS.textMuted;
  const changeIcon = player.change > 0 ? '↑' : player.change < 0 ? '↓' : '—';

  return (
    <Animated.View style={[
      styles.rankRow,
      isMe && styles.rankRowMe,
      { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
    ]}>
      {/* Rank number */}
      <Text style={[styles.rankNum, isMe && { color: COLORS.primary }]}>
        #{rank}
      </Text>

      {/* Avatar */}
      <View style={[styles.rankAvatar, isMe && { borderColor: COLORS.primary + '60' }]}>
        <Text style={styles.rankAvatarText}>{player.avatar}</Text>
      </View>

      {/* Name + score */}
      <View style={styles.rankInfo}>
        <Text style={[styles.rankName, isMe && { color: COLORS.primary }]} numberOfLines={1}>
          {isMe ? 'You' : player.name}
        </Text>
        <Text style={styles.rankScore}>Score {player.score} · Lv {player.level}</Text>
      </View>

      {/* XP + change */}
      <View style={styles.rankRight}>
        <Text style={[styles.rankXP, isMe && { color: COLORS.primary }]}>
          {player.xp.toLocaleString()}
        </Text>
        <View style={styles.rankChange}>
          <Text style={[styles.rankChangeText, { color: changeColor }]}>
            {changeIcon}{Math.abs(player.change) > 0 ? Math.abs(player.change) : ''}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────
export default function LeaderboardScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<Tab>('global');
  const playerName  = useGameStore((s) => s.playerName);
  const xp          = useGameStore((s) => s.xp);
  const level       = useGameStore((s) => s.level);
  const creditScore = useGameStore((s) => s.creditScore);
  const isGhostMode = useGameStore((s) => s.isGhostMode);
  const streak      = useGameStore((s) => s.streak);

  const players = activeTab === 'global' ? MOCK_PLAYERS_GLOBAL : MOCK_PLAYERS_WEEKLY;

  // Inject real player into list
  const myEntry = {
    id: 'me',
    name: isGhostMode ? 'Ghost Player' : playerName || 'You',
    xp,
    level,
    score: creditScore,
    streak,
    change: 0,
    avatar: '🌟',
  };

  // Find where the real player ranks (by XP)
  const myRank = players.filter((p) => p.xp > xp).length + 1;
  const topPercent = Math.round((myRank / (players.length + 1)) * 100);

  // Build display list: top 3 are in podium, rows start at rank 4
  // Always show player's rank context (ranks around them)
  const listPlayers = [
    ...players.slice(3).map((p, i) => ({ ...p, rank: i + 4 })),
  ];

  // Insert player entry at correct position if not in top 3
  const meInTop3 = myRank <= 3;
  if (!meInTop3) {
    // Insert after surrounding players
    const insertAt = Math.max(0, myRank - 4);
    listPlayers.splice(insertAt, 0, { ...myEntry, rank: myRank });
  }

  const headerFade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── HEADER ─────────────────────────── */}
        <Animated.View style={[styles.header, { opacity: headerFade }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack?.()}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerLabel}>COMPETITION</Text>
            <Text style={styles.headerTitle}>Leaderboard</Text>
          </View>
        </Animated.View>

        {/* ── MY RANK BANNER ──────────────────── */}
        <Animated.View style={[styles.myRankBanner, { opacity: headerFade }]}>
          <View style={styles.myRankLeft}>
            <Text style={styles.myRankLabel}>YOUR RANK</Text>
            <Text style={styles.myRankNum}>#{myRank}</Text>
          </View>
          <View style={styles.myRankCenter}>
            <Text style={styles.myRankXP}>{xp.toLocaleString()} XP</Text>
            <Text style={styles.myRankPercent}>Top {topPercent}% of players</Text>
          </View>
          <View style={styles.myRankRight}>
            <Text style={styles.myRankStreakIcon}>🔥</Text>
            <Text style={styles.myRankStreak}>{streak} day streak</Text>
          </View>
        </Animated.View>

        {/* ── TAB TOGGLE ──────────────────────── */}
        <View style={styles.tabRow}>
          {(['global', 'weekly'] as Tab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
                {tab === 'global' ? '🌍 Global' : '📅 This Week'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Weekly resets notice */}
        {activeTab === 'weekly' && (
          <View style={styles.resetNotice}>
            <Text style={styles.resetNoticeText}>🔄 Weekly board resets every Sunday at midnight</Text>
          </View>
        )}

        {/* ── PODIUM ──────────────────────────── */}
        <Podium players={players} />

        {/* ── RANK LIST (rank 4+) ──────────────── */}
        <View style={styles.rankList}>
          <View style={styles.rankListHeader}>
            <Text style={styles.rankListHeaderRank}>#</Text>
            <Text style={styles.rankListHeaderName}>Player</Text>
            <Text style={styles.rankListHeaderXP}>XP</Text>
          </View>
          {listPlayers.map((player, i) => (
            <RankRow
              key={player.id + i}
              player={player}
              rank={player.rank}
              isMe={player.id === 'me'}
              index={i}
            />
          ))}
        </View>

        {/* ── MOTIVATION FOOTER ───────────────── */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationEmoji}>🎯</Text>
          <Text style={styles.motivationTitle}>
            {myRank <= 5
              ? 'You\'re in the top 5! Keep pushing!'
              : myRank <= 10
              ? `Only ${myRank - 1} spots from the top! You\'ve got this.`
              : `${myRank - 1} players ahead. Complete missions to climb.`}
          </Text>
          <Text style={styles.motivationSub}>
            Complete missions, ace quizzes, and maintain your streak to earn more XP.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingBottom: 48 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
    paddingBottom: SPACING.lg,
    gap: SPACING.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  backBtnText: { fontSize: FONTS.sizes.xl, color: COLORS.textSecondary },
  headerText: { gap: 2 },
  headerLabel: { fontSize: FONTS.sizes.xs, color: COLORS.secondary, letterSpacing: 3, fontWeight: '800' },
  headerTitle: { fontSize: FONTS.sizes.xxxl, fontWeight: '900', color: COLORS.textPrimary },

  // My rank banner
  myRankBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.primary + '12',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.primary + '40',
    ...SHADOWS.primary,
  },
  myRankLeft: { alignItems: 'center', flex: 1 },
  myRankLabel: { fontSize: FONTS.sizes.xs, color: COLORS.primary, fontWeight: '800', letterSpacing: 1 },
  myRankNum: { fontSize: FONTS.sizes.xxxl, fontWeight: '900', color: COLORS.primary },
  myRankCenter: { flex: 2, alignItems: 'center' },
  myRankXP: { fontSize: FONTS.sizes.xl, fontWeight: '900', color: COLORS.textPrimary },
  myRankPercent: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  myRankRight: { flex: 1, alignItems: 'center' },
  myRankStreakIcon: { fontSize: 24 },
  myRankStreak: { fontSize: FONTS.sizes.xs, color: COLORS.warning, fontWeight: '700' },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.pill,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabBtn: {
    flex: 1, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
  },
  tabBtnActive: { backgroundColor: COLORS.primary },
  tabBtnText: { fontSize: FONTS.sizes.sm, fontWeight: '800', color: COLORS.textMuted },
  tabBtnTextActive: { color: COLORS.bg },

  resetNotice: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  resetNoticeText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, fontWeight: '600' },

  // Rank list
  rankList: { paddingHorizontal: SPACING.lg, gap: SPACING.xs },
  rankListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.xs,
  },
  rankListHeaderRank: { width: 40, fontSize: FONTS.sizes.xs, color: COLORS.textMuted, fontWeight: '800' },
  rankListHeaderName: { flex: 1, fontSize: FONTS.sizes.xs, color: COLORS.textMuted, fontWeight: '800' },
  rankListHeaderXP: { width: 70, textAlign: 'right', fontSize: FONTS.sizes.xs, color: COLORS.textMuted, fontWeight: '800' },

  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  rankRowMe: {
    borderColor: COLORS.primary + '60',
    backgroundColor: COLORS.primary + '10',
  },
  rankNum: {
    width: 32,
    fontSize: FONTS.sizes.sm,
    fontWeight: '900',
    color: COLORS.textSecondary,
  },
  rankAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.bgCardAlt,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  rankAvatarText: { fontSize: 20 },
  rankInfo: { flex: 1, gap: 2 },
  rankName: { fontSize: FONTS.sizes.sm, fontWeight: '800', color: COLORS.textPrimary },
  rankScore: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  rankRight: { alignItems: 'flex-end', gap: 2 },
  rankXP: { fontSize: FONTS.sizes.sm, fontWeight: '900', color: COLORS.textSecondary },
  rankChange: {},
  rankChangeText: { fontSize: FONTS.sizes.xs, fontWeight: '800' },

  // Motivation
  motivationCard: {
    margin: SPACING.lg,
    marginTop: SPACING.xl,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.secondary + '30',
    gap: SPACING.sm,
  },
  motivationEmoji: { fontSize: 40 },
  motivationTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 26,
  },
  motivationSub: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
