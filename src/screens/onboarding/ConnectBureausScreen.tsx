/**
 * FEDGE 2.O — Connect Bureaus Screen
 * "Unlock the 3 Credit Vaults"
 * THE most important onboarding screen. Real data = real engagement.
 *
 * Addictive hooks:
 * - Each bureau = a "vault" with a lock animation
 * - XP burst (+150) on each connection
 * - Progress bar charges up — near completion = compulsion to finish
 * - "All 3 = JACKPOT" messaging builds anticipation
 * - Each connected vault plays a satisfying unlock animation
 *
 * Inspired by: Pokemon gym badges, Clash of Clans troop unlocks
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  StatusBar,
  ScrollView,
  Linking,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@constants/theme';
import { BUREAUS, XP, FEDGE_COINS } from '@constants/gameConfig';
import { useGameStore } from '@store/gameStore';
import { OnboardingStackParamList } from '@navigation/OnboardingNavigator';
import { BureauId, exchangeCodeForToken, fetchCreditReport } from '@services/creditBureauService';

const { width, height } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'ConnectBureaus'>;
};

interface BureauState {
  connected: boolean;
  connecting: boolean;
  score?: number;
}

export default function ConnectBureausScreen({ navigation }: Props) {
  const addXP = useGameStore((s) => s.addXP);
  const addFedgeCoins = useGameStore((s) => s.addFedgeCoins);

  const [bureauStates, setBureauStates] = useState<Record<string, BureauState>>({
    equifax: { connected: false, connecting: false },
    experian: { connected: false, connecting: false },
    transunion: { connected: false, connecting: false },
  });

  const [showXPBurst, setShowXPBurst] = useState<string | null>(null);
  const [showJackpot, setShowJackpot] = useState(false);

  const connectedCount = Object.values(bureauStates).filter((b) => b.connected).length;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const jackpotScale = useRef(new Animated.Value(0)).current;
  const jackpotOpacity = useRef(new Animated.Value(0)).current;

  // Per-bureau animations
  const bureauAnims = BUREAUS.reduce((acc, b) => ({
    ...acc,
    [b.id]: {
      scale: useRef(new Animated.Value(1)).current,
      lockScale: useRef(new Animated.Value(1)).current,
      checkOpacity: useRef(new Animated.Value(0)).current,
      glowOpacity: useRef(new Animated.Value(0)).current,
      xpBurstOpacity: useRef(new Animated.Value(0)).current,
      xpBurstTranslateY: useRef(new Animated.Value(0)).current,
    },
  }), {} as Record<string, {
    scale: Animated.Value;
    lockScale: Animated.Value;
    checkOpacity: Animated.Value;
    glowOpacity: Animated.Value;
    xpBurstOpacity: Animated.Value;
    xpBurstTranslateY: Animated.Value;
  }>);

  useEffect(() => {
    Animated.timing(headerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  // Update progress bar when bureaus connect
  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: connectedCount / 3,
      tension: 60,
      friction: 10,
      useNativeDriver: false,
    }).start();

    if (connectedCount === 3) {
      setTimeout(() => triggerJackpot(), 600);
    }
  }, [connectedCount]);

  const handleConnect = async (bureauId: string) => {
    setBureauStates((prev) => ({
      ...prev,
      [bureauId]: { ...prev[bureauId], connecting: true },
    }));

    // Pulse animation while connecting
    const anim = bureauAnims[bureauId];
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim.scale, { toValue: 0.97, duration: 500, useNativeDriver: true }),
        Animated.timing(anim.scale, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      { iterations: 6 }
    ).start();

    try {
      // In MOCK_MODE this simulates the OAuth flow
      // In production: open WebView to bureau OAuth URL, capture code
      const token = await exchangeCodeForToken(bureauId as BureauId, 'mock_code');
      const report = await fetchCreditReport(bureauId as BureauId, token.accessToken);

      setBureauStates((prev) => ({
        ...prev,
        [bureauId]: { connected: true, connecting: false, score: report.score },
      }));

      // ✅ Unlock animation sequence
      Animated.sequence([
        // Lock spins out
        Animated.timing(anim.lockScale, { toValue: 0, duration: 200, useNativeDriver: true }),
        // Check fades in
        Animated.timing(anim.checkOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        // Glow pulses
        Animated.timing(anim.glowOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      // XP burst
      Animated.sequence([
        Animated.timing(anim.xpBurstOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(anim.xpBurstTranslateY, { toValue: -60, duration: 800, useNativeDriver: true }),
        Animated.timing(anim.xpBurstOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();

      // Award XP & coins
      addXP(XP.CONNECT_BUREAU);
      addFedgeCoins(FEDGE_COINS.CONNECT_BUREAU);

    } catch (err) {
      setBureauStates((prev) => ({
        ...prev,
        [bureauId]: { ...prev[bureauId], connecting: false },
      }));
    }
  };

  const triggerJackpot = () => {
    setShowJackpot(true);
    addXP(XP.ALL_BUREAUS);
    addFedgeCoins(FEDGE_COINS.ALL_BUREAUS);
    Animated.sequence([
      Animated.parallel([
        Animated.spring(jackpotScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
        Animated.timing(jackpotOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
    ]).start();
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Progress dots */}
        <View style={styles.progressDotsRow}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.dot, i <= 2 && styles.dotActive]} />
          ))}
        </View>

        {/* Header */}
        <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
          <Text style={styles.eyebrow}>STEP 3 OF 5</Text>
          <Text style={styles.headline}>Unlock the 3 Credit Vaults</Text>
          <Text style={styles.subheadline}>
            Connect your real credit data from all 3 bureaus.{'\n'}
            See your actual scores — no guessing.
          </Text>
        </Animated.View>

        {/* Progress bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Vaults Unlocked</Text>
            <Text style={styles.progressCount}>
              <Text style={{ color: COLORS.primary, fontWeight: '800' }}>{connectedCount}</Text>
              {' / 3'}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressWidth,
                  backgroundColor:
                    connectedCount === 3 ? COLORS.secondary : COLORS.primary,
                },
              ]}
            />
          </View>
          {connectedCount < 3 && (
            <Text style={styles.progressHint}>
              {connectedCount === 0
                ? '🔒 Unlock all 3 for +500 XP JACKPOT'
                : connectedCount === 1
                ? '🔥 Almost there! +2 more for 500 XP'
                : '⚡️ One more vault! 500 XP is waiting!'}
            </Text>
          )}
          {connectedCount === 3 && (
            <Text style={[styles.progressHint, { color: COLORS.secondary }]}>
              🏆 All vaults unlocked! +500 XP JACKPOT claimed!
            </Text>
          )}
        </View>

        {/* Bureau Cards */}
        <View style={styles.bureausContainer}>
          {BUREAUS.map((bureau) => {
            const state = bureauStates[bureau.id];
            const anim = bureauAnims[bureau.id];

            return (
              <Animated.View
                key={bureau.id}
                style={[styles.bureauCard, { transform: [{ scale: anim.scale }] }]}
              >
                {/* Glow effect when connected */}
                <Animated.View
                  style={[
                    styles.bureauGlow,
                    {
                      backgroundColor: bureau.glowColor,
                      opacity: anim.glowOpacity,
                    },
                  ]}
                />

                <View style={styles.bureauCardInner}>
                  {/* Left: Bureau info */}
                  <View style={styles.bureauLeft}>
                    <View style={[styles.bureauIconBg, { backgroundColor: bureau.color + '22' }]}>
                      <Text style={styles.bureauIcon}>{bureau.icon}</Text>
                    </View>
                    <View>
                      <Text style={[styles.bureauTagline, { color: bureau.color }]}>
                        {bureau.tagline}
                      </Text>
                      <Text style={styles.bureauName}>{bureau.name}</Text>
                      {state.connected && state.score && (
                        <Text style={[styles.bureauScore, { color: bureau.color }]}>
                          Score: {state.score}
                        </Text>
                      )}
                      {!state.connected && (
                        <Text style={styles.bureauDesc} numberOfLines={1}>
                          {bureau.description}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Right: Status / Button */}
                  <View style={styles.bureauRight}>
                    {state.connected ? (
                      <Animated.View
                        style={[styles.connectedBadge, { opacity: anim.checkOpacity }]}
                      >
                        <Text style={styles.connectedCheck}>✓</Text>
                      </Animated.View>
                    ) : (
                      <TouchableOpacity
                        style={[
                          styles.connectButton,
                          { borderColor: bureau.color },
                          state.connecting && styles.connectButtonLoading,
                        ]}
                        onPress={() => handleConnect(bureau.id)}
                        disabled={state.connecting}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.connectButtonText, { color: bureau.color }]}>
                          {state.connecting ? '...' : 'Connect'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* XP Burst */}
                <Animated.View
                  style={[
                    styles.xpBurst,
                    {
                      opacity: anim.xpBurstOpacity,
                      transform: [{ translateY: anim.xpBurstTranslateY }],
                    },
                  ]}
                >
                  <Text style={styles.xpBurstText}>+150 XP</Text>
                </Animated.View>
              </Animated.View>
            );
          })}
        </View>

        {/* What you get info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🔒 Your data is secure</Text>
          <Text style={styles.infoText}>
            FEDGE 2.O uses read-only access. We never store passwords and cannot make changes to your accounts.
            Data is encrypted end-to-end.
          </Text>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[
            styles.ctaButton,
            connectedCount === 0 && styles.ctaSkip,
          ]}
          onPress={() => navigation.navigate('ScoreReveal')}
          activeOpacity={0.85}
        >
          <Text style={[styles.ctaText, connectedCount === 0 && { color: COLORS.textMuted }]}>
            {connectedCount === 3
              ? 'Reveal My Scores →'
              : connectedCount > 0
              ? `Continue with ${connectedCount} Bureau${connectedCount > 1 ? 's' : ''} →`
              : 'Skip for now →'}
          </Text>
        </TouchableOpacity>
        {connectedCount === 0 && (
          <Text style={styles.skipNote}>You can connect bureaus later in Settings</Text>
        )}
      </ScrollView>

      {/* Jackpot Modal */}
      {showJackpot && (
        <Animated.View
          style={[
            styles.jackpotOverlay,
            { opacity: jackpotOpacity },
          ]}
        >
          <Animated.View
            style={[styles.jackpotCard, { transform: [{ scale: jackpotScale }] }]}
          >
            <Text style={styles.jackpotEmoji}>🏆</Text>
            <Text style={styles.jackpotTitle}>JACKPOT!</Text>
            <Text style={styles.jackpotSubtitle}>All 3 vaults unlocked</Text>
            <Text style={styles.jackpotXP}>+500 XP</Text>
            <Text style={styles.jackpotCoins}>+200 FEDGE Coins</Text>
            <TouchableOpacity
              style={styles.jackpotButton}
              onPress={() => {
                setShowJackpot(false);
                navigation.navigate('ScoreReveal');
              }}
            >
              <Text style={styles.jackpotButtonText}>Reveal My Scores →</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: SPACING.lg, paddingTop: 56, paddingBottom: 48 },
  progressDotsRow: { flexDirection: 'row', gap: SPACING.xs, marginBottom: SPACING.xl },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.bgCardAlt },
  dotActive: { backgroundColor: COLORS.primary, width: 24 },
  header: { marginBottom: SPACING.xl },
  eyebrow: { fontSize: FONTS.sizes.xs, color: COLORS.primary, letterSpacing: 3, marginBottom: SPACING.sm },
  headline: { fontSize: FONTS.sizes.xxl, fontWeight: '900', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  subheadline: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, lineHeight: 22 },
  progressSection: { marginBottom: SPACING.xl },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  progressLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  progressCount: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  progressBar: {
    height: 10,
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressFill: { height: '100%', borderRadius: RADIUS.pill },
  progressHint: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted },
  bureausContainer: { gap: SPACING.md, marginBottom: SPACING.xl },
  bureauCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  bureauGlow: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: RADIUS.lg,
  },
  bureauCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  bureauLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  bureauIconBg: {
    width: 48, height: 48, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  bureauIcon: { fontSize: 24 },
  bureauTagline: { fontSize: FONTS.sizes.xs, letterSpacing: 1, fontWeight: '700' },
  bureauName: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.textPrimary },
  bureauScore: { fontSize: FONTS.sizes.md, fontWeight: '700', marginTop: 2 },
  bureauDesc: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2, maxWidth: 180 },
  bureauRight: { marginLeft: SPACING.sm },
  connectButton: {
    borderWidth: 1.5,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  connectButtonLoading: { opacity: 0.6 },
  connectButtonText: { fontSize: FONTS.sizes.sm, fontWeight: '700' },
  connectedBadge: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.success,
    alignItems: 'center', justifyContent: 'center',
  },
  connectedCheck: { fontSize: 18, color: COLORS.bg, fontWeight: '900' },
  xpBurst: {
    position: 'absolute',
    right: 16,
    top: '50%',
    backgroundColor: COLORS.secondary,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  xpBurstText: { fontSize: FONTS.sizes.sm, fontWeight: '800', color: COLORS.bg },
  infoCard: {
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
  },
  infoTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  infoText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, lineHeight: 20 },
  ctaButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.primary,
  },
  ctaSkip: { backgroundColor: COLORS.bgCardAlt, shadowOpacity: 0, elevation: 0 },
  ctaText: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.bg },
  skipNote: { textAlign: 'center', fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  jackpotOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6,6,15,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  jackpotCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.xxl,
    alignItems: 'center',
    width: width * 0.85,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    ...SHADOWS.gold,
  },
  jackpotEmoji: { fontSize: 64, marginBottom: SPACING.md },
  jackpotTitle: {
    fontSize: FONTS.sizes.hero,
    fontWeight: '900',
    color: COLORS.secondary,
    letterSpacing: 4,
  },
  jackpotSubtitle: { fontSize: FONTS.sizes.lg, color: COLORS.textSecondary, marginBottom: SPACING.md },
  jackpotXP: { fontSize: FONTS.sizes.xxl, fontWeight: '900', color: COLORS.primary },
  jackpotCoins: { fontSize: FONTS.sizes.lg, color: COLORS.secondary, marginBottom: SPACING.xl },
  jackpotButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  jackpotButtonText: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.bg },
});
