/**
 * FEDGE 2.O — First Mission Screen
 * The hook that brings them back tomorrow.
 * Inspired by: Clash of Clans "Builder is ready", Duolingo streak start,
 *              Candy Crush "level 1 complete" dopamine
 *
 * Addictive hooks:
 * - Chest opening animation (treasure = engagement spike)
 * - Streak starts TODAY (streak loss aversion kicks in immediately)
 * - "Double XP ends in 23:47:12" — urgency/FOMO
 * - 3 missions shown but only 1 unlocked — curiosity gap
 * - "Come back tomorrow" = habit formation from day 1
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@constants/theme';
import { XP, FEDGE_COINS } from '@constants/gameConfig';
import { useGameStore } from '@store/gameStore';
import { OnboardingStackParamList } from '@navigation/OnboardingNavigator';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'FirstMission'>;
};

const MISSIONS = [
  {
    id: 'm1',
    title: 'The 5 Factors',
    subtitle: 'Learn what controls your credit score',
    xp: 50,
    coins: 10,
    time: '3 min',
    locked: false,
    icon: '📊',
    color: COLORS.primary,
  },
  {
    id: 'm2',
    title: 'Utilization Mastery',
    subtitle: 'The fastest way to add 40+ points',
    xp: 100,
    coins: 25,
    time: '5 min',
    locked: true,
    icon: '⚡',
    color: COLORS.warning,
  },
  {
    id: 'm3',
    title: 'Payment History',
    subtitle: 'Never miss a payment — ever',
    xp: 75,
    coins: 15,
    time: '4 min',
    locked: true,
    icon: '🛡️',
    color: COLORS.success,
  },
];

const TOTAL_ONBOARDING_XP = XP.COMPLETE_ONBOARDING + XP.SCORE_REVEALED + XP.CHOOSE_PATH;
const COUNTDOWN_SECONDS = 23 * 3600 + 47 * 60 + 12;

export default function FirstMissionScreen({ navigation }: Props) {
  const addXP = useGameStore((s) => s.addXP);
  const addFedgeCoins = useGameStore((s) => s.addFedgeCoins);
  const incrementStreak = useGameStore((s) => s.incrementStreak);
  const level = useGameStore((s) => s.level);
  const xp = useGameStore((s) => s.xp);

  const [chestOpen, setChestOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_SECONDS);

  const chestScale = useRef(new Animated.Value(0.8)).current;
  const chestOpacity = useRef(new Animated.Value(0)).current;
  const chestShake = useRef(new Animated.Value(0)).current;
  const rewardsOpacity = useRef(new Animated.Value(0)).current;
  const rewardsScale = useRef(new Animated.Value(0.8)).current;
  const missionsOpacity = useRef(new Animated.Value(0)).current;
  const streakOpacity = useRef(new Animated.Value(0)).current;
  const ctaOpacity = useRef(new Animated.Value(0)).current;
  const timerOpacity = useRef(new Animated.Value(0)).current;

  const confettiAnims = Array.from({ length: 8 }, () => ({
    opacity: useRef(new Animated.Value(0)).current,
    translateY: useRef(new Animated.Value(0)).current,
    translateX: useRef(new Animated.Value((Math.random() - 0.5) * width)).current,
    rotate: useRef(new Animated.Value(0)).current,
  }));

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft((t) => Math.max(t - 1, 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  useEffect(() => {
    // Chest entrance
    Animated.sequence([
      Animated.parallel([
        Animated.spring(chestScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
        Animated.timing(chestOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.delay(400),
      // Chest shakes — building anticipation
      Animated.loop(
        Animated.sequence([
          Animated.timing(chestShake, { toValue: 8, duration: 60, useNativeDriver: true }),
          Animated.timing(chestShake, { toValue: -8, duration: 60, useNativeDriver: true }),
          Animated.timing(chestShake, { toValue: 4, duration: 60, useNativeDriver: true }),
          Animated.timing(chestShake, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]),
        { iterations: 3 }
      ),
    ]).start();
  }, []);

  const openChest = () => {
    if (chestOpen) return;
    setChestOpen(true);
    addXP(TOTAL_ONBOARDING_XP);
    addFedgeCoins(FEDGE_COINS.ALL_BUREAUS);
    incrementStreak();

    // Explode confetti
    confettiAnims.forEach((c, i) => {
      Animated.sequence([
        Animated.delay(i * 50),
        Animated.parallel([
          Animated.timing(c.opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(c.translateY, { toValue: -height * 0.4, duration: 1000, useNativeDriver: true }),
        ]),
        Animated.timing(c.opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    });

    // Show rewards
    Animated.sequence([
      Animated.parallel([
        Animated.spring(rewardsScale, { toValue: 1, tension: 70, friction: 8, useNativeDriver: true }),
        Animated.timing(rewardsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.delay(400),
      Animated.timing(streakOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(300),
      Animated.timing(missionsOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(ctaOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(timerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Confetti */}
      {confettiAnims.map((c, i) => (
        <Animated.View
          key={i}
          style={[
            styles.confetti,
            {
              opacity: c.opacity,
              backgroundColor: [
                COLORS.primary, COLORS.secondary, COLORS.success,
                COLORS.accent, COLORS.warning, COLORS.danger,
              ][i % 6],
              transform: [
                { translateX: c.translateX },
                { translateY: c.translateY },
              ],
            },
          ]}
        />
      ))}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Progress dots */}
        <View style={styles.progressDotsRow}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.dot, styles.dotActive]} />
          ))}
        </View>

        <Text style={styles.eyebrow}>MISSION UNLOCKED</Text>
        <Text style={styles.headline}>Open Your Welcome Chest</Text>

        {/* Chest */}
        <Animated.View
          style={[
            styles.chestContainer,
            {
              opacity: chestOpacity,
              transform: [
                { scale: chestScale },
                { translateX: chestShake },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.chest, chestOpen && styles.chestOpen]}
            onPress={openChest}
            activeOpacity={0.85}
          >
            <Text style={styles.chestEmoji}>{chestOpen ? '🎊' : '🎁'}</Text>
            {!chestOpen && <Text style={styles.chestTap}>TAP TO OPEN</Text>}
          </TouchableOpacity>
        </Animated.View>

        {/* Rewards */}
        {chestOpen && (
          <Animated.View
            style={[
              styles.rewardsCard,
              { opacity: rewardsOpacity, transform: [{ scale: rewardsScale }] },
            ]}
          >
            <Text style={styles.rewardsTitle}>Welcome Rewards</Text>
            <View style={styles.rewardsRow}>
              <View style={styles.rewardItem}>
                <Text style={styles.rewardValue}>+{TOTAL_ONBOARDING_XP}</Text>
                <Text style={styles.rewardLabel}>XP Earned</Text>
              </View>
              <View style={styles.rewardDivider} />
              <View style={styles.rewardItem}>
                <Text style={[styles.rewardValue, { color: COLORS.secondary }]}>
                  +{FEDGE_COINS.ALL_BUREAUS}
                </Text>
                <Text style={styles.rewardLabel}>FEDGE Coins</Text>
              </View>
              <View style={styles.rewardDivider} />
              <View style={styles.rewardItem}>
                <Text style={[styles.rewardValue, { color: COLORS.success }]}>Lv. {level}</Text>
                <Text style={styles.rewardLabel}>Current Level</Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Streak */}
        {chestOpen && (
          <Animated.View style={[styles.streakCard, { opacity: streakOpacity }]}>
            <Text style={styles.streakFire}>🔥</Text>
            <View>
              <Text style={styles.streakTitle}>Day 1 Streak Started!</Text>
              <Text style={styles.streakSub}>
                Come back tomorrow to keep your streak alive.{'\n'}
                Lose it and lose your bonus XP multiplier.
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Missions */}
        {chestOpen && (
          <Animated.View style={[styles.missionsSection, { opacity: missionsOpacity }]}>
            <View style={styles.missionHeader}>
              <Text style={styles.missionsTitle}>Your Missions</Text>
              {/* Double XP timer */}
              <Animated.View style={[styles.timerBadge, { opacity: timerOpacity }]}>
                <Text style={styles.timerLabel}>2X XP</Text>
                <Text style={styles.timerValue}>{formatTime(timeLeft)}</Text>
              </Animated.View>
            </View>

            {MISSIONS.map((mission, i) => (
              <View
                key={mission.id}
                style={[styles.missionCard, mission.locked && styles.missionLocked]}
              >
                <View style={[styles.missionIcon, { backgroundColor: mission.color + '22' }]}>
                  <Text style={styles.missionEmoji}>{mission.locked ? '🔒' : mission.icon}</Text>
                </View>
                <View style={styles.missionInfo}>
                  <Text style={[styles.missionTitle, mission.locked && { color: COLORS.textMuted }]}>
                    {mission.title}
                  </Text>
                  <Text style={styles.missionSubtitle}>
                    {mission.locked ? 'Complete previous mission to unlock' : mission.subtitle}
                  </Text>
                </View>
                <View style={styles.missionMeta}>
                  <Text style={[styles.missionXP, { color: mission.locked ? COLORS.textMuted : mission.color }]}>
                    +{mission.xp} XP
                  </Text>
                  <Text style={styles.missionTime}>{mission.time}</Text>
                </View>
              </View>
            ))}
          </Animated.View>
        )}

        {/* CTA */}
        {chestOpen && (
          <Animated.View style={[styles.ctaContainer, { opacity: ctaOpacity }]}>
            <TouchableOpacity
              style={styles.ctaButton}
              activeOpacity={0.85}
              onPress={() => {
                /* Navigate to main game HomeScreen */
                // navigation.navigate('MainApp');
              }}
            >
              <Text style={styles.ctaText}>🚀 Start Mission 1</Text>
            </TouchableOpacity>
            <Text style={styles.ctaSubtext}>
              Double XP active • {formatTime(timeLeft)} remaining
            </Text>
          </Animated.View>
        )}

        {!chestOpen && (
          <Text style={styles.tapHint}>👆 Tap the chest to claim your rewards</Text>
        )}
      </ScrollView>
    </View>
  );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: SPACING.lg, paddingTop: 56, paddingBottom: 48, alignItems: 'center' },
  confetti: {
    position: 'absolute',
    bottom: '50%',
    left: '50%',
    width: 10, height: 10,
    borderRadius: 2,
    zIndex: 50,
  },
  progressDotsRow: { flexDirection: 'row', gap: SPACING.xs, marginBottom: SPACING.xl, alignSelf: 'flex-start' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.bgCardAlt },
  dotActive: { backgroundColor: COLORS.primary, width: 24 },
  eyebrow: { fontSize: FONTS.sizes.xs, color: COLORS.secondary, letterSpacing: 3, marginBottom: SPACING.sm },
  headline: { fontSize: FONTS.sizes.xxl, fontWeight: '900', color: COLORS.textPrimary, marginBottom: SPACING.xl, textAlign: 'center' },
  chestContainer: { marginBottom: SPACING.xl },
  chest: {
    width: 140, height: 140, borderRadius: RADIUS.xl,
    backgroundColor: COLORS.bgCard,
    borderWidth: 3, borderColor: COLORS.secondary,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.gold,
  },
  chestOpen: { borderColor: COLORS.success },
  chestEmoji: { fontSize: 64 },
  chestTap: { fontSize: FONTS.sizes.xs, color: COLORS.secondary, letterSpacing: 2, marginTop: SPACING.xs },
  tapHint: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, marginTop: SPACING.lg },
  rewardsCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.secondary + '50',
    width: '100%', marginBottom: SPACING.md,
  },
  rewardsTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textSecondary, marginBottom: SPACING.md, textAlign: 'center' },
  rewardsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  rewardItem: { alignItems: 'center' },
  rewardValue: { fontSize: FONTS.sizes.xl, fontWeight: '900', color: COLORS.primary },
  rewardLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  rewardDivider: { width: 1, height: 40, backgroundColor: COLORS.border },
  streakCard: {
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.warning + '40',
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    width: '100%', marginBottom: SPACING.md,
  },
  streakFire: { fontSize: 40 },
  streakTitle: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textPrimary },
  streakSub: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, marginTop: 2, lineHeight: 18 },
  missionsSection: { width: '100%', marginBottom: SPACING.xl },
  missionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
  missionsTitle: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.textPrimary },
  timerBadge: {
    backgroundColor: COLORS.danger + '22',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.danger + '40',
  },
  timerLabel: { fontSize: 9, color: COLORS.danger, fontWeight: '800', letterSpacing: 1 },
  timerValue: { fontSize: FONTS.sizes.sm, color: COLORS.danger, fontWeight: '800' },
  missionCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md, padding: SPACING.md,
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
  },
  missionLocked: { opacity: 0.5 },
  missionIcon: {
    width: 48, height: 48, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  missionEmoji: { fontSize: 24 },
  missionInfo: { flex: 1 },
  missionTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textPrimary },
  missionSubtitle: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  missionMeta: { alignItems: 'flex-end' },
  missionXP: { fontSize: FONTS.sizes.sm, fontWeight: '800' },
  missionTime: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  ctaContainer: { width: '100%', gap: SPACING.sm, alignItems: 'center' },
  ctaButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
    ...SHADOWS.primary,
  },
  ctaText: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.bg },
  ctaSubtext: { fontSize: FONTS.sizes.sm, color: COLORS.danger },
});
