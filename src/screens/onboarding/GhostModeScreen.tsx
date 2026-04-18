/**
 * FEDGE 2.O — Ghost Mode Screen
 * Shown after HeroIntro. User chooses: Full Account vs. Ghost Mode.
 *
 * Ghost Mode:
 * - No personal info required
 * - Play with a randomized demo credit profile
 * - All game features unlocked (missions, simulator, leaderboard)
 * - Score is simulated — clearly labeled "DEMO SCORE"
 * - Can upgrade to real account anytime from Settings
 * - Ghost avatar + name generated automatically
 *
 * Hooks:
 * - Ghost mode gets a mystery name ("Shadow_7823") = fun/anonymous feel
 * - "Upgrade anytime" removes barrier to entry
 * - Full feature parity — ghost players still get addicted, then convert
 */

import React, { useRef, useEffect, useState } from 'react';
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
import { useGameStore } from '@store/gameStore';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'GhostMode'>;
};

// Generate a random ghost identity
const GHOST_ADJECTIVES = ['Shadow', 'Stealth', 'Phantom', 'Ghost', 'Cipher', 'Rogue', 'Specter'];
const GHOST_NOUNS = ['Trader', 'Builder', 'Hawk', 'Wolf', 'Rider', 'Agent', 'Force'];
function generateGhostName() {
  const adj = GHOST_ADJECTIVES[Math.floor(Math.random() * GHOST_ADJECTIVES.length)];
  const noun = GHOST_NOUNS[Math.floor(Math.random() * GHOST_NOUNS.length)];
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `${adj}_${noun}_${num}`;
}

const GHOST_DEMO_SCORES = [612, 634, 658, 671, 689, 702, 715];

const FULL_FEATURES = [
  { icon: '🏦', text: 'Real scores from Equifax, Experian & TransUnion' },
  { icon: '📈', text: 'Personalized tips based on your actual credit file' },
  { icon: '⚔️', text: 'File real disputes directly from the app' },
  { icon: '🏆', text: 'Compete on the national leaderboard with your real score' },
  { icon: '🔔', text: 'Alerts when your real score changes' },
];

const GHOST_FEATURES = [
  { icon: '👻', text: 'Zero personal info required — fully anonymous' },
  { icon: '🎮', text: 'All missions, lessons, and quizzes available' },
  { icon: '🔮', text: 'Credit simulator with demo data' },
  { icon: '📊', text: 'Demo credit score: clearly labeled as simulated' },
  { icon: '⬆️', text: 'Upgrade to full account anytime — no data lost' },
];

export default function GhostModeScreen({ navigation }: Props) {
  const setPlayerName = useGameStore((s) => s.setPlayerName);
  const addXP = useGameStore((s) => s.addXP);

  const [ghostName] = useState(generateGhostName);
  const [demoScore] = useState(
    GHOST_DEMO_SCORES[Math.floor(Math.random() * GHOST_DEMO_SCORES.length)]
  );

  const fadeIn = useRef(new Animated.Value(0)).current;
  const card1Slide = useRef(new Animated.Value(50)).current;
  const card2Slide = useRef(new Animated.Value(50)).current;
  const ghostBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.stagger(150, [
        Animated.spring(card1Slide, { toValue: 0, tension: 60, friction: 9, useNativeDriver: true }),
        Animated.spring(card2Slide, { toValue: 0, tension: 60, friction: 9, useNativeDriver: true }),
      ]),
    ]).start();

    // Ghost bounce loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(ghostBounce, { toValue: -8, duration: 700, useNativeDriver: true }),
        Animated.timing(ghostBounce, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleFullAccount = () => {
    navigation.navigate('ChoosePath');
  };

  const handleGhostMode = () => {
    setPlayerName(ghostName);
    addXP(50);
    navigation.navigate('ChoosePath');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <Animated.View style={[styles.inner, { opacity: fadeIn }]}>
        {/* Progress dots */}
        <View style={styles.progressRow}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.dot, i <= 1 && styles.dotActive]} />
          ))}
        </View>

        <Text style={styles.eyebrow}>STEP 2 OF 5</Text>
        <Text style={styles.headline}>How Do You Want to Play?</Text>
        <Text style={styles.subheadline}>
          Your choice. Full account for real data,{'\n'}or Ghost Mode to stay anonymous.
        </Text>

        {/* ── GHOST MODE CARD ─────────────────────── */}
        <Animated.View
          style={[styles.ghostCard, { transform: [{ translateY: card1Slide }] }]}
        >
          <View style={styles.ghostCardHeader}>
            <Animated.Text
              style={[styles.ghostEmoji, { transform: [{ translateY: ghostBounce }] }]}
            >
              👻
            </Animated.Text>
            <View style={styles.ghostBadge}>
              <Text style={styles.ghostBadgeText}>NO SIGN-UP</Text>
            </View>
          </View>

          <Text style={styles.ghostTitle}>Ghost Mode</Text>
          <Text style={styles.ghostSubtitle}>
            Play as{' '}
            <Text style={styles.ghostName}>{ghostName}</Text>
            {' '}with a demo score of{' '}
            <Text style={[styles.ghostScore, { color: COLORS.scoreGood }]}>{demoScore}</Text>
          </Text>

          <View style={styles.featureList}>
            {GHOST_FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>

          <View style={styles.ghostDemoTag}>
            <Text style={styles.ghostDemoTagText}>
              🔮 Demo score is NOT your real credit score
            </Text>
          </View>

          <TouchableOpacity
            style={styles.ghostBtn}
            onPress={handleGhostMode}
            activeOpacity={0.85}
          >
            <Text style={styles.ghostBtnText}>Play as Ghost →</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── DIVIDER ─────────────────────────────── */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* ── FULL ACCOUNT CARD ───────────────────── */}
        <Animated.View
          style={[styles.fullCard, { transform: [{ translateY: card2Slide }] }]}
        >
          <View style={styles.fullCardHeader}>
            <Text style={styles.fullEmoji}>⚡</Text>
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>RECOMMENDED</Text>
            </View>
          </View>

          <Text style={styles.fullTitle}>Full Account</Text>
          <Text style={styles.fullSubtitle}>Connect your real credit data for maximum impact</Text>

          <View style={styles.featureList}>
            {FULL_FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.fullBtn}
            onPress={handleFullAccount}
            activeOpacity={0.85}
          >
            <Text style={styles.fullBtnText}>Create Full Account →</Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.footerNote}>
          Ghost Mode players can upgrade anytime in Settings → Account.{'\n'}
          All progress and XP transfers over.
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  inner: { flex: 1, paddingHorizontal: SPACING.lg, paddingTop: 56, paddingBottom: 32 },
  progressRow: { flexDirection: 'row', gap: SPACING.xs, marginBottom: SPACING.lg },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.bgCardAlt },
  dotActive: { backgroundColor: COLORS.primary, width: 24 },
  eyebrow: { fontSize: FONTS.sizes.xs, color: COLORS.primary, letterSpacing: 3, marginBottom: SPACING.xs },
  headline: { fontSize: FONTS.sizes.xxl, fontWeight: '900', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  subheadline: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 20, marginBottom: SPACING.lg },

  // Ghost card
  ghostCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl,
    padding: SPACING.lg, borderWidth: 1.5, borderColor: COLORS.textMuted + '50',
    marginBottom: SPACING.md,
  },
  ghostCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  ghostEmoji: { fontSize: 40 },
  ghostBadge: {
    backgroundColor: COLORS.bgCardAlt, borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm, paddingVertical: 3,
    borderWidth: 1, borderColor: COLORS.border,
  },
  ghostBadgeText: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1 },
  ghostTitle: { fontSize: FONTS.sizes.xl, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 4 },
  ghostSubtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.md },
  ghostName: { color: COLORS.textPrimary, fontWeight: '800' },
  ghostScore: { fontWeight: '900' },
  featureList: { gap: SPACING.xs, marginBottom: SPACING.md },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  featureIcon: { fontSize: 14, width: 20 },
  featureText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, flex: 1, lineHeight: 19 },
  ghostDemoTag: {
    backgroundColor: COLORS.warning + '15', borderRadius: RADIUS.sm,
    padding: SPACING.sm, borderWidth: 1, borderColor: COLORS.warning + '30',
    marginBottom: SPACING.md,
  },
  ghostDemoTagText: { fontSize: FONTS.sizes.xs, color: COLORS.warning, textAlign: 'center' },
  ghostBtn: {
    backgroundColor: COLORS.bgCardAlt, borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md, alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.textMuted + '60',
  },
  ghostBtnText: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textSecondary },

  // Divider
  divider: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginVertical: SPACING.sm },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, fontWeight: '700' },

  // Full account card
  fullCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl,
    padding: SPACING.lg, borderWidth: 1.5, borderColor: COLORS.primary + '60',
    ...SHADOWS.primary,
  },
  fullCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  fullEmoji: { fontSize: 40 },
  recommendedBadge: {
    backgroundColor: COLORS.primary + '22', borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm, paddingVertical: 3,
    borderWidth: 1, borderColor: COLORS.primary + '50',
  },
  recommendedText: { fontSize: 10, fontWeight: '800', color: COLORS.primary, letterSpacing: 1 },
  fullTitle: { fontSize: FONTS.sizes.xl, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 4 },
  fullSubtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.md },
  fullBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md, alignItems: 'center', ...SHADOWS.primary,
  },
  fullBtnText: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.bg },
  footerNote: {
    fontSize: FONTS.sizes.xs, color: COLORS.textMuted,
    textAlign: 'center', marginTop: SPACING.md, lineHeight: 18,
  },
});
