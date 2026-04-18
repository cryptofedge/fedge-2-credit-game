/**
 * FEDGE 2.O — Credit Simulator Screen
 * "What if I do X? How many points do I gain?"
 *
 * Most addictive screen in the app. Every drag of a slider = instant dopamine.
 * Inspired by: Robinhood portfolio sliders, NerdWallet score simulator
 *
 * Features:
 * 1. Live Score Ring — animates in real-time as user tweaks sliders
 * 2. Quick Scenarios — one-tap presets: "Pay off card", "Miss a payment", etc.
 * 3. Custom Sliders — utilization, payment history, new inquiries, age, mix
 * 4. Impact Breakdown — bar chart showing each factor's contribution
 * 5. Delta Badge — "+42 pts" / "-18 pts" always visible
 * 6. Save to Plan — lock in a scenario as a real mission
 * 7. Share — screenshot your simulated score improvement
 *
 * Addictive hooks:
 * - Score ring pulses on every point change
 * - Near-miss: "You're 8 pts from GOOD tier — here's how"
 * - "+XP for simulating" — rewards exploration
 * - Preset scenarios unlock one at a time (curiosity gap)
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Switch,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@constants/theme';
import { calculateCreditScore, getScoreTier, CreditProfile } from '@utils/creditScore';
import { useGameStore } from '@store/gameStore';
import { XP } from '@constants/gameConfig';

const { width } = Dimensions.get('window');

// ─────────────────────────────────────────────
// Scenario presets
// ─────────────────────────────────────────────
interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  changes: Partial<CreditProfile>;
  tip: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'pay_down',
    title: 'Pay Down Cards to 10%',
    subtitle: 'Fastest score boost',
    icon: '💳',
    color: COLORS.success,
    changes: { creditUtilization: 10 },
    tip: 'Getting utilization below 10% is the single fastest way to add points. Under 30% is good — under 10% is elite.',
  },
  {
    id: 'miss_payment',
    title: 'Miss a Payment',
    subtitle: 'See the real damage',
    icon: '⚠️',
    color: COLORS.danger,
    changes: { paymentHistory: 20 },
    tip: 'A single missed payment can drop your score 60–110 points and stays on your report for 7 years. Always pay at least the minimum.',
  },
  {
    id: 'open_card',
    title: 'Open a New Credit Card',
    subtitle: 'Short-term dip, long-term gain',
    icon: '💎',
    color: COLORS.primary,
    changes: { newCredit: 30, creditUtilization: 15 },
    tip: 'Opening a new card drops your average age and adds an inquiry, but increases your total limit — lowering utilization long-term.',
  },
  {
    id: 'close_card',
    title: 'Close an Old Card',
    subtitle: 'More harmful than you think',
    icon: '✂️',
    color: COLORS.warning,
    changes: { creditAge: 18, creditUtilization: 55 },
    tip: 'Closing a card eliminates its credit limit (raises utilization) and may shorten your credit history. Keep old cards open.',
  },
  {
    id: 'authorized_user',
    title: 'Become Authorized User',
    subtitle: 'Piggyback on good credit',
    icon: '🤝',
    color: COLORS.accent,
    changes: { creditAge: 72, creditMix: 80 },
    tip: 'Being added as an authorized user on someone with great credit can instantly add years of positive history to your report.',
  },
  {
    id: 'dispute_error',
    title: 'Remove a Collection',
    subtitle: 'Dispute & delete strategy',
    icon: '⚔️',
    color: '#FF6B35',
    changes: { paymentHistory: 95 },
    tip: 'Removing a collection or late payment through a dispute or pay-for-delete can add 50–100+ points instantly.',
  },
  {
    id: 'pay_loan',
    title: 'Pay Off an Installment Loan',
    subtitle: 'Improves mix & history',
    icon: '🏦',
    color: COLORS.scoreVeryGood,
    changes: { creditMix: 90, paymentHistory: 100 },
    tip: 'Paying off a student loan or auto loan improves your credit mix and shows lenders you handle multiple credit types responsibly.',
  },
  {
    id: 'hard_inquiry',
    title: '5 Hard Inquiries',
    subtitle: 'Rate shopping risk',
    icon: '🔍',
    color: COLORS.scoreFair,
    changes: { newCredit: 20 },
    tip: 'Multiple hard inquiries in a short window signal desperation to lenders. Rate shop within 14–45 days so bureaus count them as one.',
  },
];

// ─────────────────────────────────────────────
// Slider component
// ─────────────────────────────────────────────
interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  color: string;
  format: (v: number) => string;
  onChange: (v: number) => void;
}

function CreditSlider({ label, value, min, max, step, color, format, onChange }: SliderProps) {
  const fillWidth = ((value - min) / (max - min)) * (width - SPACING.lg * 2 - 32);
  const thumbAnim = useRef(new Animated.Value(fillWidth)).current;

  useEffect(() => {
    Animated.spring(thumbAnim, { toValue: fillWidth, tension: 100, friction: 12, useNativeDriver: false }).start();
  }, [fillWidth]);

  const steps = Math.round((max - min) / step);

  return (
    <View style={sliderStyles.container}>
      <View style={sliderStyles.header}>
        <Text style={sliderStyles.label}>{label}</Text>
        <Text style={[sliderStyles.value, { color }]}>{format(value)}</Text>
      </View>
      <View style={sliderStyles.track}>
        <Animated.View style={[sliderStyles.fill, { width: thumbAnim, backgroundColor: color }]} />
        <Animated.View style={[sliderStyles.thumb, { left: thumbAnim, borderColor: color }]} />
      </View>
      {/* Step buttons */}
      <View style={sliderStyles.buttons}>
        <TouchableOpacity
          style={sliderStyles.btn}
          onPress={() => onChange(Math.max(min, value - step))}
        >
          <Text style={sliderStyles.btnText}>−</Text>
        </TouchableOpacity>
        <View style={sliderStyles.stepsRow}>
          {Array.from({ length: Math.min(steps + 1, 6) }, (_, i) => {
            const v = min + (i / Math.min(steps, 5)) * (max - min);
            const active = Math.abs(v - value) < step / 2;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => onChange(Math.round(v / step) * step)}
                style={[sliderStyles.stepDot, active && { backgroundColor: color }]}
              />
            );
          })}
        </View>
        <TouchableOpacity
          style={sliderStyles.btn}
          onPress={() => onChange(Math.min(max, value + step))}
        >
          <Text style={sliderStyles.btnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  container: { marginBottom: SPACING.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  label: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: '600' },
  value: { fontSize: FONTS.sizes.sm, fontWeight: '900' },
  track: {
    height: 8, backgroundColor: COLORS.bgCardAlt,
    borderRadius: RADIUS.pill, marginBottom: SPACING.sm,
    position: 'relative', overflow: 'visible',
  },
  fill: { height: '100%', borderRadius: RADIUS.pill, position: 'absolute', top: 0, left: 0 },
  thumb: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: COLORS.bgCard, borderWidth: 3,
    position: 'absolute', top: -6, marginLeft: -10,
    ...SHADOWS.card,
  },
  buttons: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  btn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.bgCardAlt, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  btnText: { fontSize: 18, color: COLORS.textPrimary, fontWeight: '700', lineHeight: 22 },
  stepsRow: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.bgCardAlt },
});

// ─────────────────────────────────────────────
// Main Simulator Screen
// ─────────────────────────────────────────────
const BASE_PROFILE: CreditProfile = {
  paymentHistory: 95,
  creditUtilization: 31,
  creditAge: 48,
  creditMix: 60,
  newCredit: 70,
};

export default function SimulatorScreen() {
  const addXP = useGameStore((s) => s.addXP);
  const isGhostMode = useGameStore((s) => s.isGhostMode);

  const [profile, setProfile] = useState<CreditProfile>(BASE_PROFILE);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [hasSimulated, setHasSimulated] = useState(false);
  const [showSliders, setShowSliders] = useState(false);
  const [savedScenarios, setSavedScenarios] = useState<string[]>([]);

  const baseScore = calculateCreditScore(BASE_PROFILE);
  const currentScore = calculateCreditScore(profile);
  const delta = currentScore - baseScore;

  const baseTier = getScoreTier(baseScore);
  const currentTier = getScoreTier(currentScore);
  const tierColor = currentTier?.color ?? COLORS.primary;

  // Animations
  const scoreScale = useRef(new Animated.Value(1)).current;
  const deltaOpacity = useRef(new Animated.Value(0)).current;
  const deltaTranslateY = useRef(new Animated.Value(0)).current;
  const ringColor = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  // Pulse score ring on every change
  const prevScore = useRef(currentScore);
  useEffect(() => {
    if (currentScore !== prevScore.current) {
      prevScore.current = currentScore;
      Animated.sequence([
        Animated.timing(scoreScale, { toValue: 1.08, duration: 120, useNativeDriver: true }),
        Animated.spring(scoreScale, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
      ]).start();

      // Delta float-up animation
      deltaTranslateY.setValue(0);
      deltaOpacity.setValue(1);
      Animated.parallel([
        Animated.timing(deltaTranslateY, { toValue: -30, duration: 800, useNativeDriver: true }),
        Animated.timing(deltaOpacity, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]).start();

      if (!hasSimulated) {
        setHasSimulated(true);
        addXP(XP.SIMULATE_ACTION);
      }
    }
  }, [currentScore]);

  const applyScenario = (scenario: Scenario) => {
    if (activeScenario === scenario.id) {
      // Deselect — reset to base
      setProfile(BASE_PROFILE);
      setActiveScenario(null);
    } else {
      const newProfile = { ...BASE_PROFILE, ...scenario.changes };
      setProfile(newProfile);
      setActiveScenario(scenario.id);
      addXP(XP.SIMULATE_ACTION);
    }
  };

  const updateSlider = useCallback((key: keyof CreditProfile, value: number) => {
    setActiveScenario(null);
    setProfile((p) => ({ ...p, [key]: value }));
  }, []);

  const resetAll = () => {
    setProfile(BASE_PROFILE);
    setActiveScenario(null);
  };

  const saveScenario = (id: string) => {
    setSavedScenarios((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
    addXP(25);
  };

  const activeScenarioData = SCENARIOS.find((s) => s.id === activeScenario);

  // Factor bars data
  const factors = [
    { label: 'Payment History', key: 'paymentHistory' as keyof CreditProfile, weight: 35, color: COLORS.success },
    { label: 'Utilization', key: 'creditUtilization' as keyof CreditProfile, weight: 30, color: COLORS.primary, invert: true },
    { label: 'Credit Age', key: 'creditAge' as keyof CreditProfile, weight: 15, color: COLORS.accent, maxVal: 120 },
    { label: 'Credit Mix', key: 'creditMix' as keyof CreditProfile, weight: 10, color: COLORS.secondary },
    { label: 'New Credit', key: 'newCredit' as keyof CreditProfile, weight: 10, color: COLORS.warning },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── HEADER ───────────────────────────── */}
        <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
          <Text style={styles.headline}>Credit Simulator</Text>
          <Text style={styles.subheadline}>
            Drag sliders or tap scenarios to see your score change live.
          </Text>
        </Animated.View>

        {/* ── SCORE RING ───────────────────────── */}
        <View style={styles.scoreSection}>
          {/* Base score */}
          <View style={styles.scoreCompare}>
            <View style={styles.scoreCompareItem}>
              <Text style={styles.compareLabel}>Current</Text>
              <Text style={[styles.compareScore, { color: baseTier?.color }]}>{baseScore}</Text>
              <Text style={[styles.compareTier, { color: baseTier?.color }]}>{baseTier?.label}</Text>
            </View>

            {/* Arrow */}
            <View style={styles.arrowContainer}>
              <Text style={[
                styles.deltaArrow,
                { color: delta > 0 ? COLORS.success : delta < 0 ? COLORS.danger : COLORS.textMuted }
              ]}>
                {delta > 0 ? '→' : delta < 0 ? '→' : '→'}
              </Text>
            </View>

            {/* Simulated score */}
            <View style={styles.scoreCompareItem}>
              <Text style={styles.compareLabel}>Simulated</Text>
              <Animated.View style={{ transform: [{ scale: scoreScale }] }}>
                <Text style={[styles.compareScoreLarge, { color: tierColor }]}>{currentScore}</Text>
              </Animated.View>
              <Text style={[styles.compareTier, { color: tierColor }]}>{currentTier?.label}</Text>
            </View>
          </View>

          {/* Delta badge */}
          <View style={[
            styles.deltaBadge,
            {
              backgroundColor: delta > 0
                ? COLORS.success + '20'
                : delta < 0
                ? COLORS.danger + '20'
                : COLORS.bgCardAlt,
              borderColor: delta > 0
                ? COLORS.success + '60'
                : delta < 0
                ? COLORS.danger + '60'
                : COLORS.border,
            }
          ]}>
            <Text style={[
              styles.deltaText,
              { color: delta > 0 ? COLORS.success : delta < 0 ? COLORS.danger : COLORS.textMuted }
            ]}>
              {delta > 0 ? `+${delta} points` : delta < 0 ? `${delta} points` : 'No change yet'}
            </Text>
            {delta !== 0 && (
              <Text style={styles.deltaSub}>
                {delta > 0 ? '📈 Your score improved!' : '📉 Your score dropped.'}
              </Text>
            )}
          </View>

          {/* Tier upgrade hint */}
          {delta !== 0 && currentTier?.label !== baseTier?.label && (
            <View style={[styles.tierUpgrade, { borderColor: tierColor + '50', backgroundColor: tierColor + '10' }]}>
              <Text style={[styles.tierUpgradeText, { color: tierColor }]}>
                {delta > 0
                  ? `🎉 Tier upgraded: ${baseTier?.label} → ${currentTier?.label}`
                  : `⚠️ Tier dropped: ${baseTier?.label} → ${currentTier?.label}`}
              </Text>
            </View>
          )}

          {/* Near-miss hint */}
          {delta === 0 && (() => {
            const nextTierScore = currentScore < 580 ? 580 : currentScore < 670 ? 670 : currentScore < 740 ? 740 : currentScore < 800 ? 800 : null;
            const gap = nextTierScore ? nextTierScore - currentScore : null;
            if (gap && gap <= 30) {
              return (
                <View style={styles.nearMissCard}>
                  <Text style={styles.nearMissText}>
                    🎯 You're only <Text style={{ color: COLORS.primary, fontWeight: '900' }}>{gap} points</Text> from the next tier!
                  </Text>
                </View>
              );
            }
            return null;
          })()}

          {/* Reset button */}
          {delta !== 0 && (
            <TouchableOpacity style={styles.resetBtn} onPress={resetAll}>
              <Text style={styles.resetText}>↺ Reset to Baseline</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── SCENARIO CARDS ───────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Scenarios</Text>
          <Text style={styles.sectionSub}>Tap any scenario to instantly simulate its impact</Text>

          <View style={styles.scenariosGrid}>
            {SCENARIOS.map((scenario) => {
              const isActive = activeScenario === scenario.id;
              const simScore = calculateCreditScore({ ...BASE_PROFILE, ...scenario.changes });
              const simDelta = simScore - baseScore;

              return (
                <TouchableOpacity
                  key={scenario.id}
                  style={[
                    styles.scenarioCard,
                    isActive && {
                      borderColor: scenario.color,
                      backgroundColor: scenario.color + '12',
                    },
                  ]}
                  onPress={() => applyScenario(scenario)}
                  activeOpacity={0.8}
                >
                  <View style={styles.scenarioTop}>
                    <Text style={styles.scenarioIcon}>{scenario.icon}</Text>
                    <View style={[
                      styles.scenarioDelta,
                      {
                        backgroundColor: simDelta >= 0 ? COLORS.success + '20' : COLORS.danger + '20',
                      }
                    ]}>
                      <Text style={[
                        styles.scenarioDeltaText,
                        { color: simDelta >= 0 ? COLORS.success : COLORS.danger }
                      ]}>
                        {simDelta >= 0 ? `+${simDelta}` : simDelta}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.scenarioTitle, isActive && { color: scenario.color }]}>
                    {scenario.title}
                  </Text>
                  <Text style={styles.scenarioSubtitle}>{scenario.subtitle}</Text>

                  {isActive && (
                    <TouchableOpacity
                      style={[styles.saveBtn, { borderColor: scenario.color + '60' }]}
                      onPress={() => saveScenario(scenario.id)}
                    >
                      <Text style={[styles.saveBtnText, { color: scenario.color }]}>
                        {savedScenarios.includes(scenario.id) ? '✓ Saved to Plan' : '+ Add to Plan'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── ACTIVE SCENARIO TIP ──────────────── */}
        {activeScenarioData && (
          <View style={[styles.tipCard, { borderColor: activeScenarioData.color + '40' }]}>
            <Text style={styles.tipIcon}>💡</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Why this happens</Text>
              <Text style={styles.tipBody}>{activeScenarioData.tip}</Text>
            </View>
          </View>
        )}

        {/* ── CUSTOM SLIDERS ───────────────────── */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.slidersToggle}
            onPress={() => setShowSliders(!showSliders)}
          >
            <Text style={styles.sectionTitle}>Custom Sliders</Text>
            <Text style={styles.slidersToggleIcon}>{showSliders ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          <Text style={styles.sectionSub}>Fine-tune every credit factor manually</Text>

          {showSliders && (
            <View style={styles.slidersContainer}>
              <CreditSlider
                label="Payment History (35%)"
                value={profile.paymentHistory}
                min={0} max={100} step={5}
                color={COLORS.success}
                format={(v) => `${v}% on-time`}
                onChange={(v) => updateSlider('paymentHistory', v)}
              />
              <CreditSlider
                label="Credit Utilization (30%)"
                value={profile.creditUtilization}
                min={0} max={100} step={5}
                color={profile.creditUtilization <= 10 ? COLORS.success : profile.creditUtilization <= 30 ? COLORS.scoreGood : COLORS.danger}
                format={(v) => `${v}% utilized`}
                onChange={(v) => updateSlider('creditUtilization', v)}
              />
              <CreditSlider
                label="Credit Age (15%)"
                value={profile.creditAge}
                min={0} max={120} step={6}
                color={COLORS.accent}
                format={(v) => `${Math.floor(v / 12)}y ${v % 12}m avg`}
                onChange={(v) => updateSlider('creditAge', v)}
              />
              <CreditSlider
                label="Credit Mix (10%)"
                value={profile.creditMix}
                min={0} max={100} step={10}
                color={COLORS.secondary}
                format={(v) => `${v}% diversity`}
                onChange={(v) => updateSlider('creditMix', v)}
              />
              <CreditSlider
                label="New Credit (10%)"
                value={profile.newCredit}
                min={0} max={100} step={10}
                color={COLORS.warning}
                format={(v) => `${v}% score`}
                onChange={(v) => updateSlider('newCredit', v)}
              />
            </View>
          )}
        </View>

        {/* ── FACTOR IMPACT BARS ───────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Factor Breakdown</Text>
          <Text style={styles.sectionSub}>How each factor is currently affecting your score</Text>

          <View style={styles.factorBars}>
            {factors.map((f) => {
              const rawVal = profile[f.key] as number;
              const normalized = f.invert
                ? 100 - rawVal
                : f.maxVal
                ? (rawVal / f.maxVal) * 100
                : rawVal;
              const contribution = (normalized / 100) * f.weight;
              const maxContrib = f.weight;

              return (
                <View key={f.key} style={styles.factorBarRow}>
                  <View style={styles.factorBarLeft}>
                    <Text style={styles.factorBarLabel}>{f.label}</Text>
                    <Text style={[styles.factorBarWeight, { color: f.color }]}>{f.weight}%</Text>
                  </View>
                  <View style={styles.factorBarTrack}>
                    <View
                      style={[
                        styles.factorBarFill,
                        {
                          width: `${(contribution / maxContrib) * 100}%`,
                          backgroundColor: f.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.factorBarScore, { color: f.color }]}>
                    {Math.round(contribution * 5.5)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── SAVE TO PLAN CTA ─────────────────── */}
        {savedScenarios.length > 0 && (
          <View style={styles.planCard}>
            <Text style={styles.planTitle}>
              📋 {savedScenarios.length} scenario{savedScenarios.length > 1 ? 's' : ''} saved to your plan
            </Text>
            <Text style={styles.planSub}>
              Potential score gain:{' '}
              <Text style={{ color: COLORS.success, fontWeight: '900' }}>
                +{savedScenarios.reduce((acc, id) => {
                  const sc = SCENARIOS.find(s => s.id === id);
                  if (!sc) return acc;
                  return acc + (calculateCreditScore({ ...BASE_PROFILE, ...sc.changes }) - baseScore);
                }, 0)} pts
              </Text>
            </Text>
            <TouchableOpacity style={styles.planBtn}>
              <Text style={styles.planBtnText}>View My Plan →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Ghost mode note */}
        {isGhostMode && (
          <View style={styles.ghostNote}>
            <Text style={styles.ghostNoteText}>
              👻 Simulating with demo data. Connect real bureau data for personalized results.
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingBottom: 40 },

  header: { paddingHorizontal: SPACING.lg, paddingTop: 60, paddingBottom: SPACING.md },
  headline: { fontSize: FONTS.sizes.xxl, fontWeight: '900', color: COLORS.textPrimary },
  subheadline: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: SPACING.xs, lineHeight: 20 },

  // Score section
  scoreSection: {
    marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl,
    padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  scoreCompare: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  scoreCompareItem: { alignItems: 'center', flex: 1 },
  compareLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, letterSpacing: 1, marginBottom: 4 },
  compareScore: { fontSize: FONTS.sizes.xxxl, fontWeight: '900' },
  compareScoreLarge: { fontSize: FONTS.sizes.hero, fontWeight: '900' },
  compareTier: { fontSize: FONTS.sizes.xs, fontWeight: '800', letterSpacing: 1, marginTop: 2 },
  arrowContainer: { alignItems: 'center', paddingHorizontal: SPACING.sm },
  deltaArrow: { fontSize: 28, fontWeight: '900' },
  deltaBadge: {
    borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1,
    alignItems: 'center', marginBottom: SPACING.sm,
  },
  deltaText: { fontSize: FONTS.sizes.xl, fontWeight: '900' },
  deltaSub: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 4 },
  tierUpgrade: {
    borderRadius: RADIUS.sm, padding: SPACING.sm,
    borderWidth: 1, marginBottom: SPACING.sm, alignItems: 'center',
  },
  tierUpgradeText: { fontSize: FONTS.sizes.sm, fontWeight: '700' },
  nearMissCard: {
    backgroundColor: COLORS.primaryGlow, borderRadius: RADIUS.sm,
    padding: SPACING.sm, marginBottom: SPACING.sm, alignItems: 'center',
  },
  nearMissText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textAlign: 'center' },
  resetBtn: {
    alignSelf: 'center', paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md,
  },
  resetText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, fontWeight: '600' },

  // Sections
  section: { marginHorizontal: SPACING.lg, marginBottom: SPACING.xl },
  sectionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.textPrimary },
  sectionSub: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, marginTop: 2, marginBottom: SPACING.md },
  slidersToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  slidersToggleIcon: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted },
  slidersContainer: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border,
  },

  // Scenario grid
  scenariosGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm,
  },
  scenarioCard: {
    width: (width - SPACING.lg * 2 - SPACING.sm) / 2,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: SPACING.md, borderWidth: 1.5, borderColor: COLORS.border,
  },
  scenarioTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  scenarioIcon: { fontSize: 26 },
  scenarioDelta: { borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  scenarioDeltaText: { fontSize: FONTS.sizes.sm, fontWeight: '900' },
  scenarioTitle: { fontSize: FONTS.sizes.sm, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 2 },
  scenarioSubtitle: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  saveBtn: {
    marginTop: SPACING.sm, borderRadius: RADIUS.pill, borderWidth: 1,
    paddingVertical: 4, alignItems: 'center',
  },
  saveBtnText: { fontSize: FONTS.sizes.xs, fontWeight: '800' },

  // Tip card
  tipCard: {
    marginHorizontal: SPACING.lg, marginBottom: SPACING.xl,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: SPACING.md, borderWidth: 1,
    flexDirection: 'row', gap: SPACING.md,
  },
  tipIcon: { fontSize: 24, marginTop: 2 },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: FONTS.sizes.sm, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  tipBody: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 20 },

  // Factor bars
  factorBars: { gap: SPACING.sm },
  factorBarRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  factorBarLeft: { width: 130 },
  factorBarLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  factorBarWeight: { fontSize: FONTS.sizes.xs, fontWeight: '700' },
  factorBarTrack: {
    flex: 1, height: 8, backgroundColor: COLORS.bgCardAlt,
    borderRadius: RADIUS.pill, overflow: 'hidden',
  },
  factorBarFill: { height: '100%', borderRadius: RADIUS.pill },
  factorBarScore: { width: 28, fontSize: FONTS.sizes.sm, fontWeight: '800', textAlign: 'right' },

  // Plan card
  planCard: {
    marginHorizontal: SPACING.lg, marginBottom: SPACING.xl,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl,
    padding: SPACING.lg, borderWidth: 1.5, borderColor: COLORS.success + '50',
  },
  planTitle: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  planSub: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.md },
  planBtn: {
    backgroundColor: COLORS.success, borderRadius: RADIUS.pill,
    paddingVertical: SPACING.sm, alignItems: 'center',
  },
  planBtnText: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.bg },

  // Ghost note
  ghostNote: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.bgCardAlt, borderRadius: RADIUS.md,
    padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
  },
  ghostNoteText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },
});
