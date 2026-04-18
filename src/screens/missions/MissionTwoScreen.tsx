/**
 * FEDGE 2.O — Mission 2: Utilization Mastery
 * The fastest way to add 40+ points to your score.
 *
 * Flow: INTRO → SLIDE 1–5 → QUIZ (5 questions) → RESULTS
 *
 * Key insight this mission teaches:
 * Most people think "pay on time = good credit."
 * But you can pay on time every month and still have a 620 score
 * because your utilization is high. THIS is the lever almost nobody knows.
 *
 * Addictive hooks:
 * - "You could add 40+ points THIS MONTH" hook in intro
 * - Interactive utilization calculator visual on slide 2
 * - "Statement date vs due date" revelation moment — genuinely surprises people
 * - Perfect score triggers gold rain + level-up check
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

const { width } = Dimensions.get('window');

// ─────────────────────────────────────────────
// Lesson slides
// ─────────────────────────────────────────────
const SLIDES = [
  {
    id: 1,
    icon: '💳',
    color: COLORS.primary,
    factor: 'What Is Utilization?',
    weight: 30,
    headline: 'Credit Utilization',
    subhead: '30% of your score — and the most controllable',
    body: 'Utilization is simply how much of your available credit you\'re using. If your card has a $5,000 limit and you carry a $1,500 balance, your utilization is 30%.\n\nIt\'s calculated both per card AND across all your cards combined. Both numbers matter.',
    visual: [
      { label: 'Under 10%',  value: 100, color: COLORS.success,      detail: 'Elite tier' },
      { label: '10 – 29%',   value: 78,  color: COLORS.scoreGood,    detail: 'Good' },
      { label: '30 – 49%',   value: 55,  color: COLORS.warning,      detail: 'Fair' },
      { label: '50 – 74%',   value: 32,  color: COLORS.scoreFair,    detail: 'Poor' },
      { label: '75%+',       value: 10,  color: COLORS.danger,       detail: 'Danger zone' },
    ],
    keyFact: '💡 Utilization resets every month when your statement closes. A bad month can be fixed in 30 days.',
    tip: 'Unlike a missed payment (7 years on your report), high utilization has zero memory. Pay it down and the damage disappears on your next statement.',
    xp: 25,
  },
  {
    id: 2,
    icon: '📅',
    color: COLORS.secondary,
    factor: 'The Secret: Statement Date',
    weight: 30,
    headline: 'Statement Date vs. Due Date',
    subhead: 'The most misunderstood rule in credit',
    body: 'Most people pay their card by the DUE DATE and think they\'re doing everything right. But by then it\'s too late — the damage is already done.\n\nYour balance is reported to the bureaus on your STATEMENT CLOSE DATE — usually 21–25 days BEFORE your payment is due.',
    visual: [
      { label: 'Statement closes (Jan 5)',  value: 100, color: COLORS.danger,  detail: '← Balance reported HERE' },
      { label: 'Payment due (Jan 26)',       value: 60,  color: COLORS.warning, detail: 'Paying here is too late' },
      { label: 'Pay before Jan 5',          value: 100, color: COLORS.success, detail: '← THIS is what to do' },
    ],
    keyFact: '💡 Log in to your card account and find your "statement closing date." Pay before that date — not before the due date.',
    tip: 'Call your bank and ask: "What date does my statement close each month?" Set a calendar reminder for 3 days before. This single habit can add 30–50 points.',
    xp: 25,
  },
  {
    id: 3,
    icon: '🎯',
    color: COLORS.success,
    factor: 'The 10% Sweet Spot',
    weight: 30,
    headline: 'Why Under 10% Is Elite',
    subhead: 'The scoring model rewards near-zero utilization',
    body: 'FICO scores are tiered. Going from 90% to 29% utilization is a big jump, but going from 29% to 9% is where the REAL score gains happen.\n\nThe model views 1%–9% as "you have credit, use it responsibly, and never need it." That signals maximum financial control.',
    visual: [
      { label: '90% → 30%',  value: 70,  color: COLORS.warning, detail: '+18 pts avg gain' },
      { label: '30% → 10%',  value: 85,  color: COLORS.scoreGood, detail: '+28 pts avg gain' },
      { label: '10% → 1%',   value: 100, color: COLORS.success,  detail: '+41 pts avg gain' },
    ],
    keyFact: '💡 Scoring models also penalize 0% utilization slightly — you need to show you USE credit, not just have it. 1–9% is the magic range.',
    tip: 'Put one small recurring charge (Netflix, Spotify) on a card with autopay for the full balance. This keeps utilization at 1–5% automatically every month.',
    xp: 25,
  },
  {
    id: 4,
    icon: '⚖️',
    color: COLORS.accent,
    factor: 'Per-Card vs. Total',
    weight: 30,
    headline: 'Every Card Is Judged Individually',
    subhead: 'One maxed card hurts even if your total is low',
    body: 'Say you have 3 cards:\n• Card A: $0 / $5,000 = 0%\n• Card B: $0 / $5,000 = 0%\n• Card C: $2,900 / $3,000 = 97%\n\nYour TOTAL utilization is only 27% — but Card C is maxed. The scoring model sees that and penalizes it.',
    visual: [
      { label: 'Card A (0%)',   value: 100, color: COLORS.success,  detail: 'Perfect' },
      { label: 'Card B (0%)',   value: 100, color: COLORS.success,  detail: 'Perfect' },
      { label: 'Card C (97%)',  value: 8,   color: COLORS.danger,   detail: '⚠️ Maxed' },
      { label: 'Total (27%)',   value: 72,  color: COLORS.warning,  detail: 'Misleading' },
    ],
    keyFact: '💡 Spreading a large purchase across multiple cards (if you have them) is better than maxing one card.',
    tip: 'If you can only pay down one card, pay down the one closest to its limit first — not the one with the highest balance.',
    xp: 25,
  },
  {
    id: 5,
    icon: '🚀',
    color: COLORS.warning,
    factor: 'The Credit Limit Hack',
    weight: 30,
    headline: 'Request a Limit Increase',
    subhead: 'Same balance, higher limit = lower utilization instantly',
    body: 'If your card has a $2,000 limit and a $800 balance, you\'re at 40%. If you call and request a limit increase to $4,000, you\'re suddenly at 20% — without paying a dollar.\n\nMost banks will approve an increase if you\'ve had the card 6+ months and have a good payment history.',
    visual: [
      { label: 'Before: $800/$2k', value: 40,  color: COLORS.danger,   detail: '40% utilization' },
      { label: 'After:  $800/$4k', value: 80,  color: COLORS.success,  detail: '20% utilization' },
      { label: 'After:  $800/$8k', value: 90,  color: COLORS.scoreExceptional, detail: '10% utilization' },
    ],
    keyFact: '💡 Request a limit increase online — many banks use a soft pull (no score impact). Avoid increases that require a hard pull unless the gain is worth it.',
    tip: 'American Express, Chase, and Discover often do automatic limit increases with no inquiry at all. Check your accounts — you may already have a higher limit you don\'t know about.',
    xp: 25,
  },
];

// ─────────────────────────────────────────────
// Quiz questions
// ─────────────────────────────────────────────
const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'Your credit card statement closes on the 8th of every month. When should you pay your balance to minimize utilization?',
    options: [
      'By the due date (usually the 28th)',
      'The last day of the month',
      'Before the 8th — before the statement closes',
      'It doesn\'t matter as long as you pay on time',
    ],
    correct: 2,
    explanation: 'Balances are reported on the statement close date, not the due date. Pay before the statement closes on the 8th and $0 gets reported to the bureaus.',
  },
  {
    id: 'q2',
    question: 'You have a $10,000 credit limit. What\'s the maximum balance you should carry to stay in the "elite" utilization tier?',
    options: ['$3,000 (30%)', '$1,000 (10%)', '$500 (5%)', '$2,500 (25%)'],
    correct: 1,
    explanation: 'Under 10% is the elite tier where the biggest score gains happen. On a $10,000 limit, that means keeping your balance under $1,000.',
  },
  {
    id: 'q3',
    question: 'You have 3 credit cards. Card A: 5%, Card B: 8%, Card C: 95%. Your total utilization is 22%. How does this affect your score?',
    options: [
      '22% total is fine — no problem',
      'Card C at 95% hurts your score even though total is 22%',
      'Only total utilization matters, not per-card',
      'Only Card C\'s limit matters, not the balance',
    ],
    correct: 1,
    explanation: 'FICO scores evaluate both total AND per-card utilization. Card C at 95% is a red flag regardless of your overall number. Pay it down first.',
  },
  {
    id: 'q4',
    question: 'What\'s the BEST strategy to lower your utilization without paying down debt?',
    options: [
      'Open a new credit card for more available credit',
      'Request a credit limit increase on an existing card',
      'Transfer balance to a personal loan',
      'Close cards with high limits',
    ],
    correct: 1,
    explanation: 'Requesting a limit increase on an existing card lowers your utilization ratio instantly — same balance, more available credit. Opening a new card also works but creates a hard inquiry and new account.',
  },
  {
    id: 'q5',
    question: 'True or False: Having a 0% utilization (no balance on any card) gives you the highest possible score.',
    options: [
      'True — zero balance is always best',
      'False — 0% can slightly hurt your score; 1–9% is optimal',
      'True — lenders love zero debt',
      'False — you need at least 30% to show you use credit',
    ],
    correct: 1,
    explanation: '0% utilization actually signals to lenders that you\'re not using your credit at all, which is slightly penalized. The sweet spot is 1–9% — it shows you use credit and manage it responsibly.',
  },
];

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
type Phase = 'intro' | 'lesson' | 'quiz' | 'results';

export default function MissionTwoScreen({ navigation }: any) {
  const addXP         = useGameStore((s) => s.addXP);
  const addFedgeCoins = useGameStore((s) => s.addFedgeCoins);
  const completeModule = useGameStore((s) => s.completeModule);

  const [phase, setPhase]               = useState<Phase>('intro');
  const [slideIndex, setSlideIndex]     = useState(0);
  const [quizIndex, setQuizIndex]       = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizAnswers, setQuizAnswers]   = useState<boolean[]>([]);
  const [xpEarned, setXpEarned]         = useState(0);

  // Animations
  const fadeAnim        = useRef(new Animated.Value(0)).current;
  const slideAnim       = useRef(new Animated.Value(40)).current;
  const shakeAnim       = useRef(new Animated.Value(0)).current;
  const progressAnim    = useRef(new Animated.Value(0)).current;
  const celebrationScale   = useRef(new Animated.Value(0)).current;
  const celebrationOpacity = useRef(new Animated.Value(0)).current;
  const confettiAnims = Array.from({ length: 12 }, () => ({
    opacity: useRef(new Animated.Value(0)).current,
    y:       useRef(new Animated.Value(0)).current,
    x:       useRef(new Animated.Value((Math.random() - 0.5) * width * 0.8)).current,
  }));

  const totalSteps  = SLIDES.length + QUIZ_QUESTIONS.length;
  const currentStep =
    phase === 'intro'  ? 0 :
    phase === 'lesson' ? slideIndex + 1 :
    phase === 'quiz'   ? SLIDES.length + quizIndex + 1 :
    totalSteps;

  useEffect(() => {
    animateIn();
    Animated.spring(progressAnim, {
      toValue: currentStep / totalSteps,
      tension: 60, friction: 10, useNativeDriver: false,
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
      Animated.timing(shakeAnim, { toValue: 12,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleSlideNext = () => {
    const earned = SLIDES[slideIndex].xp;
    addXP(earned);
    setXpEarned((p) => p + earned);
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
    setQuizAnswers((prev) => [...prev, correct]);
    if (correct) {
      addXP(XP.QUIZ_PASS);
      setXpEarned((p) => p + XP.QUIZ_PASS);
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
    const finalCorrect = correctCount + (answeredCorrectly ? 1 : 0);
    const perfect      = finalCorrect === QUIZ_QUESTIONS.length;
    const bonusXp      = perfect ? XP.QUIZ_PERFECT : 0;
    const totalXp      = xpEarned + XP.MODULE_COMPLETE + bonusXp;

    addXP(XP.MODULE_COMPLETE + bonusXp);
    addFedgeCoins(FEDGE_COINS.LESSON_COMPLETE * 2);
    completeModule('mission_2_utilization');
    setXpEarned(totalXp);
    setPhase('results');

    Animated.sequence([
      Animated.parallel([
        Animated.spring(celebrationScale,   { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
        Animated.timing(celebrationOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
    ]).start();

    confettiAnims.forEach((c, i) => {
      Animated.sequence([
        Animated.delay(i * 70),
        Animated.parallel([
          Animated.timing(c.opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(c.y, { toValue: -500, duration: 1600, useNativeDriver: true }),
        ]),
        Animated.timing(c.opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    });
  };

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const slide    = SLIDES[slideIndex];
  const question = QUIZ_QUESTIONS[quizIndex];
  const finalCorrect = quizAnswers.filter(Boolean).length;
  const isPerfect    = finalCorrect === QUIZ_QUESTIONS.length;

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
          },
        ]} />
      ))}

      {/* ── TOP BAR ── */}
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

      {/* ── INTRO ── */}
      {phase === 'intro' && (
        <Animated.View style={[styles.phaseContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <ScrollView contentContainerStyle={styles.introScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.missionLabel}>MISSION 2</Text>
            <Text style={styles.missionTitle}>Utilization{'\n'}Mastery</Text>

            {/* Hook */}
            <View style={styles.hookCard}>
              <Text style={styles.hookEmoji}>⚡</Text>
              <Text style={styles.hookText}>
                Most people pay on time every month and still have a 620 score. This mission explains exactly why — and how to fix it THIS month.
              </Text>
            </View>

            <Text style={styles.missionDesc}>
              Credit utilization is 30% of your score and the MOST controllable factor. Unlike payment history (7-year memory), utilization resets every 30 days. One smart move can add 40+ points in a single billing cycle.
            </Text>

            <View style={styles.factorPreviewList}>
              {SLIDES.map((s) => (
                <View key={s.id} style={[styles.factorPreviewRow, { borderColor: s.color + '40' }]}>
                  <Text style={styles.factorPreviewIcon}>{s.icon}</Text>
                  <Text style={[styles.factorPreviewName, { color: s.color }]}>{s.factor}</Text>
                </View>
              ))}
            </View>

            <View style={styles.missionMeta}>
              <View style={styles.missionMetaItem}>
                <Text style={styles.metaValue}>6 min</Text>
                <Text style={styles.metaLabel}>Read time</Text>
              </View>
              <View style={styles.missionMetaItem}>
                <Text style={styles.metaValue}>5</Text>
                <Text style={styles.metaLabel}>Quiz Qs</Text>
              </View>
              <View style={styles.missionMetaItem}>
                <Text style={[styles.metaValue, { color: COLORS.primary }]}>
                  +{SLIDES.reduce((a, s) => a + s.xp, 0) + XP.MODULE_COMPLETE} XP
                </Text>
                <Text style={styles.metaLabel}>Reward</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.startBtn} onPress={() => setPhase('lesson')}>
              <Text style={styles.startBtnText}>Start Mission →</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      )}

      {/* ── LESSON SLIDE ── */}
      {phase === 'lesson' && (
        <Animated.View style={[styles.phaseContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <ScrollView contentContainerStyle={styles.lessonScroll} showsVerticalScrollIndicator={false}>
            <View style={[styles.factorBadge, { backgroundColor: slide.color + '20', borderColor: slide.color + '50' }]}>
              <Text style={styles.factorBadgeIcon}>{slide.icon}</Text>
              <Text style={[styles.factorBadgeName, { color: slide.color }]}>{slide.factor}</Text>
              <Text style={[styles.factorBadgeWeight, { color: slide.color }]}>30% of score</Text>
            </View>

            <Text style={styles.lessonHeadline}>{slide.headline}</Text>
            <Text style={styles.lessonSubhead}>{slide.subhead}</Text>
            <Text style={styles.lessonBody}>{slide.body}</Text>

            {/* Visual bar chart */}
            <View style={styles.visualCard}>
              <Text style={styles.visualTitle}>Score Impact by Utilization Level</Text>
              {slide.visual.map((v, i) => (
                <View key={i} style={styles.visualRow}>
                  <Text style={styles.visualLabel}>{v.label}</Text>
                  <View style={styles.visualBarTrack}>
                    <View style={[styles.visualBarFill, { width: `${v.value}%`, backgroundColor: v.color }]} />
                  </View>
                  <Text style={[styles.visualDetail, { color: v.color }]}>{v.detail}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.keyFactCard, { borderColor: slide.color + '50', backgroundColor: slide.color + '10' }]}>
              <Text style={styles.keyFactText}>{slide.keyFact}</Text>
            </View>

            <View style={styles.tipCard}>
              <Text style={styles.tipLabel}>PRO TIP</Text>
              <Text style={styles.tipText}>{slide.tip}</Text>
            </View>

            <Text style={styles.slideCounter}>{slideIndex + 1} of {SLIDES.length}</Text>

            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: slide.color }]}
              onPress={handleSlideNext}
            >
              <Text style={styles.nextBtnText}>
                {slideIndex < SLIDES.length - 1
                  ? `Next: ${SLIDES[slideIndex + 1].factor} →`
                  : 'Start Quiz →'}
              </Text>
              <Text style={styles.nextBtnXP}>+{slide.xp} XP</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      )}

      {/* ── QUIZ ── */}
      {phase === 'quiz' && (
        <Animated.View style={[
          styles.phaseContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { translateX: shakeAnim }] },
        ]}>
          <ScrollView contentContainerStyle={styles.quizScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.quizLabel}>QUESTION {quizIndex + 1} OF {QUIZ_QUESTIONS.length}</Text>
            <Text style={styles.quizQuestion}>{question.question}</Text>

            <View style={styles.optionsContainer}>
              {question.options.map((option, idx) => {
                let optionStyle = styles.option;
                let textStyle   = styles.optionText;
                if (selectedAnswer !== null) {
                  if (idx === question.correct) {
                    optionStyle = { ...styles.option, ...styles.optionCorrect };
                    textStyle   = { ...styles.optionText, color: COLORS.bg };
                  } else if (idx === selectedAnswer && idx !== question.correct) {
                    optionStyle = { ...styles.option, ...styles.optionWrong };
                    textStyle   = { ...styles.optionText, color: COLORS.bg };
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
                            : idx === selectedAnswer  ? '✗'
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

            {selectedAnswer !== null && (
              <Animated.View style={[
                styles.explanationCard,
                {
                  borderColor: answeredCorrectly ? COLORS.success + '60' : COLORS.danger + '60',
                  backgroundColor: answeredCorrectly ? COLORS.success + '10' : COLORS.danger + '10',
                },
              ]}>
                <Text style={[styles.explanationHeader, { color: answeredCorrectly ? COLORS.success : COLORS.danger }]}>
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

      {/* ── RESULTS ── */}
      {phase === 'results' && (
        <ScrollView contentContainerStyle={styles.resultsScroll} showsVerticalScrollIndicator={false}>
          <Animated.View style={[
            styles.resultsCard,
            { opacity: celebrationOpacity, transform: [{ scale: celebrationScale }] },
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
            </View>

            <View style={styles.learnedCard}>
              <Text style={styles.learnedTitle}>You now know:</Text>
              {SLIDES.map((s) => (
                <View key={s.id} style={styles.learnedRow}>
                  <Text style={[styles.learnedCheck, { color: s.color }]}>✓</Text>
                  <Text style={styles.learnedText}>{s.factor}</Text>
                </View>
              ))}
            </View>

            <View style={styles.nextMissionCard}>
              <Text style={styles.nextMissionLabel}>🔓 UNLOCKED</Text>
              <Text style={styles.nextMissionTitle}>Mission 3: Dispute Like a Pro</Text>
              <Text style={styles.nextMissionDesc}>79% of reports have errors — learn to find and remove them</Text>
            </View>

            <TouchableOpacity style={styles.doneBtn} onPress={() => navigation?.goBack?.()}>
              <Text style={styles.doneBtnText}>Back to Missions →</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────
// Styles (mirrors MissionOneScreen for consistency)
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  confetti: {
    position: 'absolute', bottom: '50%', left: '50%',
    width: 10, height: 10, borderRadius: 2, zIndex: 50,
  },
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
  progressFill: { height: '100%', backgroundColor: COLORS.secondary, borderRadius: RADIUS.pill },
  xpBadge: {
    backgroundColor: COLORS.secondary + '20', borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm, paddingVertical: 3,
    borderWidth: 1, borderColor: COLORS.secondary + '40',
  },
  xpBadgeText: { fontSize: FONTS.sizes.xs, fontWeight: '800', color: COLORS.secondary },
  phaseContainer: { flex: 1 },

  // Intro
  introScroll: { paddingHorizontal: SPACING.lg, paddingBottom: 40 },
  missionLabel: { fontSize: FONTS.sizes.xs, color: COLORS.secondary, letterSpacing: 3, marginBottom: SPACING.xs },
  missionTitle: { fontSize: FONTS.sizes.hero, fontWeight: '900', color: COLORS.textPrimary, marginBottom: SPACING.md, lineHeight: 52 },
  hookCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm,
    backgroundColor: COLORS.secondary + '12',
    borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.secondary + '40',
    marginBottom: SPACING.md,
  },
  hookEmoji: { fontSize: 24 },
  hookText: { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.secondary, fontWeight: '700', lineHeight: 20 },
  missionDesc: { fontSize: FONTS.sizes.md, color: COLORS.textSecondary, lineHeight: 24, marginBottom: SPACING.xl },
  factorPreviewList: { gap: SPACING.sm, marginBottom: SPACING.xl },
  factorPreviewRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1,
  },
  factorPreviewIcon: { fontSize: 24 },
  factorPreviewName: { fontSize: FONTS.sizes.md, fontWeight: '800', flex: 1 },
  missionMeta: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.xl,
  },
  missionMetaItem: { alignItems: 'center' },
  metaValue: { fontSize: FONTS.sizes.xl, fontWeight: '900', color: COLORS.textPrimary },
  metaLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  startBtn: {
    backgroundColor: COLORS.secondary, borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md + 2, alignItems: 'center',
    shadowColor: COLORS.secondary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 8,
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
  visualLabel: { width: 96, fontSize: FONTS.sizes.xs, color: COLORS.textSecondary },
  visualBarTrack: { flex: 1, height: 8, backgroundColor: COLORS.bgCardAlt, borderRadius: RADIUS.pill, overflow: 'hidden' },
  visualBarFill: { height: '100%', borderRadius: RADIUS.pill },
  visualDetail: { width: 72, fontSize: FONTS.sizes.xs, fontWeight: '700', textAlign: 'right' },
  keyFactCard: { borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, marginBottom: SPACING.md },
  keyFactText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 20 },
  tipCard: {
    backgroundColor: COLORS.bgCardAlt, borderRadius: RADIUS.md, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.lg,
  },
  tipLabel: { fontSize: FONTS.sizes.xs, color: COLORS.secondary, letterSpacing: 2, fontWeight: '800', marginBottom: SPACING.xs },
  tipText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 20 },
  slideCounter: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, textAlign: 'center', marginBottom: SPACING.sm },
  nextBtn: { borderRadius: RADIUS.pill, paddingVertical: SPACING.md + 2, alignItems: 'center', gap: 4 },
  nextBtnText: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.bg },
  nextBtnXP: { fontSize: FONTS.sizes.xs, color: COLORS.bg + 'CC' },

  // Quiz
  quizScroll: { paddingHorizontal: SPACING.lg, paddingBottom: 40 },
  quizLabel: { fontSize: FONTS.sizes.xs, color: COLORS.secondary, letterSpacing: 3, marginBottom: SPACING.sm },
  quizQuestion: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.textPrimary, lineHeight: 30, marginBottom: SPACING.xl },
  optionsContainer: { gap: SPACING.sm, marginBottom: SPACING.md },
  option: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  optionCorrect: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  optionWrong:   { backgroundColor: COLORS.danger,  borderColor: COLORS.danger },
  optionDimmed:  { opacity: 0.4 },
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
  explanationText:   { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 20 },
  continueBtn:     { borderRadius: RADIUS.pill, paddingVertical: SPACING.md, alignItems: 'center' },
  continueBtnText: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.bg },

  // Results
  resultsScroll: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: 60, alignItems: 'center' },
  resultsCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: SPACING.xl,
    borderWidth: 1, borderColor: COLORS.secondary + '40', width: '100%', alignItems: 'center',
    ...SHADOWS.gold,
  },
  resultsEmoji:  { fontSize: 72, marginBottom: SPACING.md },
  resultsTitle:  { fontSize: FONTS.sizes.xxl, fontWeight: '900', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  resultsScore:  { fontSize: FONTS.sizes.lg, color: COLORS.textSecondary, marginBottom: SPACING.xl },
  resultsRewards: {
    flexDirection: 'row', justifyContent: 'space-around', width: '100%',
    backgroundColor: COLORS.bgCardAlt, borderRadius: RADIUS.lg, padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  resultsRewardItem:    { alignItems: 'center' },
  resultsRewardValue:   { fontSize: FONTS.sizes.xl, fontWeight: '900', color: COLORS.primary },
  resultsRewardLabel:   { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  resultsRewardDivider: { width: 1, backgroundColor: COLORS.border },
  learnedCard:  { width: '100%', gap: SPACING.sm, marginBottom: SPACING.xl },
  learnedTitle: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  learnedRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  learnedCheck: { fontSize: FONTS.sizes.md, fontWeight: '900', width: 20 },
  learnedText:  { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, flex: 1, lineHeight: 20 },
  nextMissionCard: {
    backgroundColor: COLORS.secondary + '15', borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.secondary + '40', width: '100%',
    marginBottom: SPACING.xl, alignItems: 'center',
  },
  nextMissionLabel: { fontSize: FONTS.sizes.xs, color: COLORS.secondary, letterSpacing: 2, fontWeight: '800', marginBottom: 4 },
  nextMissionTitle: { fontSize: FONTS.sizes.lg, fontWeight: '900', color: COLORS.textPrimary },
  nextMissionDesc:  { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  doneBtn: {
    width: '100%', backgroundColor: COLORS.secondary, borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md + 2, alignItems: 'center',
    shadowColor: COLORS.secondary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 8,
  },
  doneBtnText: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.bg },
});
