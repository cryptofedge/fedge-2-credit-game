/**
 * FEDGE 2.O — Score Reveal Screen
 * THE dopamine moment. The credit score reveal.
 * Inspired by: Pokemon evolving, Wordle reveal, scratch ticket moment
 *
 * Addictive hooks:
 * - 3...2...1 countdown builds unbearable anticipation
 * - Score counts up from 0 with sound-like haptic feel
 * - Color transitions through tiers as number rises
 * - Personalized breakdown: "Here's what's hurting you most"
 * - Immediate call to action: "Fix this TODAY"
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
import { SCORE_TIERS, getScoreTier } from '@utils/creditScore';
import { useGameStore } from '@store/gameStore';
import { OnboardingStackParamList } from '@navigation/OnboardingNavigator';
import { XP } from '@constants/gameConfig';

const { width, height } = Dimensions.get('window');
const DEMO_SCORE = 694; // Will be replaced by real bureau average

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'ScoreReveal'>;
};

const FACTORS = [
  { label: 'Payment History', grade: 'A', impact: '+', color: COLORS.success, tip: 'On-time payments. Keep it up!' },
  { label: 'Credit Utilization', grade: 'C', impact: '-', color: COLORS.warning, tip: '31% utilized. Get below 10% to unlock +40 pts.' },
  { label: 'Credit Age', grade: 'B', impact: '+', color: COLORS.scoreGood, tip: '4 years average. Older = better.' },
  { label: 'Credit Mix', grade: 'B+', impact: '+', color: COLORS.scoreVeryGood, tip: 'Good variety of accounts.' },
  { label: 'New Credit', grade: 'B-', impact: '-', color: COLORS.scoreFair, tip: '3 recent inquiries. Wait 6 months.' },
];

export default function ScoreRevealScreen({ navigation }: Props) {
  const addXP = useGameStore((s) => s.addXP);
  const [phase, setPhase] = useState<'countdown' | 'reveal' | 'breakdown'>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [displayScore, setDisplayScore] = useState(0);
  const [currentTier, setCurrentTier] = useState(SCORE_TIERS[0]);

  const countdownScale = useRef(new Animated.Value(1)).current;
  const countdownOpacity = useRef(new Animated.Value(1)).current;
  const ringScale = useRef(new Animated.Value(0)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const scoreOpacity = useRef(new Animated.Value(0)).current;
  const tierOpacity = useRef(new Animated.Value(0)).current;
  const breakdownOpacity = useRef(new Animated.Value(0)).current;
  const ctaOpacity = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Pulsing glow loop
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Countdown sequence
  useEffect(() => {
    let count = 3;
    const tick = () => {
      Animated.sequence([
        Animated.timing(countdownScale, { toValue: 1.4, duration: 150, useNativeDriver: true }),
        Animated.timing(countdownScale, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(countdownOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start(() => {
        count--;
        if (count > 0) {
          setCountdown(count);
          countdownOpacity.setValue(1);
          setTimeout(tick, 200);
        } else {
          startReveal();
        }
      });
    };
    setTimeout(tick, 800);
  }, []);

  const startReveal = () => {
    setPhase('reveal');
    addXP(XP.SCORE_REVEALED);

    Animated.parallel([
      Animated.spring(ringScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
      Animated.timing(ringOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      Animated.timing(scoreOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });

    // Count up score
    const target = DEMO_SCORE;
    const duration = 2200;
    const steps = 70;
    const increment = target / steps;
    const interval = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setDisplayScore(target);
        setCurrentTier(getScoreTier(target));
        clearInterval(timer);

        // Show tier badge then breakdown
        Animated.sequence([
          Animated.delay(400),
          Animated.timing(tierOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.delay(600),
          Animated.timing(breakdownOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.delay(400),
          Animated.timing(ctaOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start(() => setPhase('breakdown'));
      } else {
        const score = Math.floor(current);
        setDisplayScore(score);
        setCurrentTier(getScoreTier(score));
      }
    }, interval);
  };

  const tierColor = currentTier?.color ?? COLORS.primary;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Countdown phase */}
      {phase === 'countdown' && (
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownLabel}>Pulling your scores in...</Text>
          <Animated.Text
            style={[
              styles.countdownNumber,
              { transform: [{ scale: countdownScale }], opacity: countdownOpacity },
            ]}
          >
            {countdown}
          </Animated.Text>
          <Text style={styles.countdownSub}>Get ready 👀</Text>
        </View>
      )}

      {/* Reveal phase */}
      {phase !== 'countdown' && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.revealScroll}
        >
          <View style={styles.progressDotsRow}>
            {[0, 1, 2, 3, 4].map((i) => (
              <View key={i} style={[styles.dot, i <= 3 && styles.dotActive]} />
            ))}
          </View>

          <Text style={styles.revealEyebrow}>YOUR FEDGE SCORE</Text>

          {/* Score Ring */}
          <Animated.View
            style={[
              styles.scoreRing,
              {
                borderColor: tierColor,
                shadowColor: tierColor,
                opacity: ringOpacity,
                transform: [{ scale: ringScale }],
              },
            ]}
          >
            {/* Glow pulse */}
            <Animated.View
              style={[
                styles.scoreGlow,
                { backgroundColor: tierColor + '30', opacity: glowAnim },
              ]}
            />
            <Animated.View style={[styles.scoreInner, { opacity: scoreOpacity }]}>
              <Text style={[styles.scoreNumber, { color: tierColor }]}>{displayScore}</Text>
              <Animated.View style={{ opacity: tierOpacity }}>
                <Text style={[styles.tierLabel, { color: tierColor }]}>
                  {currentTier?.label?.toUpperCase()}
                </Text>
              </Animated.View>
            </Animated.View>
          </Animated.View>

          {/* Score range context */}
          <Animated.View style={[styles.tierContext, { opacity: tierOpacity }]}>
            <Text style={styles.tierContextText}>
              Score range {currentTier?.range?.[0]}–{currentTier?.range?.[1]} •{' '}
              {currentTier?.description}
            </Text>
          </Animated.View>

          {/* Breakdown */}
          <Animated.View style={[styles.breakdown, { opacity: breakdownOpacity }]}>
            <Text style={styles.breakdownTitle}>What's affecting your score</Text>

            {FACTORS.map((factor, i) => (
              <View key={i} style={styles.factorRow}>
                <View style={styles.factorLeft}>
                  <Text style={styles.factorLabel}>{factor.label}</Text>
                  <Text style={styles.factorTip}>{factor.tip}</Text>
                </View>
                <View style={[styles.gradeBadge, { backgroundColor: factor.color + '22' }]}>
                  <Text style={[styles.gradeText, { color: factor.color }]}>{factor.grade}</Text>
                </View>
              </View>
            ))}

            {/* Potential score */}
            <View style={styles.potentialCard}>
              <Text style={styles.potentialLabel}>Your potential score</Text>
              <Text style={styles.potentialScore}>750+</Text>
              <Text style={styles.potentialSub}>
                With FEDGE missions, you could add{' '}
                <Text style={{ color: COLORS.success, fontWeight: '800' }}>+56 points</Text>
                {' '}in 90 days.
              </Text>
            </View>
          </Animated.View>

          {/* CTA */}
          <Animated.View style={[styles.ctaContainer, { opacity: ctaOpacity }]}>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate('FirstMission')}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaText}>Start Building →</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  countdownContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xl,
  },
  countdownLabel: { fontSize: FONTS.sizes.lg, color: COLORS.textSecondary },
  countdownNumber: {
    fontSize: 120,
    fontWeight: '900',
    color: COLORS.primary,
    lineHeight: 130,
  },
  countdownSub: { fontSize: FONTS.sizes.md, color: COLORS.textMuted },
  revealScroll: { paddingHorizontal: SPACING.lg, paddingTop: 56, paddingBottom: 48, alignItems: 'center' },
  progressDotsRow: { flexDirection: 'row', gap: SPACING.xs, marginBottom: SPACING.xl, alignSelf: 'flex-start' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.bgCardAlt },
  dotActive: { backgroundColor: COLORS.primary, width: 24 },
  revealEyebrow: {
    fontSize: FONTS.sizes.xs, color: COLORS.primary,
    letterSpacing: 3, marginBottom: SPACING.xl,
  },
  scoreRing: {
    width: 220, height: 220,
    borderRadius: 110, borderWidth: 5,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.md,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 30,
    elevation: 14,
  },
  scoreGlow: {
    position: 'absolute',
    width: 220, height: 220,
    borderRadius: 110,
  },
  scoreInner: { alignItems: 'center' },
  scoreNumber: { fontSize: FONTS.sizes.hero, fontWeight: '900' },
  tierLabel: { fontSize: FONTS.sizes.sm, fontWeight: '800', letterSpacing: 2, marginTop: 4 },
  tierContext: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '100%',
  },
  tierContextText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
  breakdown: { width: '100%', marginBottom: SPACING.xl },
  breakdownTitle: {
    fontSize: FONTS.sizes.lg, fontWeight: '800',
    color: COLORS.textPrimary, marginBottom: SPACING.md,
  },
  factorRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md, padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
    justifyContent: 'space-between',
  },
  factorLeft: { flex: 1, marginRight: SPACING.md },
  factorLabel: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textPrimary },
  factorTip: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  gradeBadge: {
    width: 40, height: 40, borderRadius: RADIUS.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  gradeText: { fontSize: FONTS.sizes.md, fontWeight: '900' },
  potentialCard: {
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: RADIUS.lg, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.success + '40',
    alignItems: 'center', marginTop: SPACING.md,
  },
  potentialLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  potentialScore: { fontSize: FONTS.sizes.hero, fontWeight: '900', color: COLORS.success },
  potentialSub: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm, lineHeight: 20 },
  ctaContainer: { width: '100%' },
  ctaButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
    ...SHADOWS.primary,
  },
  ctaText: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.bg },
});
