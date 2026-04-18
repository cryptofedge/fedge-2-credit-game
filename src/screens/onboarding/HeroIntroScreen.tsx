/**
 * FEDGE 2.O — Hero Intro Screen
 * "Your Credit Score is Your Superpower"
 * Animated number counter. Sets stakes. Creates emotional hook.
 * Inspired by: RPG opening cinematics, Duolingo "Let's start" energy
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
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@constants/theme';
import { OnboardingStackParamList } from '@navigation/OnboardingNavigator';

const { width, height } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'HeroIntro'>;
};

const STATS = [
  { label: 'Users Improved', value: '50,000+', icon: '👥' },
  { label: 'Avg Score Gain', value: '+87 pts', icon: '📈' },
  { label: 'Missions Completed', value: '2.1M', icon: '✅' },
];

export default function HeroIntroScreen({ navigation }: Props) {
  const [displayScore, setDisplayScore] = useState(300);
  const [phase, setPhase] = useState(0); // 0=counting, 1=showing stats, 2=cta

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const scoreOpacity = useRef(new Animated.Value(0)).current;
  const scoreScale = useRef(new Animated.Value(0.7)).current;
  const statsOpacity = useRef(new Animated.Value(0)).current;
  const ctaOpacity = useRef(new Animated.Value(0)).current;
  const ctaTranslateY = useRef(new Animated.Value(30)).current;
  const ringScale = useRef(new Animated.Value(0)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Phase 1: Header + score count up
    Animated.sequence([
      Animated.timing(headerOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(scoreOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(scoreScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
        Animated.spring(ringScale, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
        Animated.timing(ringOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    ]).start(() => {
      // Count up from 300 → 850
      let start = 300;
      const end = 850;
      const duration = 2000;
      const steps = 80;
      const increment = (end - start) / steps;
      const interval = duration / steps;

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setDisplayScore(end);
          clearInterval(timer);
          setPhase(1);

          // Show stats
          Animated.sequence([
            Animated.delay(300),
            Animated.timing(statsOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.delay(500),
            Animated.parallel([
              Animated.timing(ctaOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
              Animated.timing(ctaTranslateY, { toValue: 0, duration: 400, useNativeDriver: true }),
            ]),
          ]).start(() => setPhase(2));
        } else {
          setDisplayScore(Math.floor(start));
        }
      }, interval);

      return () => clearInterval(timer);
    });
  }, []);

  const scoreColor =
    displayScore >= 800 ? COLORS.scoreExceptional :
    displayScore >= 740 ? COLORS.scoreVeryGood :
    displayScore >= 670 ? COLORS.scoreGood :
    displayScore >= 580 ? COLORS.scoreFair :
    COLORS.scorePoor;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <Text style={styles.eyebrow}>YOUR CREDIT SCORE IS</Text>
        <Text style={styles.headline}>Your Superpower</Text>
        <Text style={styles.subheadline}>
          Master it and unlock a life of better rates,{'\n'}
          more opportunities, and real freedom.
        </Text>
      </Animated.View>

      {/* Score Ring */}
      <Animated.View
        style={[
          styles.scoreRingOuter,
          {
            opacity: ringOpacity,
            transform: [{ scale: ringScale }],
            borderColor: scoreColor,
            shadowColor: scoreColor,
          },
        ]}
      >
        <View style={[styles.scoreRingInner, { borderColor: scoreColor + '40' }]}>
          <Animated.View style={{ opacity: scoreOpacity, transform: [{ scale: scoreScale }] }}>
            <Text style={[styles.scoreNumber, { color: scoreColor }]}>{displayScore}</Text>
            <Text style={styles.scoreLabel}>CREDIT SCORE</Text>
          </Animated.View>
        </View>
      </Animated.View>

      {/* Social proof stats */}
      <Animated.View style={[styles.statsRow, { opacity: statsOpacity }]}>
        {STATS.map((stat, i) => (
          <View key={i} style={styles.statCard}>
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </Animated.View>

      {/* CTA */}
      <Animated.View
        style={[
          styles.ctaContainer,
          { opacity: ctaOpacity, transform: [{ translateY: ctaTranslateY }] },
        ]}
      >
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ChoosePath')}
        >
          <Text style={styles.ctaText}>Begin My Journey →</Text>
        </TouchableOpacity>
        <Text style={styles.ctaSubtext}>Free • No credit card required</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  eyebrow: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  headline: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: '900',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subheadline: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  scoreRingOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 12,
  },
  scoreRingInner: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgCard,
  },
  scoreNumber: {
    fontSize: FONTS.sizes.hero,
    fontWeight: '900',
    textAlign: 'center',
  },
  scoreLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  ctaContainer: {
    width: '100%',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: 'auto',
  },
  ctaButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
    ...SHADOWS.primary,
  },
  ctaText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
    color: COLORS.bg,
    letterSpacing: 0.5,
  },
  ctaSubtext: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
  },
});
