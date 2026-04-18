/**
 * FEDGE 2.O — Mission 1: The 5 Factors
 * The first full learning mission. Lesson slides + interactive quiz.
 *
 * Flow:
 * INTRO → SLIDE 1 → SLIDE 2 → SLIDE 3 → SLIDE 4 → SLIDE 5 → QUIZ → RESULTS
 *
 * Addictive hooks:
 * - Progress bar always visible — near completion = compulsion to finish
 * - Each slide has a mini interaction (tap to reveal, swipe to continue)
 * - Quiz: wrong answers shake + explain why — Duolingo-style learning
 * - Perfect score = bonus XP + special badge
 * - Completion ceremony with confetti + level-up check
 * - "Mission 2 Unlocked!" cliffhanger at the end
 *
 * Inspired by: Duolingo lesson flow, Khan Academy, Brilliant.org
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@constants/theme';
import { useGameStore } from '@store/gameStore';
import { XP, FEDGE_COINS } from '@constants/gameConfig';

const { width, height } = Dimensions.get('window');

// ─────────────────────────────────────────────
// Lesson slides data
// ─────────────────────────────────────────────
const SLIDES = [
  {
    id: 1,
    factor: 'Payment History',
    weight: 35,
    color: COLORS.success,
    icon: '📅',
    headline: 'Payment History',
    subhead: 'The #1 factor — 35% of your score',
    body: 'Every on-time payment builds your score. Every missed payment damages it — sometimes by 60–110 points — and stays on your report for 7 years.',
    keyFact: '💡 Even one 30-day late payment can drop a 780 score below 700.',
    visual: [
      { label: 'On-time', value: 100, color: COLORS.success },
      { label: '30 days late', value: 65, color: COLORS.warning },
      { label: '60 days late', value: 45, color: COLORS.danger },
      { label: 'Collection', value: 20, color: '#FF0000' },
    ],
    tip: 'Set up autopay for at least the minimum payment on every account. You can always pay more manually — but autopay prevents disasters.',
    xp: 20,
  },
  {
    id: 2,
    factor: 'Credit Utilization',
    weight: 30,
    color: COLORS.primary,
    icon: '💳',
    headline: 'Credit Utilization',
    subhead: 'How much credit you\'re using — 30%',
    body: 'Your utilization ratio is your total balance divided by your total credit limit. Keeping it below 10% is the fastest way to boost your score.',
    keyFact: '💡 Pay your card balance BEFORE the statement closes — that\'s when balances are reported to bureaus.',
    visual: [
      { label: 'Under 10%', value: 100, color: COLORS.success },
      { label: '10–29%', value: 75, color: COLORS.scoreGood },
      { label: '30–49%', value: 55, color: COLORS.warning },
      { label: '50–74%', value: 35, color: COLORS.scoreFair },
      { label: '75%+', value: 15, color: COLORS.danger },
    ],
    tip: 'If you can\'t pay the full balance, at least get under 30%. Each card\'s individual utilization counts — not just your total.',
    xp: 20,
  },
  {
    id: 3,
    factor: 'Credit Age',
    weight: 15,
    color: COLORS.accent,
    icon: '⏳',
    headline: 'Length of Credit History',
    subhead: 'How long you\'ve had credit — 15%',
    body: 'The longer your credit history, the better. This includes the age of your oldest account, your newest account, and the average age of all accounts.',
    keyFact: '💡 Never close your oldest credit card — even if you never use it. Its age is protecting your score.',
    visual: [
      { label: '7+ years', value: 100, color: COLORS.success },
      { label: '4–7 years', value: 75, color: COLORS.scoreGood },
      { label: '2–4 years', value: 55, color: COLORS.scoreGood },
      { label: '1–2 years', value: 35, color: COLORS.warning },
      { label: 'Under 1 yr', value: 15, color: COLORS.danger },
    ],
    tip: 'The authorized user strategy works here. Getting added to a family member\'s 10-year-old account instantly adds that history to your report.',
    xp: 20,
  },
  {
    id: 4,
    factor: 'Credit Mix',
    weight: 10,
    color: COLORS.secondary,
    icon: '🎨',
    headline: 'Credit Mix',
    subhead: 'Types of credit you have — 10%',
    body: 'Lenders like to see you can handle different types of credit: revolving (credit cards), installment (auto loans, student loans), and mortgage.',
    keyFact: '💡 Don\'t open accounts just to improve your mix — only do it when it makes financial sense for you.',
    visual: [
      { label: 'Cards + Loans', value: 100, color: COLORS.success },
      { label: 'Cards + 1 Loan', value: 75, color: COLORS.scoreGood },
      { label: 'Cards only', value: 55, color: COLORS.scoreGood },
      { label: '1 card only', value: 30, color: COLORS.warning },
    ],
    tip: 'A credit-builder loan from a credit union is a great way to add installment credit to your profile cheaply and safely.',
    xp: 20,
  },
  {
    id: 5,
    factor: 'New Credit',
    weight: 10,
    color: COLORS.warning,
    icon: '🔍',
    headline: 'New Credit & Inquiries',
    subhead: 'Recent credit applications — 10%',
    body: 'Every time you apply for credit, a "hard inquiry" appears on your report. Too many in a short period signals risk to lenders and drops your score.',
    keyFact: '💡 Rate shopping for a mortgage or auto loan? Multiple inquiries within 14–45 days count as just ONE inquiry.',
    visual: [
      { label: '0 inquiries', value: 100, color: COLORS.success },
      { label: '1–2', value: 80, color: COLORS.scoreGood },
      { label: '3–4', value: 60, color: COLORS.warning },
      { label: '5–6', value: 40, color: COLORS.scoreFair },
      { label: '7+', value: 20, color: COLORS.danger },
    ],
    tip: 'Hard inquiries typically drop your score 5–10 points and stay for 2 years, but only affect your score for 12 months.',
    xp: 20,
  },
];

// ─────────────────────────────────────────────
// Quiz questions
// ─────────────────────────────────────────────
const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the most important factor in your credit score?',
    options: ['Credit Utilization', 'Payment History', 'Credit Age', 'Credit Mix'],
    correct: 1,
    explanation: 'Payment History makes up 35% of your score — the largest single factor. One missed payment can erase years of good history.',
  },
  {
    id: 'q2',
    question: 'What credit utilization ratio is considered "elite" by lenders?',
    options: ['Under 30%', 'Under 50%', 'Under 10%', 'Under 20%'],
    correct: 2,
    explanation: 'Under 10% is the sweet spot. Under 30% is acceptable, but to maximize your score you want to be in single digits.',
  },
  {
    id: 'q3',
    question: 'A hard inquiry typically stays on your credit report for how long?',
    options: ['6 months', '1 year', '2 years', '7 years'],
    correct: 2,
    explanation: 'Hard inquiries stay on your report for 2 years, but only impact your score for the first 12 months.',
  },
  {
    id: 'q4',
    question: 'You have an old credit card you haven\'t used in 3 years. What should you do?',
    options: [
      'Close it — no point keeping it',
      'Keep it open — its age helps your score',
      'Transfer the balance',
      'Apply for a higher limit first',
    ],
    correct: 1,
    explanation: 'Keep it open! Closing old accounts shortens your credit history and removes that credit limit — both hurt your score.',
  },
  {
    id: 'q5',
    question: 'You\'re shopping for a mortgage and apply to 5 lenders in 2 weeks. How many hard inquiries count against your score?',
    options: ['5 inquiries', '3 inquiries', '2 inquiries', '1 inquiry'],
    correct: 3,
    explanation: 'Rate shopping for mortgages, auto loans, and student loans within a 14–45 day window counts as a single inquiry. Smart shopping!',
  },
];

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
type Phase = 'intro' | 'lesson' | 'quiz' | 'results';

export default function MissionOneScreen({ navigation }: any) {
  const addXP = useGameStore((s) => s.addXP);
  const addFedgeCoins = useGameStore((s) => s.addFedgeCoins);
  const completeModule = useGameStore((s) => s.completeModule);
  const level = useGameStore((s) => s.level);

  const [phase, setPhase] = useState<Phase>('intro');
  const [slideIndex, setSlideIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<boolean[]>([]);
  const [xpEarned, setXpEarned] = useState(0);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const celebrationScale = useRef(new Animated.Value(0)).current;
  const celebrationOpacity = useRef(new Animated.Value(0)).current;
  const confettiAnims = Array.from({ length: 10 }, () => ({
    opacity: useRef(new Animated.Value(0)).current,
    y: useRef(new Animated.Value(0)).current,
    x: useRef(new Animated.Value((Math.random() - 0.5) * width * 0.8)).current,
  }));

  const totalSteps = SLIDES.length + QUIZ_QUESTIONS.length;
  const currentStep =
    phase === 'intro' ? 0 :
    phase === 'lesson' ? slideIndex + 1 :
    phase === 'quiz' ? SLIDES.length + quizIndex + 1 :
    totalSteps;

  useEffect(() => {
    animateIn();
    Animated.spring(progressAnim, {
      toValue: currentStep / totalSteps,
      tension: 60, friction: 10,
      useNativeDriver: false,
    }).start();
  }, [phase, slideIndex, quizIndex]);

  const animateIn = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(40);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
    ]).start();
  };

  const shakeWrong = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleSlideNext = () => {
    const earnedXp = SLIDES[slideIndex].xp;
    addXP(earnedXp);
    setXpEarned((prev) => prev + earnedXp);

    if (slideIndex < SLIDES.length - 1) {
      setSlideIndex(slideIndex + 1);
    } else {
      setPhase('quiz');
    }
  };

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);

    const q = QUIZ_QUESTIONS[quizIndex];
    const correct = idx === q.correct;
    setAnsweredCorrectly(correct);

    const newAnswers = [...quizAnswers, correct];
    setQuizAnswers(newAnswers);

    if (correct) {
      addXP(XP.QUIZ_PASS);
      setXpEarned((prev) => prev + XP.QUIZ_PASS);
      setCorrectCount((c) => c + 1);
    } else {
      shakeWrong();
    }
  };

  const handleQuizNext = () => {
    setSelectedAnswer(null);
    setAnsweredCorrectly(null);

    if (quizIndex < QUIZ_QUESTIONS.length - 1) {
      setQuizIndex(quizIndex + 1);
    } else {
      finishMission();
    }
  };

  const finishMission = () => {
    const perfect = correctCount + (answeredCorrectly ? 1 : 0) === QUIZ_QUESTIONS.length;
    const bonusXp = perfect ? XP.QUIZ_PERFECT : 0;
    const totalXp = xpEarned + XP.MODULE_COMPLETE + bonusXp;

    addXP(XP.MODULE_COMPLETE + bonusXp);
    addFedgeCoins(FEDGE_COINS.LESSON_COMPLETE * 2);
    completeModule('mission_1_five_factors');

    setXpEarned(totalXp);
    setPhase('results');

    // Celebration animation
    Animated.sequence([
      Animated.parallel([
        Animated.spring(celebrationScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
        Animated.timing(celebrationOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
    ]).start();

    // Confetti
    confettiAnims.forEach((c, i) => {
      Animated.sequence([
        Animated.delay(i * 80),
        Animated.parallel([
          Animated.timing(c.opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(c.y, { toValue: -height * 0.5, duration: 1400, useNativeDriver: true }),
        ]),
        Animated.timing(c.opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    });
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const slide = SLIDES[slideIndex];
  const question = QUIZ_QUESTIONS[quizIndex];
  const finalCorrect = quizAnswers.filter(Boolean).length;
  const isPerfect = finalCorrect === QUIZ_QUESTIONS.length;

  // ─── RENDER ──────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Confetti */}
      {phase === 'results' && confettiAnims.map((c, i) => (
        <Animated.View key={i} style={[
          styles.confetti,
          {
            opacity: c.opacity,
            backgroundColor: [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.accent, COLORS.warning][i % 5],
            transform: [{ translateX: c.x }, { translateY: c.y }],
          }
        ]} />
      ))}

      {/* ── TOP BAR ──────────────────────────── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation?.goBack?.()}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
        <View style={styles.xpBadge}>
          <Text style={styles.xpBadgeText}>+{xpEarned} XP</Text>
        </View>
      </View>

      {/* ── INTRO ────────────────────────────── */}
      {phase === 'intro' && (
        <Animated.View style={[styles.phaseContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <ScrollView contentContainerStyle={styles.introScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.missionLabel}>MISSION 1</Text>
            <Text style={styles.missionTitle}>The 5 Factors</Text>
            <Text style={styles.missionDesc}>
              Your credit score is determined by exactly 5 factors. Master all 5 and you master your financial life.
            </Text>

            <View style={styles.factorPreviewList}>
              {SLIDES.map((s) => (
                <View key={s.id} style={[styles.factorPreviewRow, { borderColor: s.color + '40' }]}>
                  <Text style={styles.factorPreviewIcon}>{s.icon}</Text>
                  <View style={styles.factorPreviewInfo}>
                    <Text style={[styles.factorPreviewName, { color: s.color }]}>{s.factor}</Text>
                    <View style={styles.factorWeightBar}>
                      <View style={[styles.factorWeightFill, { width: `${s.weight}%`, backgroundColor: s.color }]} />
                    </View>
                  </View>
                  <Text style={[styles.factorPreviewWeight, { color: s.color }]}>{s.weight}%</Text>
                </View>
              ))}
            </View>

            <View style={styles.missionMeta}>
              <View style={styles.missionMetaItem}>
                <Text style={styles.metaValue}>5 min</Text>
                <Text style={styles.metaLabel}>Read time</Text>
              </View>
              <View style={styles.missionMetaItem}>
                <Text style={styles.metaValue}>5</Text>
                <Text style={styles.metaLabel}>Quiz questions</Text>
              </View>
              <View style={styles.missionMetaItem}>
                <Text style={[styles.metaValue, { color: COLORS.primary }]}>+{SLIDES.reduce((a, s) => a + s.xp, 0) + XP.MODULE_COMPLETE} XP</Text>
                <Text style={styles.metaLabel}>Reward</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.startBtn} onPress={() => setPhase('lesson')}>
              <Text style={styles.startBtnText}>Start Mission →</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      )}

      {/* ── LESSON SLIDE ─────────────────────── */}
      {phase === 'lesson' && (
        <Animated.View style={[styles.phaseContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <ScrollView contentContainerStyle={styles.lessonScroll} showsVerticalScrollIndicator={false}>

            {/* Factor badge */}
            <View style={[styles.factorBadge, { backgroundColor: slide.color + '20', borderColor: slide.color + '50' }]}>
              <Text style={styles.factorBadgeIcon}>{slide.icon}</Text>
              <Text style={[styles.factorBadgeName, { color: slide.color }]}>{slide.factor}</Text>
              <Text style={[styles.factorBadgeWeight, { color: slide.color }]}>{slide.weight}% of score</Text>
            </View>

            <Text style={styles.lessonHeadline}>{slide.headline}</Text>
            <Text style={styles.lessonSubhead}>{slide.subhead}</Text>
            <Text style={styles.lessonBody}>{slide.body}</Text>

            {/* Visual score bar chart */}
            <View style={styles.visualCard}>
              <Text style={styles.visualTitle}>Score Impact</Text>
              {slide.visual.map((v, i) => (
                <View key={i} style={styles.visualRow}>
                  <Text style={styles.visualLabel}>{v.label}</Text>
                  <View style={styles.visualBarTrack}>
                    <View style={[styles.visualBarFill, { width: `${v.value}%`, backgroundColor: v.color }]} />
                  </View>
                  <Text style={[styles.visualValue, { color: v.color }]}>{v.value}%</Text>
                </View>
              ))}
            </View>

            {/* Key fact */}
            <View style={[styles.keyFactCard, { borderColor: slide.color + '50', backgroundColor: slide.color + '10' }]}>
              <Text style={styles.keyFactText}>{slide.keyFact}</Text>
            </View>

            {/* Pro tip */}
            <View style={styles.tipCard}>
              <Text style={styles.tipLabel}>PRO TIP</Text>
              <Text style={styles.tipText}>{slide.tip}</Text>
            </View>

            {/* Slide counter */}
            <Text style={styles.slideCounter}>
              {slideIndex + 1} of {SLIDES.length}
            </Text>

            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: slide.color }]}
              onPress={handleSlideNext}
            >
              <Text style={styles.nextBtnText}>
                {slideIndex < SLIDES.length - 1 ? `Next: ${SLIDES[slideIndex + 1].factor} →` : 'Start Quiz →'}
              </Text>
              <Text style={styles.nextBtnXP}>+{slide.xp} XP</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      )}

      {/* ── QUIZ ─────────────────────────────── */}
      {phase === 'quiz' && (
        <Animated.View
          style={[
            styles.phaseContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { translateX: shakeAnim }],
            },
          ]}
        >
          <ScrollView contentContainerStyle={styles.quizScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.quizLabel}>QUESTION {quizIndex + 1} OF {QUIZ_QUESTIONS.length}</Text>
            <Text style={styles.quizQuestion}>{question.question}</Text>

            <View style={styles.optionsContainer}>
              {question.options.map((option, idx) => {
                let optionStyle = styles.option;
                let textStyle = styles.optionText;

                if (selectedAnswer !== null) {
                  if (idx === question.correct) {
                    optionStyle = { ...styles.option, ...styles.optionCorrect };
                    textStyle = { ...styles.optionText, color: COLORS.bg };
                  } else if (idx === selectedAnswer && idx !== question.correct) {
                    optionStyle = { ...styles.option, ...styles.optionWrong };
                    textStyle = { ...styles.optionText, color: COLORS.bg };
                  } else {
                    optionStyle = { ...styles.option, ...styles.optionDimmed };
                  }
                }

                return (
                  <TouchableOpacity
                    key={idx}
                    style={optionStyle}
                    onPress={() => handleAnswer(idx)}
                    disabled={selectedAnswer !== null}
                    activeOpacity={0.85}
                  >
                    <View style={styles.optionLeft}>
                      <View style={styles.optionBullet}>
                        <Text style={styles.optionBulletText}>
                          {selectedAnswer !== null
                            ? idx === question.correct ? '✓'
                            : idx === selectedAnswer ? '✗'
                            : String.fromCharCode(65 + idx)
                            : String.fromCharCode(65 + idx)}
                        </Text>
                      </View>
                      <Text style={textStyle}>{option}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Explanation after answer */}
            {selectedAnswer !== null && (
              <Animated.View style={[
                styles.explanationCard,
                {
                  borderColor: answeredCorrectly ? COLORS.success + '60' : COLORS.danger + '60',
                  backgroundColor: answeredCorrectly ? COLORS.success + '10' : COLORS.danger + '10',
                }
              ]}>
                <Text style={[
                  styles.explanationHeader,
                  { color: answeredCorrectly ? COLORS.success : COLORS.danger }
                ]}>
                  {answeredCorrectly ? '✓ Correct!' : '✗ Not quite — here\'s why:'}
                </Text>
                <Text style={styles.explanationText}>{question.explanation}</Text>

                <TouchableOpacity
                  style={[styles.continueBtn, { backgroundColor: answeredCorrectly ? COLORS.success : COLORS.primary }]}
                  onPress={handleQuizNext}
                >
                  <Text style={styles.continueBtnText}>
                    {quizIndex < QUIZ_QUESTIONS.length - 1 ? 'Next Question →' : 'See Results →'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </ScrollView>
        </Animated.View>
      )}

      {/* ── RESULTS ──────────────────────────── */}
      {phase === 'results' && (
        <ScrollView contentContainerStyle={styles.resultsScroll} showsVerticalScrollIndicator={false}>
          <Animated.View style={[
            styles.resultsCard,
            { opacity: celebrationOpacity, transform: [{ scale: celebrationScale }] }
          ]}>
            <Text style={styles.resultsEmoji}>{isPerfect ? '🏆' : finalCorrect >= 4 ? '🌟' : '✅'}</Text>
            <Text style={styles.resultsTitle}>
              {isPerfect ? 'PERFECT SCORE!' : finalCorrect >= 4 ? 'Excellent!' : 'Mission Complete!'}
            </Text>
            <Text style={styles.resultsScore}>{finalCorrect}/{QUIZ_QUESTIONS.length} correct</Text>

            <View style={styles.resultsRewards}>
              <View style={styles.resultsRewardItem}>
                <Text style={styles.resultsRewardValue}>+{xpEarned}</Text>
                <Text style={styles.resultsRewardLabel}>XP Earned</Text>
              </View>
              <View style={styles.resultsRewardDivider} />
              <View style={styles.resultsRewardItem}>
                <Text style={[styles.resultsRewardValue, { color: COLORS.secondary }]}>
                  +{FEDGE_COINS.LESSON_COMPLETE * 2}
                </Text>
                <Text style={styles.resultsRewardLabel}>FEDGE Coins</Text>
              </View>
              {isPerfect && (
                <>
                  <View style={styles.resultsRewardDivider} />
                  <View style={styles.resultsRewardItem}>
                    <Text style={[styles.resultsRewardValue, { color: COLORS.accent }]}>🏅</Text>
                    <Text style={styles.resultsRewardLabel}>Badge Earned</Text>
                  </View>
                </>
              )}
            </View>

            {/* What they learned */}
            <View style={styles.learnedCard}>
              <Text style={styles.learnedTitle}>You now know:</Text>
              {SLIDES.map((s) => (
                <View key={s.id} style={styles.learnedRow}>
                  <Text style={[styles.learnedCheck, { color: s.color }]}>✓</Text>
                  <Text style={styles.learnedText}>
                    <Text style={{ color: s.color, fontWeight: '800' }}>{s.factor}</Text>
                    {' '}makes up {s.weight}% of your score
                  </Text>
                </View>
              ))}
            </View>

            {/* Next mission unlock */}
            <View style={styles.nextMissionCard}>
              <Text style={styles.nextMissionLabel}>🔓 UNLOCKED</Text>
              <Text style={styles.nextMissionTitle}>Mission 2: Utilization Mastery</Text>
              <Text style={styles.nextMissionDesc}>The fastest way to add 40+ points to your score</Text>
            </View>

            <TouchableOpacity style={styles.doneBtn} onPress={() => navigation?.goBack?.()}>
              <Text style={styles.doneBtnText}>Back to Home →</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  confetti: {
    position: 'absolute', bottom: '50%', left: '50%',
    width: 10, height: 10, borderRadius: 2, zIndex: 50,
  },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingHorizontal: SPACING.lg, paddingTop: 52, paddingBottom: SPACING.md,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.bgCard, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  closeBtnText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '700' },
  progressBar: {
    flex: 1, height: 8, backgroundColor: COLORS.bgCardAlt,
    borderRadius: RADIUS.pill, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: RADIUS.pill },
  xpBadge: {
    backgroundColor: COLORS.secondary + '20', borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm, paddingVertical: 3,
    borderWidth: 1, borderColor: COLORS.secondary + '40',
  },
  xpBadgeText: { fontSize: FONTS.sizes.xs, fontWeight: '800', color: COLORS.secondary },

  // Phase containers
  phaseContainer: { flex: 1 },

  // Intro
  introScroll: { paddingHorizontal: SPACING.lg, paddingBottom: 40 },
  missionLabel: { fontSize: FONTS.sizes.xs, color: COLORS.primary, letterSpacing: 3, marginBottom: SPACING.xs },
  missionTitle: { fontSize: FONTS.sizes.hero, fontWeight: '900', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  missionDesc: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, lineHeight: 24, marginBottom: SPACING.xl },
  factorPreviewList: { gap: SPACING.sm, marginBottom: SPACING.xl },
  factorPreviewRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1,
  },
  factorPreviewIcon: { fontSize: 28 },
  factorPreviewInfo: { flex: 1, gap: SPACING.xs },
  factorPreviewName: { fontSize: FONTS.sizes.md, fontWeight: '800' },
  factorWeightBar: { height: 6, backgroundColor: COLORS.bgCardAlt, borderRadius: RADIUS.pill, overflow: 'hidden' },
  factorWeightFill: { height: '100%', borderRadius: RADIUS.pill },
  factorPreviewWeight: { fontSize: FONTS.sizes.lg, fontWeight: '900', width: 36, textAlign: 'right' },
  missionMeta: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.xl,
  },
  missionMetaItem: { alignItems: 'center' },
  metaValue: { fontSize: FONTS.sizes.xl, fontWeight: '900', color: COLORS.textPrimary },
  metaLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  startBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md + 2, alignItems: 'center', ...SHADOWS.primary,
  },
  startBtnText: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.bg },

  // Lesson
  lessonScroll: { paddingHorizontal: SPACING.lg, paddingBottom: 40 },
  factorBadge: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    borderRadius: RADIUS.pill, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderWidth: 1, alignSelf: 'flex-start', marginBottom: SPACING.md,
  },
  factorBadgeIcon: { fontSize: 20 },
  factorBadgeName: { fontSize: FONTS.sizes.sm, fontWeight: '800' },
  factorBadgeWeight: { fontSize: FONTS.sizes.xs, fontWeight: '700' },
  lessonHeadline: { fontSize: FONTS.sizes.xxl, fontWeight: '900', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  lessonSubhead: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, marginBottom: SPACING.md },
  lessonBody: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, lineHeight: 24, marginBottom: SPACING.lg },
  visualCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md, gap: SPACING.sm,
  },
  visualTitle: { fontSize: FONTS.sizes.sm, fontWeight: '800', color: COLORS.textSecondary, marginBottom: SPACING.xs },
  visualRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  visualLabel: { width: 100, fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  visualBarTrack: { flex: 1, height: 8, backgroundColor: COLORS.bgCardAlt, borderRadius: RADIUS.pill, overflow: 'hidden' },
  visualBarFill: { height: '100%', borderRadius: RADIUS.pill },
  visualValue: { width: 32, fontSize: FONTS.sizes.xs, fontWeight: '800', textAlign: 'right' },
  keyFactCard: {
    borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, marginBottom: SPACING.md,
  },
  keyFactText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 20 },
  tipCard: {
    backgroundColor: COLORS.bgCardAlt, borderRadius: RADIUS.md, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.lg,
  },
  tipLabel: { fontSize: FONTS.sizes.xs, color: COLORS.primary, letterSpacing: 2, fontWeight: '800', marginBottom: SPACING.xs },
  tipText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 20 },
  slideCounter: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, textAlign: 'center', marginBottom: SPACING.sm },
  nextBtn: {
    borderRadius: RADIUS.pill, paddingVertical: SPACING.md + 2, alignItems: 'center', gap: 4,
  },
  nextBtnText: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.bg },
  nextBtnXP: { fontSize: FONTS.sizes.xs, color: COLORS.bg + 'CC' },

  // Quiz
  quizScroll: { paddingHorizontal: SPACING.lg, paddingBottom: 40 },
  quizLabel: { fontSize: FONTS.sizes.xs, color: COLORS.primary, letterSpacing: 3, marginBottom: SPACING.sm },
  quizQuestion: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.textPrimary, lineHeight: 30, marginBottom: SPACING.xl },
  optionsContainer: { gap: SPACING.sm, marginBottom: SPACING.md },
  option: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  optionCorrect: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  optionWrong: { backgroundColor: COLORS.danger, borderColor: COLORS.danger },
  optionDimmed: { opacity: 0.4 },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  optionBullet: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.bgCardAlt,
    alignItems: 'center', justifyContent: 'center',
  },
  optionBulletText: { fontSize: FONTS.sizes.sm, fontWeight: '800', color: COLORS.textPrimary },
  optionText: { fontSize: FONTS.sizes.md, color: COLORS.textPrimary, flex: 1, fontWeight: '600' },
  explanationCard: {
    borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, gap: SPACING.md,
  },
  explanationHeader: { fontSize: FONTS.sizes.lg, fontWeight: '900' },
  explanationText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 20 },
  continueBtn: { borderRadius: RADIUS.pill, paddingVertical: SPACING.md, alignItems: 'center' },
  continueBtnText: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.bg },

  // Results
  resultsScroll: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: 60, alignItems: 'center' },
  resultsCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: SPACING.xl,
    borderWidth: 1, borderColor: COLORS.secondary + '40', width: '100%', alignItems: 'center',
    ...SHADOWS.gold,
  },
  resultsEmoji: { fontSize: 72, marginBottom: SPACING.md },
  resultsTitle: { fontSize: FONTS.sizes.xxl, fontWeight: '900', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  resultsScore: { fontSize: FONTS.sizes.lg, color: COLORS.textSecondary, marginBottom: SPACING.xl },
  resultsRewards: {
    flexDirection: 'row', justifyContent: 'space-around', width: '100%',
    backgroundColor: COLORS.bgCardAlt, borderRadius: RADIUS.lg, padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  resultsRewardItem: { alignItems: 'center' },
  resultsRewardValue: { fontSize: FONTS.sizes.xl, fontWeight: '900', color: COLORS.primary },
  resultsRewardLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  resultsRewardDivider: { width: 1, backgroundColor: COLORS.border },
  learnedCard: { width: '100%', gap: SPACING.sm, marginBottom: SPACING.xl },
  learnedTitle: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  learnedRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  learnedCheck: { fontSize: FONTS.sizes.md, fontWeight: '900', width: 20 },
  learnedText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, flex: 1, lineHeight: 20 },
  nextMissionCard: {
    backgroundColor: COLORS.primary + '15', borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.primary + '40', width: '100%',
    marginBottom: SPACING.xl, alignItems: 'center',
  },
  nextMissionLabel: { fontSize: FONTS.sizes.xs, color: COLORS.primary, letterSpacing: 2, fontWeight: '800', marginBottom: 4 },
  nextMissionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '900', color: COLORS.textPrimary },
  nextMissionDesc: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  doneBtn: {
    width: '100%', backgroundColor: COLORS.primary, borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md + 2, alignItems: 'center', ...SHADOWS.primary,
  },
  doneBtnText: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.bg },
});
