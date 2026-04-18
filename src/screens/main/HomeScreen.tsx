/**
 * FEDGE 2.O — Main Home Screen
 * The command center. Everything the player needs at a glance.
 *
 * Sections:
 * 1. Header      — greeting, FEDGE Coins, notification bell
 * 2. Score Ring  — live animated credit score with tier color
 * 3. XP Bar      — level progress, always "almost full" (Candy Crush hook)
 * 4. Streak Card — fire streak with urgency if not checked in today
 * 5. Daily Missions — 3 missions, progress bar, double-XP timer
 * 6. Bureau Snapshot — 3 bureau scores side by side
 * 7. Quick Actions — Simulate, Dispute, Learn, Leaderboard
 * 8. Achievement peek — latest unlocked badge
 *
 * Addictive hooks baked in:
 * - Score ring pulses every 4s (alive feeling)
 * - XP bar always shows ~85% full going into next level
 * - Streak shows "Day X — Don't break it!" loss aversion
 * - Mission progress bar always has 1 mission pre-started
 * - Double XP countdown creates urgency
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
  Dimensions,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@constants/theme';
import { useGameStore } from '@store/gameStore';
import { getScoreTier } from '@utils/creditScore';
import { BUREAUS } from '@constants/gameConfig';

const { width } = Dimensions.get('window');
const FEDGE_LOGO = require('@assets/images/logo.png');

const DAILY_MISSIONS = [
  {
    id: 'dm1',
    title: 'Check Your Utilization',
    desc: 'Review your card balances vs. limits',
    xp: 50,
    icon: '💳',
    color: COLORS.primary,
    progress: 0,
    completed: false,
  },
  {
    id: 'dm2',
    title: 'Credit Myth or Fact?',
    desc: 'Quick 3-question quiz',
    xp: 75,
    icon: '🧠',
    color: COLORS.accent,
    progress: 0,
    completed: false,
  },
  {
    id: 'dm3',
    title: 'Score Simulator',
    desc: 'Run 1 credit what-if scenario',
    xp: 40,
    icon: '📊',
    color: COLORS.success,
    progress: 0,
    completed: false,
  },
];

const QUICK_ACTIONS = [
  { id: 'simulate', label: 'Simulate', icon: '🔮', color: COLORS.primary, screen: 'Simulator' },
  { id: 'dispute', label: 'Dispute', icon: '⚔️', color: COLORS.danger, screen: 'Dispute' },
  { id: 'learn', label: 'Learn', icon: '📚', color: COLORS.accent, screen: 'Missions' },
  { id: 'rank', label: 'Leaderboard', icon: '🏆', color: COLORS.secondary, screen: 'Leaderboard' },
];

const MOCK_BUREAU_SCORES: Record<string, number> = {
  equifax: 687,
  experian: 694,
  transunion: 701,
};

export default function HomeScreen({ navigation }: any) {
  const playerName = useGameStore((s) => s.playerName) || 'Credit Warrior';
  const xp = useGameStore((s) => s.xp);
  const level = useGameStore((s) => s.level);
  const fedgeCoins = useGameStore((s) => s.fedgeCoins);
  const streak = useGameStore((s) => s.streak);
  const creditScore = useGameStore((s) => s.creditScore);

  const tier = getScoreTier(creditScore || 694);
  const tierColor = tier?.color ?? COLORS.primary;

  const [refreshing, setRefreshing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(22 * 3600 + 14 * 60 + 33);

  // Animations
  const scoreRingPulse = useRef(new Animated.Value(1)).current;
  const scoreOpacity = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const xpBarWidth = useRef(new Animated.Value(0)).current;
  const streakShake = useRef(new Animated.Value(0)).current;
  const missionsOpacity = useRef(new Animated.Value(0)).current;
  const actionsOpacity = useRef(new Animated.Value(0)).current;

  // XP within current level
  const xpForLevel = 500 * Math.pow(1.15, level - 1);
  const xpProgress = Math.min((xp % xpForLevel) / xpForLevel, 1);

  // Double XP timer
  useEffect(() => {
    const t = setInterval(() => setTimeLeft((s) => Math.max(s - 1, 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  useEffect(() => {
    // Staggered entrance animations
    Animated.stagger(120, [
      Animated.timing(headerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(scoreOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(missionsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(actionsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    // XP bar fill
    Animated.spring(xpBarWidth, {
      toValue: xpProgress,
      tension: 40, friction: 10,
      useNativeDriver: false,
    }).start();

    // Score ring heartbeat — keeps screen feeling alive
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.delay(4000),
        Animated.timing(scoreRingPulse, { toValue: 1.04, duration: 300, useNativeDriver: true }),
        Animated.timing(scoreRingPulse, { toValue: 1, duration: 300, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Streak shake if not checked in
  useEffect(() => {
    if (streak > 0) {
      Animated.sequence([
        Animated.delay(2000),
        Animated.timing(streakShake, { toValue: 6, duration: 80, useNativeDriver: true }),
        Animated.timing(streakShake, { toValue: -6, duration: 80, useNativeDriver: true }),
        Animated.timing(streakShake, { toValue: 3, duration: 80, useNativeDriver: true }),
        Animated.timing(streakShake, { toValue: 0, duration: 80, useNativeDriver: true }),
      ]).start();
    }
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  const xpBarDisplayWidth = xpBarWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const fedgeScore = Math.round(
    Object.values(MOCK_BUREAU_SCORES).reduce((a, b) => a + b, 0) /
    Object.values(MOCK_BUREAU_SCORES).length
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* ── HEADER ─────────────────────────────────── */}
        <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
          <View style={styles.headerLeft}>
            <Image source={FEDGE_LOGO} style={styles.headerLogo} resizeMode="contain" />
            <View>
              <Text style={styles.greeting}>Good morning,</Text>
              <Text style={styles.playerName}>{playerName} 👋</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            {/* FEDGE Coins */}
            <View style={styles.coinsBadge}>
              <Text style={styles.coinsIcon}>🪙</Text>
              <Text style={styles.coinsValue}>{fedgeCoins.toLocaleString()}</Text>
            </View>
            {/* Notifications */}
            <TouchableOpacity style={styles.bellBtn}>
              <Text style={styles.bell}>🔔</Text>
              <View style={styles.bellDot} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── SCORE RING ─────────────────────────────── */}
        <Animated.View style={[styles.scoreCard, { opacity: scoreOpacity }]}>
          {/* Double XP banner */}
          {timeLeft > 0 && (
            <View style={styles.doubleXpBanner}>
              <Text style={styles.doubleXpText}>⚡ 2X XP ACTIVE</Text>
              <Text style={styles.doubleXpTimer}>{formatTime(timeLeft)}</Text>
            </View>
          )}

          <View style={styles.scoreCardInner}>
            {/* Ring */}
            <Animated.View
              style={[
                styles.scoreRing,
                {
                  borderColor: tierColor,
                  shadowColor: tierColor,
                  transform: [{ scale: scoreRingPulse }],
                },
              ]}
            >
              <View style={[styles.scoreRingInner, { borderColor: tierColor + '40' }]}>
                <Text style={[styles.scoreNumber, { color: tierColor }]}>
                  {fedgeScore}
                </Text>
                <Text style={styles.scoreLabel}>FEDGE SCORE</Text>
                <View style={[styles.tierPill, { backgroundColor: tierColor + '22' }]}>
                  <Text style={[styles.tierText, { color: tierColor }]}>
                    {tier?.label?.toUpperCase()}
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Right side stats */}
            <View style={styles.scoreStats}>
              <View style={styles.scoreStat}>
                <Text style={styles.scoreStatValue}>+12</Text>
                <Text style={styles.scoreStatLabel}>This Month</Text>
              </View>
              <View style={styles.scoreStatDivider} />
              <View style={styles.scoreStat}>
                <Text style={styles.scoreStatValue}>Top 34%</Text>
                <Text style={styles.scoreStatLabel}>Nationally</Text>
              </View>
              <View style={styles.scoreStatDivider} />
              <View style={styles.scoreStat}>
                <Text style={[styles.scoreStatValue, { color: COLORS.success }]}>+56</Text>
                <Text style={styles.scoreStatLabel}>Potential</Text>
              </View>
            </View>
          </View>

          {/* XP Level Bar */}
          <View style={styles.xpSection}>
            <View style={styles.xpHeader}>
              <Text style={styles.xpLevel}>Level {level}</Text>
              <Text style={styles.xpValue}>{xp.toLocaleString()} XP</Text>
              <Text style={styles.xpNext}>Next: Lv {level + 1}</Text>
            </View>
            <View style={styles.xpBar}>
              <Animated.View
                style={[styles.xpFill, { width: xpBarDisplayWidth }]}
              />
            </View>
          </View>
        </Animated.View>

        {/* ── STREAK ─────────────────────────────────── */}
        <Animated.View
          style={[
            styles.streakCard,
            { transform: [{ translateX: streakShake }] },
          ]}
        >
          <View style={styles.streakLeft}>
            <Text style={styles.streakFire}>🔥</Text>
            <View>
              <Text style={styles.streakCount}>{streak || 1}-Day Streak</Text>
              <Text style={styles.streakSub}>Don't break it — you'll lose your XP multiplier!</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.streakBtn}>
            <Text style={styles.streakBtnText}>Check In</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── DAILY MISSIONS ─────────────────────────── */}
        <Animated.View style={[styles.section, { opacity: missionsOpacity }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Missions</Text>
            <Text style={styles.sectionLink}>See All →</Text>
          </View>

          {/* Mission progress summary */}
          <View style={styles.missionSummary}>
            <Text style={styles.missionSummaryText}>
              <Text style={{ color: COLORS.primary, fontWeight: '800' }}>0/3</Text>
              {' completed today'}
            </Text>
            <View style={styles.missionSummaryBar}>
              <View style={[styles.missionSummaryFill, { width: '5%' }]} />
            </View>
          </View>

          {DAILY_MISSIONS.map((mission) => (
            <TouchableOpacity key={mission.id} style={styles.missionCard} activeOpacity={0.85}>
              <View style={[styles.missionIconBox, { backgroundColor: mission.color + '22' }]}>
                <Text style={styles.missionIcon}>{mission.icon}</Text>
              </View>
              <View style={styles.missionInfo}>
                <Text style={styles.missionTitle}>{mission.title}</Text>
                <Text style={styles.missionDesc}>{mission.desc}</Text>
              </View>
              <View style={styles.missionRight}>
                <Text style={[styles.missionXP, { color: mission.color }]}>+{mission.xp}</Text>
                <Text style={styles.missionXPLabel}>XP</Text>
                <View style={[styles.missionArrow, { backgroundColor: mission.color }]}>
                  <Text style={styles.missionArrowText}>→</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* ── BUREAU SNAPSHOT ────────────────────────── */}
        <Animated.View style={[styles.section, { opacity: missionsOpacity }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bureau Scores</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>Details →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bureauRow}>
            {BUREAUS.map((bureau) => {
              const score = MOCK_BUREAU_SCORES[bureau.id];
              const bTier = getScoreTier(score);
              return (
                <View key={bureau.id} style={[styles.bureauCard, { borderColor: bureau.color + '50' }]}>
                  <Text style={[styles.bureauName, { color: bureau.color }]}>{bureau.name}</Text>
                  <Text style={[styles.bureauScore, { color: bTier?.color }]}>{score}</Text>
                  <Text style={[styles.bureauTier, { color: bTier?.color }]}>{bTier?.label}</Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* ── QUICK ACTIONS ──────────────────────────── */}
        <Animated.View style={[styles.section, { opacity: actionsOpacity }]}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.actionCard, { borderColor: action.color + '40' }]}
                activeOpacity={0.8}
                onPress={() => {
                  if (action.screen === 'Simulator') navigation?.navigate('Simulator');
                  else if (action.screen === 'Missions') navigation?.navigate('Missions');
                  else if (action.screen === 'Leaderboard') navigation?.navigate('Leaderboard');
                }}
              >
                <View style={[styles.actionIconBox, { backgroundColor: action.color + '18' }]}>
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                </View>
                <Text style={[styles.actionLabel, { color: action.color }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* ── ACHIEVEMENT PEEK ───────────────────────── */}
        <Animated.View style={[styles.achievementCard, { opacity: actionsOpacity }]}>
          <Text style={styles.achievementIcon}>🏅</Text>
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementTitle}>Latest Achievement</Text>
            <Text style={styles.achievementName}>Credit Initiate</Text>
            <Text style={styles.achievementDesc}>Completed onboarding</Text>
          </View>
          <Text style={styles.achievementXP}>+250 XP</Text>
        </Animated.View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingBottom: 100 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingTop: 56, paddingBottom: SPACING.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  headerLogo: { width: 38, height: 38 },
  greeting: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted },
  playerName: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.textPrimary },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  coinsBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderWidth: 1, borderColor: COLORS.secondary + '40',
  },
  coinsIcon: { fontSize: 14 },
  coinsValue: { fontSize: FONTS.sizes.sm, fontWeight: '800', color: COLORS.secondary },
  bellBtn: { position: 'relative', padding: SPACING.xs },
  bell: { fontSize: 22 },
  bellDot: {
    position: 'absolute', top: 6, right: 6,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.danger,
    borderWidth: 1.5, borderColor: COLORS.bg,
  },

  // Score Card
  scoreCard: {
    marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  doubleXpBanner: {
    backgroundColor: COLORS.danger + '18',
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xs,
    borderBottomWidth: 1, borderBottomColor: COLORS.danger + '30',
  },
  doubleXpText: { fontSize: FONTS.sizes.xs, fontWeight: '800', color: COLORS.danger, letterSpacing: 1 },
  doubleXpTimer: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.danger },
  scoreCardInner: {
    flexDirection: 'row', alignItems: 'center',
    padding: SPACING.lg, gap: SPACING.lg,
  },
  scoreRing: {
    width: 140, height: 140, borderRadius: 70, borderWidth: 4,
    alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 16, elevation: 10,
  },
  scoreRingInner: {
    width: 118, height: 118, borderRadius: 59, borderWidth: 2,
    backgroundColor: COLORS.bgCardAlt,
    alignItems: 'center', justifyContent: 'center', gap: 2,
  },
  scoreNumber: { fontSize: FONTS.sizes.xxxl, fontWeight: '900', lineHeight: 36 },
  scoreLabel: { fontSize: 9, color: COLORS.textMuted, letterSpacing: 1.5 },
  tierPill: {
    borderRadius: RADIUS.pill, paddingHorizontal: 6, paddingVertical: 2, marginTop: 2,
  },
  tierText: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  scoreStats: { flex: 1, gap: SPACING.sm },
  scoreStat: { alignItems: 'center' },
  scoreStatValue: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.textPrimary },
  scoreStatLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  scoreStatDivider: { height: 1, backgroundColor: COLORS.border, width: '100%' },

  // XP Bar
  xpSection: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md, paddingTop: 0 },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  xpLevel: { fontSize: FONTS.sizes.sm, fontWeight: '800', color: COLORS.primary },
  xpValue: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  xpNext: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted },
  xpBar: {
    height: 8, backgroundColor: COLORS.bgCardAlt,
    borderRadius: RADIUS.pill, overflow: 'hidden',
  },
  xpFill: {
    height: '100%', borderRadius: RADIUS.pill,
    backgroundColor: COLORS.primary,
  },

  // Streak
  streakCard: {
    marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: SPACING.md, borderWidth: 1, borderColor: COLORS.warning + '40',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  streakLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  streakFire: { fontSize: 32 },
  streakCount: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textPrimary },
  streakSub: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  streakBtn: {
    backgroundColor: COLORS.warning + '22',
    borderRadius: RADIUS.pill, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.warning + '60',
  },
  streakBtnText: { fontSize: FONTS.sizes.sm, fontWeight: '800', color: COLORS.warning },

  // Sections
  section: { marginHorizontal: SPACING.lg, marginBottom: SPACING.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.textPrimary },
  sectionLink: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '700' },

  // Mission summary bar
  missionSummary: { marginBottom: SPACING.sm },
  missionSummaryText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  missionSummaryBar: { height: 5, backgroundColor: COLORS.bgCardAlt, borderRadius: RADIUS.pill, overflow: 'hidden' },
  missionSummaryFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: RADIUS.pill },

  // Mission cards
  missionCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md,
    padding: SPACING.md, flexDirection: 'row', alignItems: 'center',
    marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.md,
  },
  missionIconBox: { width: 44, height: 44, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  missionIcon: { fontSize: 22 },
  missionInfo: { flex: 1 },
  missionTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textPrimary },
  missionDesc: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  missionRight: { alignItems: 'center', gap: 2 },
  missionXP: { fontSize: FONTS.sizes.md, fontWeight: '900' },
  missionXPLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  missionArrow: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  missionArrowText: { color: COLORS.bg, fontWeight: '900', fontSize: 14 },

  // Bureau row
  bureauRow: { flexDirection: 'row', gap: SPACING.sm },
  bureauCard: {
    flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md,
    padding: SPACING.md, alignItems: 'center', borderWidth: 1,
  },
  bureauName: { fontSize: FONTS.sizes.xs, fontWeight: '800', letterSpacing: 0.5, marginBottom: SPACING.xs },
  bureauScore: { fontSize: FONTS.sizes.xxl, fontWeight: '900' },
  bureauTier: { fontSize: 10, fontWeight: '700', marginTop: 2 },

  // Quick Actions
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  actionCard: {
    width: (width - SPACING.lg * 2 - SPACING.sm) / 2,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: SPACING.md, alignItems: 'center', gap: SPACING.sm,
    borderWidth: 1,
  },
  actionIconBox: { width: 52, height: 52, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  actionIcon: { fontSize: 26 },
  actionLabel: { fontSize: FONTS.sizes.sm, fontWeight: '800' },

  // Achievement
  achievementCard: {
    marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    borderWidth: 1, borderColor: COLORS.secondary + '30',
  },
  achievementIcon: { fontSize: 40 },
  achievementInfo: { flex: 1 },
  achievementTitle: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, letterSpacing: 1 },
  achievementName: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textPrimary },
  achievementDesc: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  achievementXP: { fontSize: FONTS.sizes.md, fontWeight: '900', color: COLORS.secondary },
});
