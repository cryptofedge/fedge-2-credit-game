/**
 * FEDGE 2.O — Real-Life Scenario Screen
 * The most immersive screen in the app.
 *
 * Flow:
 * SETUP → CHOICE → CONSEQUENCE (score animates) → EXPLANATION → NEXT
 *
 * The user is dropped into a real credit situation, makes a decision,
 * and watches the LIVE score consequence play out on the animated gauge.
 *
 * This is the "real life simulation" — showing not just what the rules are,
 * but what it FEELS LIKE when they affect your life.
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
  Dimensions,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@constants/theme';
import { useGameStore } from '@store/gameStore';
import { XP } from '@constants/gameConfig';
import ScoreGauge from '@components/animations/ScoreGauge';
import ParticleBurst, { ParticleBurstRef } from '@components/animations/ParticleBurst';
import { SCENARIOS, Scenario, ScenarioChoice, getScenariosForChapter } from '@data/scenarios';

const { width, height } = Dimensions.get('window');

type Phase = 'setup' | 'choice' | 'consequence' | 'explanation' | 'complete';

// ─── Credit Card Visual ───────────────────────────────────
function CreditCardVisual({
  name, balance, limit, color,
  animateCharge,
}: {
  name: string;
  balance: number;
  limit: number;
  color: string;
  animateCharge?: boolean;
}) {
  const utilPct = (balance / limit) * 100;
  const fillAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(fillAnim, {
      toValue: utilPct / 100,
      tension: 40, friction: 8, useNativeDriver: false,
    }).start();

    if (animateCharge && utilPct > 70) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 4, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  }, [utilPct]);

  const fillColor = utilPct > 70 ? COLORS.danger : utilPct > 30 ? COLORS.warning : COLORS.success;
  const barWidth = fillAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <Animated.View style={[cardStyles.card, { borderColor: color + '60', transform: [{ translateX: shakeAnim }] }]}>
      {/* Card header */}
      <View style={cardStyles.header}>
        <Text style={cardStyles.cardName}>{name}</Text>
        <View style={[cardStyles.chip, { backgroundColor: color + '40' }]}>
          <Text style={{ fontSize: 14 }}>💳</Text>
        </View>
      </View>

      {/* Balance info */}
      <View style={cardStyles.balanceRow}>
        <View>
          <Text style={cardStyles.balanceLabel}>Balance</Text>
          <Text style={[cardStyles.balanceAmount, { color: fillColor }]}>
            ${balance.toLocaleString()}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={cardStyles.balanceLabel}>Limit</Text>
          <Text style={cardStyles.limitAmount}>${limit.toLocaleString()}</Text>
        </View>
      </View>

      {/* Utilization bar */}
      <View style={cardStyles.utilSection}>
        <View style={cardStyles.utilTrack}>
          <Animated.View style={[cardStyles.utilFill, { width: barWidth, backgroundColor: fillColor }]} />
        </View>
        <Text style={[cardStyles.utilPct, { color: fillColor }]}>{Math.round(utilPct)}% used</Text>
      </View>
    </Animated.View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1.5,
    marginVertical: SPACING.md,
    ...SHADOWS.card,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  cardName: { fontSize: FONTS.sizes.sm, fontWeight: '900', color: COLORS.textSecondary, letterSpacing: 1 },
  chip: { width: 36, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md },
  balanceLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginBottom: 2 },
  balanceAmount: { fontSize: FONTS.sizes.xxl, fontWeight: '900' },
  limitAmount: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.textSecondary },
  utilSection: { gap: SPACING.xs },
  utilTrack: { height: 8, backgroundColor: COLORS.bgCardAlt, borderRadius: RADIUS.pill, overflow: 'hidden' },
  utilFill: { height: '100%', borderRadius: RADIUS.pill },
  utilPct: { fontSize: FONTS.sizes.xs, fontWeight: '800', textAlign: 'right' },
});

// ─── Document Visual ─────────────────────────────────────
function DocumentVisual({ title, lines }: { title: string; lines: string[] }) {
  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[docStyles.doc, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={docStyles.docHeader}>
        <Text style={docStyles.docTitle}>{title}</Text>
        <View style={docStyles.docBadge}><Text style={docStyles.docBadgeText}>OFFICIAL</Text></View>
      </View>
      <View style={docStyles.divider} />
      {lines.map((line, i) => (
        <Text key={i} style={docStyles.docLine}>{line}</Text>
      ))}
    </Animated.View>
  );
}

const docStyles = StyleSheet.create({
  doc: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  docHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  docTitle: { fontSize: FONTS.sizes.sm, fontWeight: '900', color: COLORS.primary, letterSpacing: 1 },
  docBadge: {
    backgroundColor: COLORS.primary + '20', borderRadius: RADIUS.pill,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  docBadgeText: { fontSize: 9, fontWeight: '900', color: COLORS.primary, letterSpacing: 1 },
  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: SPACING.sm },
  docLine: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    fontFamily: 'Courier',
    lineHeight: 20,
    paddingVertical: 1,
  },
});

// ─── Main Screen ─────────────────────────────────────────
interface Props {
  navigation: any;
  route: {
    params: {
      chapterId?: string;
      scenarioId?: string;
    };
  };
}

export default function ScenarioScreen({ navigation, route }: Props) {
  const chapterId  = route?.params?.chapterId ?? 'mission_1_five_factors';
  const scenarioId = route?.params?.scenarioId;

  const addXP          = useGameStore((s) => s.addXP);
  const addFedgeCoins  = useGameStore((s) => s.addFedgeCoins);

  // Load scenarios for this chapter
  const scenarios = getScenariosForChapter(chapterId);
  const [scenarioIndex, setScenarioIndex] = useState(() => {
    if (scenarioId) {
      const idx = scenarios.findIndex((s) => s.id === scenarioId);
      return idx >= 0 ? idx : 0;
    }
    return 0;
  });

  const scenario = scenarios[scenarioIndex];
  const [phase, setPhase] = useState<Phase>('setup');
  const [selectedChoice, setSelectedChoice] = useState<ScenarioChoice | null>(null);
  const [currentScore, setCurrentScore] = useState(scenario?.startingScore ?? 680);
  const [newScore, setNewScore] = useState(scenario?.startingScore ?? 680);
  const [totalXP, setTotalXP] = useState(0);

  // Animations
  const fadeAnim      = useRef(new Animated.Value(0)).current;
  const slideAnim     = useRef(new Animated.Value(40)).current;
  const gaugeScale    = useRef(new Animated.Value(0.8)).current;
  const gaugeOpacity  = useRef(new Animated.Value(0)).current;
  const consequenceShake = useRef(new Animated.Value(0)).current;
  const correctGlow   = useRef(new Animated.Value(0)).current;

  const coinBurstRef  = useRef<ParticleBurstRef>(null);
  const xpBurstRef    = useRef<ParticleBurstRef>(null);

  useEffect(() => {
    animateIn();
  }, [scenarioIndex, phase]);

  const animateIn = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(40);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
    ]).start();
  };

  const handleChoice = (choice: ScenarioChoice) => {
    if (phase !== 'choice') return;
    setSelectedChoice(choice);
    setPhase('consequence');

    const target = (scenario.startingScore || 680) + choice.scoreChange;
    setNewScore(target);

    // Animate gauge in
    Animated.parallel([
      Animated.spring(gaugeScale, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.timing(gaugeOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    // If wrong — shake
    if (!choice.isCorrect) {
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(consequenceShake, { toValue: 16, duration: 70, useNativeDriver: true }),
          Animated.timing(consequenceShake, { toValue: -16, duration: 70, useNativeDriver: true }),
          Animated.timing(consequenceShake, { toValue: 10, duration: 70, useNativeDriver: true }),
          Animated.timing(consequenceShake, { toValue: -10, duration: 70, useNativeDriver: true }),
          Animated.timing(consequenceShake, { toValue: 0, duration: 70, useNativeDriver: true }),
        ]).start();
      }, 600);
    } else {
      // Correct — glow pulse + particles
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(correctGlow, { toValue: 1, duration: 600, useNativeDriver: false }),
            Animated.timing(correctGlow, { toValue: 0.3, duration: 600, useNativeDriver: false }),
          ]),
          { iterations: 3 }
        ).start();
        coinBurstRef.current?.trigger();
        xpBurstRef.current?.trigger();
      }, 800);
    }

    // Award XP
    addXP(choice.xpReward);
    setTotalXP((prev) => prev + choice.xpReward);
    if (choice.isCorrect) addFedgeCoins(10);
  };

  const handleNext = () => {
    if (phase === 'consequence') {
      setPhase('explanation');
      return;
    }
    if (phase === 'explanation') {
      if (scenarioIndex < scenarios.length - 1) {
        setCurrentScore(newScore);
        setSelectedChoice(null);
        gaugeScale.setValue(0.8);
        gaugeOpacity.setValue(0);
        correctGlow.setValue(0);
        setScenarioIndex(scenarioIndex + 1);
        setPhase('setup');
        setNewScore(scenarios[scenarioIndex + 1]?.startingScore ?? newScore);
      } else {
        setPhase('complete');
      }
      return;
    }
  };

  if (!scenario) {
    return (
      <View style={styles.container}>
        <Text style={{ color: COLORS.textPrimary, padding: 40 }}>No scenarios available.</Text>
      </View>
    );
  }

  const scoreChangeColor = selectedChoice
    ? selectedChoice.scoreChange > 0
      ? COLORS.success
      : selectedChoice.scoreChange < 0
      ? COLORS.danger
      : COLORS.textMuted
    : COLORS.textMuted;

  const correctGlowColor = correctGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.success + '00', COLORS.success + '30'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Particle systems */}
      <ParticleBurst ref={coinBurstRef} type="coins" count={14} originX={width / 2} originY={height * 0.45} />
      <ParticleBurst ref={xpBurstRef}  type="xp"    count={10} originX={width / 2} originY={height * 0.45} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── TOP BAR ──────────────────────── */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation?.goBack?.()}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.topMeta}>
            <Text style={styles.topLabel}>REAL LIFE SCENARIO</Text>
            <Text style={styles.topCounter}>{scenarioIndex + 1}/{scenarios.length}</Text>
          </View>
          <View style={styles.xpPill}>
            <Text style={styles.xpPillText}>+{totalXP} XP</Text>
          </View>
        </View>

        {/* ── SETUP / CHOICE PHASE ─────────── */}
        {(phase === 'setup' || phase === 'choice') && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            {/* Situation header */}
            <View style={styles.situationCard}>
              <Text style={styles.situationEmoji}>{scenario.situationEmoji}</Text>
              <Text style={styles.situationTitle}>{scenario.title}</Text>
              <Text style={styles.situationText}>{scenario.situation}</Text>
              <Text style={styles.contextText}>{scenario.context}</Text>
            </View>

            {/* Visual: credit card or document */}
            {scenario.creditCard && (
              <View style={styles.visualWrap}>
                <CreditCardVisual
                  name={scenario.creditCard.name}
                  balance={scenario.creditCard.balance}
                  limit={scenario.creditCard.limit}
                  color={scenario.creditCard.color}
                  animateCharge={phase === 'setup'}
                />
              </View>
            )}
            {scenario.document && (
              <View style={styles.visualWrap}>
                <DocumentVisual title={scenario.document.title} lines={scenario.document.lines} />
              </View>
            )}

            {/* Question */}
            <Text style={styles.question}>{scenario.question}</Text>

            {/* Choices */}
            {phase === 'choice' && (
              <View style={styles.choicesContainer}>
                {scenario.choices.map((choice, i) => (
                  <TouchableOpacity
                    key={choice.id}
                    style={styles.choiceBtn}
                    onPress={() => handleChoice(choice)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.choiceEmoji}>{choice.emoji}</Text>
                    <View style={styles.choiceText}>
                      <Text style={styles.choiceLabel}>{choice.label}</Text>
                      <Text style={styles.choiceSublabel}>{choice.sublabel}</Text>
                    </View>
                    <Text style={styles.choiceChevron}>→</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Start button (setup → choice) */}
            {phase === 'setup' && (
              <TouchableOpacity style={styles.startBtn} onPress={() => setPhase('choice')}>
                <Text style={styles.startBtnText}>What would you do? →</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}

        {/* ── CONSEQUENCE PHASE ────────────── */}
        {(phase === 'consequence' || phase === 'explanation') && selectedChoice && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            {/* Gauge */}
            <Animated.View style={[
              styles.gaugeWrap,
              {
                transform: [{ scale: gaugeScale }],
                opacity: gaugeOpacity,
              },
            ]}>
              <ScoreGauge
                score={phase === 'consequence' ? newScore : newScore}
                previousScore={scenario.startingScore}
                autoAnimate={true}
                showDelta={true}
              />
            </Animated.View>

            {/* Consequence badge */}
            <Animated.View style={[
              styles.consequenceBadge,
              {
                borderColor: scoreChangeColor + '60',
                backgroundColor: scoreChangeColor + '12',
                transform: [{ translateX: consequenceShake }],
              }
            ]}>
              <Text style={styles.consequenceChoiceLabel}>
                {selectedChoice.emoji} {selectedChoice.label}
              </Text>
              <Text style={[styles.consequenceResult, { color: scoreChangeColor }]}>
                {selectedChoice.consequence}
              </Text>
              {selectedChoice.isCorrect && (
                <View style={styles.correctBadge}>
                  <Text style={styles.correctBadgeText}>✓ Best Move  +{selectedChoice.xpReward} XP</Text>
                </View>
              )}
            </Animated.View>

            {phase === 'consequence' && (
              <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                <Text style={styles.nextBtnText}>Why did this happen? →</Text>
              </TouchableOpacity>
            )}

            {/* Explanation */}
            {phase === 'explanation' && (
              <Animated.View style={[styles.explanationCard, { opacity: fadeAnim }]}>
                <Text style={styles.explanationTitle}>
                  {selectedChoice.isCorrect ? '✅ Smart Move' : '📚 Here\'s Why'}
                </Text>
                <Text style={styles.explanationText}>{selectedChoice.explanation}</Text>

                {/* Lesson principle */}
                <View style={styles.lessonCard}>
                  <Text style={styles.lessonIcon}>{scenario.lessonIcon}</Text>
                  <Text style={styles.lessonText}>{scenario.lesson}</Text>
                </View>

                <TouchableOpacity
                  style={[styles.nextBtn, { backgroundColor: selectedChoice.isCorrect ? COLORS.success : COLORS.primary }]}
                  onPress={handleNext}
                >
                  <Text style={styles.nextBtnText}>
                    {scenarioIndex < scenarios.length - 1 ? `Next Scenario →` : 'See Summary →'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </Animated.View>
        )}

        {/* ── COMPLETE ─────────────────────── */}
        {phase === 'complete' && (
          <Animated.View style={[styles.completeCard, { opacity: fadeAnim }]}>
            <Text style={styles.completeEmoji}>🎓</Text>
            <Text style={styles.completeTitle}>Real-World Ready!</Text>
            <Text style={styles.completeDesc}>
              You just lived through {scenarios.length} real credit scenarios. This knowledge alone puts you ahead of 90% of people.
            </Text>

            <View style={styles.completeRewards}>
              <View style={styles.completeRewardItem}>
                <Text style={[styles.completeRewardValue, { color: COLORS.primary }]}>+{totalXP}</Text>
                <Text style={styles.completeRewardLabel}>XP Earned</Text>
              </View>
              <View style={styles.completeDivider} />
              <View style={styles.completeRewardItem}>
                <Text style={[styles.completeRewardValue, { color: COLORS.secondary }]}>{scenarios.length}</Text>
                <Text style={styles.completeRewardLabel}>Scenarios</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.doneBtn} onPress={() => navigation?.goBack?.()}>
              <Text style={styles.doneBtnText}>Back to Missions →</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingBottom: 60 },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: 52, paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.bgCard,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  closeBtnText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '700' },
  topMeta: { flex: 1 },
  topLabel: { fontSize: FONTS.sizes.xs, color: COLORS.accent, fontWeight: '800', letterSpacing: 2 },
  topCounter: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, fontWeight: '700' },
  xpPill: {
    backgroundColor: COLORS.secondary + '20',
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm, paddingVertical: 3,
    borderWidth: 1, borderColor: COLORS.secondary + '40',
  },
  xpPillText: { fontSize: FONTS.sizes.xs, fontWeight: '800', color: COLORS.secondary },

  // Situation card
  situationCard: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  situationEmoji: { fontSize: 48, marginBottom: SPACING.sm },
  situationTitle: { fontSize: FONTS.sizes.xxl, fontWeight: '900', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  situationText: { fontSize: FONTS.sizes.md, color: COLORS.primary, fontWeight: '700', marginBottom: SPACING.sm },
  contextText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 22 },

  visualWrap: { paddingHorizontal: SPACING.lg },

  // Question
  question: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '900',
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    lineHeight: 28,
  },

  // Choices
  choicesContainer: { paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  choiceBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1.5, borderColor: COLORS.border,
    gap: SPACING.md,
  },
  choiceEmoji: { fontSize: 28, width: 36, textAlign: 'center' },
  choiceText: { flex: 1 },
  choiceLabel: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textPrimary },
  choiceSublabel: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 3 },
  choiceChevron: { fontSize: 18, color: COLORS.textMuted },

  // Start button
  startBtn: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
    ...SHADOWS.primary,
  },
  startBtnText: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.bg },

  // Gauge
  gaugeWrap: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },

  // Consequence
  consequenceBadge: {
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1.5,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  consequenceChoiceLabel: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textPrimary },
  consequenceResult: { fontSize: FONTS.sizes.xl, fontWeight: '900' },
  correctBadge: {
    backgroundColor: COLORS.success + '20',
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md, paddingVertical: 4,
    alignSelf: 'flex-start',
    borderWidth: 1, borderColor: COLORS.success + '40',
  },
  correctBadgeText: { fontSize: FONTS.sizes.xs, fontWeight: '900', color: COLORS.success },

  // Next button
  nextBtn: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
    ...SHADOWS.primary,
  },
  nextBtnText: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.bg },

  // Explanation
  explanationCard: {
    marginHorizontal: SPACING.lg,
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  explanationTitle: { fontSize: FONTS.sizes.xl, fontWeight: '900', color: COLORS.textPrimary },
  explanationText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    lineHeight: 26,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  lessonCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: COLORS.accent + '12',
    borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.accent + '40',
    gap: SPACING.sm,
  },
  lessonIcon: { fontSize: 24 },
  lessonText: { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.accent, fontWeight: '700', lineHeight: 20 },

  // Complete
  completeCard: {
    margin: SPACING.lg,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.secondary + '40',
    ...SHADOWS.gold,
    gap: SPACING.md,
  },
  completeEmoji: { fontSize: 72 },
  completeTitle: { fontSize: FONTS.sizes.xxl, fontWeight: '900', color: COLORS.textPrimary },
  completeDesc: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  completeRewards: {
    flexDirection: 'row', justifyContent: 'space-around',
    width: '100%',
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: RADIUS.lg, padding: SPACING.lg,
  },
  completeRewardItem: { alignItems: 'center' },
  completeRewardValue: { fontSize: FONTS.sizes.xxl, fontWeight: '900' },
  completeRewardLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  completeDivider: { width: 1, backgroundColor: COLORS.border },
  doneBtn: {
    width: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
  },
  doneBtnText: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.bg },
});
