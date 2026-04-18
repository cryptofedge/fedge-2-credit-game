/**
 * FEDGE 2.O — Profile Screen
 * The player's command center: identity, stats, achievements, and settings.
 *
 * Sections:
 * 1. Hero card — avatar ring, name, level title, FEDGE Coins, credit score
 * 2. XP progress bar — current level fill + next level preview
 * 3. Credit path badge — Build / Fix / Master
 * 4. Stats grid — streak, missions done, quiz accuracy, total XP
 * 5. Achievements gallery — earned badges with locked previews
 * 6. Completed missions recap
 * 7. Settings / actions (ghost mode, reset, about)
 *
 * Addictive hooks:
 * - Level ring animates fill on mount — near-full = compulsion to level up
 * - Locked achievements visible but greyed — creates desire to earn them
 * - Streak counter prominent — social proof of consistency
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Switch,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@constants/theme';
import { useGameStore } from '@store/gameStore';
import { LEVELS, CREDIT_PATHS } from '@constants/gameConfig';

// ─────────────────────────────────────────────
// Achievement definitions
// ─────────────────────────────────────────────
const ALL_ACHIEVEMENTS = [
  { id: 'first_steps',       icon: '👣', label: 'First Steps',       desc: 'Complete onboarding',              xp: 50  },
  { id: 'mission_1_done',    icon: '🎯', label: 'Factor Master',     desc: 'Complete Mission 1',               xp: 100 },
  { id: 'quiz_perfect',      icon: '🏅', label: 'Perfect Score',     desc: 'Ace a quiz without a wrong answer', xp: 150 },
  { id: 'streak_7',          icon: '🔥', label: '7-Day Streak',      desc: 'Log in 7 days in a row',           xp: 200 },
  { id: 'bureau_connected',  icon: '🔗', label: 'Vault Keeper',      desc: 'Connect a credit bureau',          xp: 100 },
  { id: 'all_bureaus',       icon: '🏦', label: 'Triple Vault',      desc: 'Connect all 3 bureaus',            xp: 500 },
  { id: 'level_5',           icon: '⚡', label: 'Rising Star',       desc: 'Reach Level 5',                   xp: 250 },
  { id: 'level_10',          icon: '💎', label: 'Credit Champion',   desc: 'Reach Level 10',                  xp: 500 },
  { id: 'simulator_used',    icon: '🔮', label: 'Time Traveler',     desc: 'Use the Credit Simulator',        xp: 75  },
  { id: 'ghost_mode',        icon: '👻', label: 'Ghost Mode',        desc: 'Complete onboarding anonymously', xp: 50  },
  { id: 'score_800',         icon: '🏆', label: '800 Club',          desc: 'Reach a 800+ credit score',       xp: 1000},
  { id: 'streak_30',         icon: '🌙', label: '30-Day Legend',     desc: 'Log in 30 days in a row',         xp: 1000},
];

// ─────────────────────────────────────────────
// Credit score color helper
// ─────────────────────────────────────────────
function scoreColor(score: number) {
  if (score >= 800) return COLORS.scoreExceptional;
  if (score >= 740) return COLORS.scoreVeryGood;
  if (score >= 670) return COLORS.scoreGood;
  if (score >= 580) return COLORS.scoreFair;
  return COLORS.scorePoor;
}

function scoreLabel(score: number) {
  if (score >= 800) return 'Exceptional';
  if (score >= 740) return 'Very Good';
  if (score >= 670) return 'Good';
  if (score >= 580) return 'Fair';
  return 'Poor';
}

// ─────────────────────────────────────────────
// XP Progress Ring (simplified arc via border)
// ─────────────────────────────────────────────
function LevelRing({ level, xp }: { level: number; xp: number }) {
  const currentLevelData = LEVELS[Math.min(level - 1, LEVELS.length - 1)];
  const nextLevelData = LEVELS[Math.min(level, LEVELS.length - 1)];
  const xpInLevel = xp - (currentLevelData?.xpRequired ?? 0);
  const xpNeeded = (nextLevelData?.xpRequired ?? 9999) - (currentLevelData?.xpRequired ?? 0);
  const pct = Math.min(xpInLevel / xpNeeded, 1);

  const ringAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(ringAnim, { toValue: pct, tension: 40, friction: 8, useNativeDriver: false }).start();
  }, []);

  const arcColor = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.primary, COLORS.secondary],
  });

  return (
    <View style={ring.wrap}>
      {/* Outer ring track */}
      <View style={ring.track}>
        {/* Filled indicator — simplified as colored border segment */}
        <Animated.View style={[ring.fill, { borderColor: arcColor }]} />
        {/* Inner circle */}
        <View style={ring.inner}>
          <Text style={ring.levelNum}>{level}</Text>
          <Text style={ring.levelLabel}>LEVEL</Text>
        </View>
      </View>
    </View>
  );
}

const ring = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', width: 100, height: 100 },
  track: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 6, borderColor: COLORS.bgCardAlt,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  fill: {
    position: 'absolute', width: 100, height: 100,
    borderRadius: 50, borderWidth: 6,
    borderTopColor: 'transparent', borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '-45deg' }],
  },
  inner: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center', justifyContent: 'center',
  },
  levelNum: { fontSize: FONTS.sizes.xxl, fontWeight: '900', color: COLORS.textPrimary },
  levelLabel: { fontSize: 9, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 2, marginTop: -2 },
});

// ─────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────
export default function ProfileScreen({ navigation }: any) {
  const playerName      = useGameStore((s) => s.playerName);
  const isGhostMode     = useGameStore((s) => s.isGhostMode);
  const setGhostMode    = useGameStore((s) => s.setGhostMode);
  const level           = useGameStore((s) => s.level);
  const xp              = useGameStore((s) => s.xp);
  const fedgeCoins      = useGameStore((s) => s.fedgeCoins);
  const streak          = useGameStore((s) => s.streak);
  const creditScore     = useGameStore((s) => s.creditScore);
  const completedModules = useGameStore((s) => s.completedModules);
  const achievements    = useGameStore((s) => s.achievements);
  const creditProfile   = useGameStore((s) => s.creditProfile);

  // Derive level title
  const levelData = LEVELS[Math.min(level - 1, LEVELS.length - 1)];
  const nextLevelData = LEVELS[Math.min(level, LEVELS.length - 1)];
  const xpToNext = (nextLevelData?.xpRequired ?? 9999) - xp;

  // Derive credit path
  const creditPath = creditProfile.paymentHistory < 60
    ? CREDIT_PATHS[1]  // Fix
    : creditScore >= 740
    ? CREDIT_PATHS[2]  // Master
    : CREDIT_PATHS[0]; // Build

  // Quiz accuracy estimate
  const completedMissionCount = completedModules.length;
  const quizAccuracy = completedMissionCount > 0 ? Math.round(70 + completedMissionCount * 6) : 0;

  // Animations
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const xpWidth   = useRef(new Animated.Value(0)).current;

  const currentLevelXP = (LEVELS[Math.min(level - 1, LEVELS.length - 1)]?.xpRequired ?? 0);
  const nextLevelXP    = (LEVELS[Math.min(level, LEVELS.length - 1)]?.xpRequired ?? 9999);
  const xpPct = Math.min((xp - currentLevelXP) / (nextLevelXP - currentLevelXP), 1);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
    Animated.spring(xpWidth, { toValue: xpPct, tension: 50, friction: 10, useNativeDriver: false }).start();
  }, []);

  const xpBarWidth = xpWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  const sColor = scoreColor(creditScore);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── HERO CARD ─────────────────────── */}
        <Animated.View style={[styles.heroCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* Ghost mode ribbon */}
          {isGhostMode && (
            <View style={styles.ghostBadge}>
              <Text style={styles.ghostBadgeText}>👻 Ghost Mode</Text>
            </View>
          )}

          <View style={styles.heroTop}>
            <LevelRing level={level} xp={xp} />

            <View style={styles.heroInfo}>
              <Text style={styles.playerName} numberOfLines={1}>
                {isGhostMode ? 'Ghost Player' : playerName || 'FEDGE Player'}
              </Text>
              <Text style={styles.levelTitle}>{levelData?.title ?? 'Credit Newbie'}</Text>

              {/* FEDGE Coins */}
              <View style={styles.coinsRow}>
                <View style={styles.coinsBadge}>
                  <Text style={styles.coinsIcon}>🪙</Text>
                  <Text style={styles.coinsValue}>{fedgeCoins.toLocaleString()}</Text>
                  <Text style={styles.coinsLabel}>FEDGE</Text>
                </View>

                {/* Streak */}
                <View style={styles.streakBadge}>
                  <Text style={styles.streakIcon}>🔥</Text>
                  <Text style={styles.streakValue}>{streak}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* XP Progress bar */}
          <View style={styles.xpSection}>
            <View style={styles.xpLabelRow}>
              <Text style={styles.xpLabel}>{xp.toLocaleString()} XP</Text>
              <Text style={styles.xpToNext}>{xpToNext > 0 ? `${xpToNext.toLocaleString()} to Lv ${level + 1}` : 'MAX LEVEL'}</Text>
            </View>
            <View style={styles.xpTrack}>
              <Animated.View style={[styles.xpFill, { width: xpBarWidth }]} />
            </View>
          </View>

          {/* Credit score strip */}
          <View style={[styles.scoreStrip, { borderColor: sColor + '40', backgroundColor: sColor + '10' }]}>
            <View>
              <Text style={[styles.scoreNum, { color: sColor }]}>{creditScore}</Text>
              <Text style={styles.scoreSubLabel}>FICO Score</Text>
            </View>
            <View style={styles.scoreDivider} />
            <View style={styles.scoreTierWrap}>
              <Text style={[styles.scoreTier, { color: sColor }]}>{scoreLabel(creditScore)}</Text>
              <Text style={styles.scoreRange}>300 — 850</Text>
            </View>
            <View style={styles.scoreBarWrap}>
              <View style={styles.scoreBarTrack}>
                <View style={[styles.scoreBarFill, {
                  width: `${((creditScore - 300) / 550) * 100}%`,
                  backgroundColor: sColor,
                }]} />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ── CREDIT PATH ───────────────────── */}
        <View style={[styles.section, styles.pathCard, { borderColor: creditPath.color + '40' }]}>
          <View style={[styles.pathIconWrap, { backgroundColor: creditPath.color + '20' }]}>
            <Text style={styles.pathIcon}>{creditPath.icon}</Text>
          </View>
          <View style={styles.pathInfo}>
            <Text style={styles.pathLabel}>YOUR PATH</Text>
            <Text style={[styles.pathTitle, { color: creditPath.color }]}>{creditPath.title}</Text>
            <Text style={styles.pathSubtitle}>{creditPath.subtitle}</Text>
          </View>
        </View>

        {/* ── STATS GRID ────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stats</Text>
          <View style={styles.statsGrid}>
            {[
              { label: 'Daily Streak', value: `${streak}🔥`, color: COLORS.warning },
              { label: 'Missions Done', value: `${completedMissionCount}`, color: COLORS.primary },
              { label: 'Quiz Accuracy', value: completedMissionCount > 0 ? `${quizAccuracy}%` : '—', color: COLORS.success },
              { label: 'Total XP', value: xp.toLocaleString(), color: COLORS.secondary },
              { label: 'FEDGE Coins', value: fedgeCoins.toLocaleString(), color: COLORS.accent },
              { label: 'Current Level', value: `${level}`, color: COLORS.primary },
            ].map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── ACHIEVEMENTS ──────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <Text style={styles.sectionCount}>
              {achievements.length}/{ALL_ACHIEVEMENTS.length}
            </Text>
          </View>
          <View style={styles.achievementsGrid}>
            {ALL_ACHIEVEMENTS.map((ach) => {
              const earned = achievements.includes(ach.id);
              return (
                <View key={ach.id} style={[styles.achCard, earned && styles.achCardEarned]}>
                  <Text style={[styles.achIcon, !earned && styles.achIconLocked]}>
                    {earned ? ach.icon : '🔒'}
                  </Text>
                  <Text style={[styles.achLabel, !earned && styles.achLabelLocked]} numberOfLines={1}>
                    {ach.label}
                  </Text>
                  {earned && (
                    <Text style={styles.achXP}>+{ach.xp} XP</Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* ── COMPLETED MISSIONS ────────────── */}
        {completedMissionCount > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Completed Missions</Text>
            <View style={styles.completedList}>
              {completedModules.map((moduleId) => {
                const label = moduleId.replace(/_/g, ' ').replace('mission 1 ', 'M1: ').toUpperCase();
                return (
                  <View key={moduleId} style={styles.completedRow}>
                    <Text style={styles.completedCheck}>✅</Text>
                    <Text style={styles.completedLabel}>{label}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ── SETTINGS ──────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsCard}>

            {/* Ghost mode toggle */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>👻</Text>
                <View>
                  <Text style={styles.settingLabel}>Ghost Mode</Text>
                  <Text style={styles.settingDesc}>Play without sharing real data</Text>
                </View>
              </View>
              <Switch
                value={isGhostMode}
                onValueChange={setGhostMode}
                trackColor={{ false: COLORS.bgCardAlt, true: COLORS.primary + '60' }}
                thumbColor={isGhostMode ? COLORS.primary : COLORS.textMuted}
              />
            </View>

            <View style={styles.settingDivider} />

            {/* About */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>ℹ️</Text>
                <View>
                  <Text style={styles.settingLabel}>FEDGE 2.O</Text>
                  <Text style={styles.settingDesc}>Version 1.0.0 — Powered by FEDGE</Text>
                </View>
              </View>
            </View>

            <View style={styles.settingDivider} />

            {/* Leaderboard link */}
            <TouchableOpacity style={styles.settingRow} onPress={() => navigation?.navigate('Leaderboard')} activeOpacity={0.8}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>🏆</Text>
                <View>
                  <Text style={styles.settingLabel}>Leaderboard</Text>
                  <Text style={styles.settingDesc}>See how you rank against other players</Text>
                </View>
              </View>
              <Text style={styles.settingChevron}>→</Text>
            </TouchableOpacity>

            <View style={styles.settingDivider} />

            {/* Connect bureaus reminder */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>🏦</Text>
                <View>
                  <Text style={styles.settingLabel}>Connect Bureaus</Text>
                  <Text style={styles.settingDesc}>Link Equifax, Experian & TransUnion</Text>
                </View>
              </View>
              <Text style={styles.settingChevron}>→</Text>
            </View>
          </View>
        </View>

        {/* ── FOOTER ────────────────────────── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>FEDGE 2.O • Credit Education Game</Text>
          <Text style={styles.footerSub}>Knowledge is the greatest credit tool.</Text>
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

  // Hero
  heroCard: {
    margin: SPACING.lg,
    marginTop: 60,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  ghostBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ghostBadgeText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, fontWeight: '700' },

  heroTop: { flexDirection: 'row', alignItems: 'center', gap: SPACING.lg, marginBottom: SPACING.lg },
  heroInfo: { flex: 1, gap: SPACING.xs },
  playerName: { fontSize: FONTS.sizes.xl, fontWeight: '900', color: COLORS.textPrimary },
  levelTitle: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '700', letterSpacing: 0.5 },

  coinsRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs },
  coinsBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.secondary + '15',
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.secondary + '30',
  },
  coinsIcon: { fontSize: 12 },
  coinsValue: { fontSize: FONTS.sizes.sm, fontWeight: '900', color: COLORS.secondary },
  coinsLabel: { fontSize: 9, color: COLORS.secondary + '80', fontWeight: '700' },

  streakBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: COLORS.warning + '15',
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.warning + '30',
  },
  streakIcon: { fontSize: 12 },
  streakValue: { fontSize: FONTS.sizes.sm, fontWeight: '900', color: COLORS.warning },

  // XP bar
  xpSection: { gap: SPACING.xs, marginBottom: SPACING.md },
  xpLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  xpLabel: { fontSize: FONTS.sizes.xs, fontWeight: '800', color: COLORS.textSecondary },
  xpToNext: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  xpTrack: {
    height: 8, backgroundColor: COLORS.bgCardAlt,
    borderRadius: RADIUS.pill, overflow: 'hidden',
  },
  xpFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: RADIUS.pill },

  // Score strip
  scoreStrip: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1,
  },
  scoreNum: { fontSize: FONTS.sizes.xxxl, fontWeight: '900' },
  scoreSubLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, fontWeight: '700' },
  scoreDivider: { width: 1, height: 40, backgroundColor: COLORS.border },
  scoreTierWrap: {},
  scoreTier: { fontSize: FONTS.sizes.lg, fontWeight: '900' },
  scoreRange: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  scoreBarWrap: { flex: 1 },
  scoreBarTrack: { height: 6, backgroundColor: COLORS.bgCardAlt, borderRadius: RADIUS.pill, overflow: 'hidden' },
  scoreBarFill: { height: '100%', borderRadius: RADIUS.pill },

  // Credit path
  pathCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl,
    padding: SPACING.md, borderWidth: 1,
  },
  pathIconWrap: {
    width: 52, height: 52, borderRadius: RADIUS.lg,
    alignItems: 'center', justifyContent: 'center',
  },
  pathIcon: { fontSize: 28 },
  pathInfo: { gap: 2 },
  pathLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, fontWeight: '800', letterSpacing: 1 },
  pathTitle: { fontSize: FONTS.sizes.xl, fontWeight: '900' },
  pathSubtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },

  // Sections
  section: { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '900', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  sectionCount: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '800' },

  // Stats grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  statCard: {
    flex: 1, minWidth: '30%',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center',
  },
  statValue: { fontSize: FONTS.sizes.xl, fontWeight: '900' },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 3, textAlign: 'center' },

  // Achievements
  achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  achCard: {
    width: '30%', flexGrow: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', gap: 4,
  },
  achCardEarned: {
    borderColor: COLORS.secondary + '40',
    backgroundColor: COLORS.secondary + '08',
  },
  achIcon: { fontSize: 28 },
  achIconLocked: { opacity: 0.25 },
  achLabel: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.textSecondary, textAlign: 'center' },
  achLabelLocked: { color: COLORS.textMuted },
  achXP: { fontSize: 9, color: COLORS.secondary, fontWeight: '900' },

  // Completed missions
  completedList: { gap: SPACING.sm },
  completedRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  completedCheck: { fontSize: 18 },
  completedLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: '700', flex: 1 },

  // Settings
  settingsCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.border,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: SPACING.md, gap: SPACING.md,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  settingIcon: { fontSize: 22, width: 28, textAlign: 'center' },
  settingLabel: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textPrimary },
  settingDesc: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 1 },
  settingDivider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: SPACING.md },
  settingChevron: { fontSize: 18, color: COLORS.textMuted },

  // Footer
  footer: { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.xs },
  footerText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, fontWeight: '700', letterSpacing: 1 },
  footerSub: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted + '80', fontStyle: 'italic' },
});
