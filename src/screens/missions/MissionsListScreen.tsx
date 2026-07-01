import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@constants/theme';
import { useGameStore } from '@store/gameStore';
import { XP, FEDGE_COINS } from '@constants/gameConfig';
import { IMAGES } from '@assets/index';

const MISSIONS = [
  {
    id: 'mission_1_five_factors',
    number: 1,
    title: 'The 5 Factors',
    subtitle: 'Master the FICO formula',
    description: 'Learn exactly what determines your credit score and how each factor impacts it.',
    icon: '🎯',
    npcImage: IMAGES.npcDiana,
    npcName: 'Diana Wells',
    npcRole: 'Credit Counselor',
    color: COLORS.primary,
    glowColor: COLORS.primaryGlow,
    xpReward: 450,
    coinReward: FEDGE_COINS.LESSON_COMPLETE * 2,
    duration: '5 min',
    quizCount: 5,
    requiredMissions: [],
    screen: 'MissionOne',
  },
  {
    id: 'mission_2_utilization',
    number: 2,
    title: 'Utilization Mastery',
    subtitle: 'The fastest score booster',
    description: 'The secret weapon most people ignore. Learn how to use credit utilization to add 40+ points fast.',
    icon: '💳',
    npcImage: IMAGES.npcPriya,
    npcName: 'Priya Singh',
    npcRole: 'Mortgage Officer',
    color: COLORS.secondary,
    glowColor: COLORS.secondary + '40',
    xpReward: 500,
    coinReward: 30,
    duration: '6 min',
    quizCount: 5,
    requiredMissions: ['mission_1_five_factors'],
    screen: 'MissionTwo',
  },
  {
    id: 'mission_3_dispute',
    number: 3,
    title: 'Dispute Like a Pro',
    subtitle: 'Remove errors from your report',
    description: '79% of credit reports have errors. Learn how to find them and dispute them for free.',
    icon: '⚖️',
    npcImage: IMAGES.npcMarcus,
    npcName: 'Marcus Reed',
    npcRole: 'Debt Collector',
    color: COLORS.accent,
    glowColor: COLORS.accent + '40',
    xpReward: 600,
    coinReward: 40,
    duration: '7 min',
    quizCount: 6,
    requiredMissions: ['mission_2_utilization'],
    screen: null,
  },
  {
    id: 'mission_4_rebuild',
    number: 4,
    title: 'Rebuild From Zero',
    subtitle: 'Secured cards & AU strategy',
    description: 'The proven 90-day blueprint to go from no credit to a 680+ score.',
    icon: '🏗️',
    npcImage: null,
    npcName: null,
    npcRole: null,
    color: COLORS.success,
    glowColor: COLORS.success + '40',
    xpReward: 700,
    coinReward: 50,
    duration: '8 min',
    quizCount: 6,
    requiredMissions: ['mission_3_dispute'],
    screen: null,
  },
  {
    id: 'mission_5_advanced',
    number: 5,
    title: 'The 800 Club',
    subtitle: 'Elite credit strategies',
    description: 'What separates a 750 from an 800. The exact moves to join the credit elite.',
    icon: '🏆',
    npcImage: IMAGES.npcAlgorithm,
    npcName: 'The Algorithm',
    npcRole: 'Final Boss',
    color: COLORS.warning,
    glowColor: COLORS.warning + '40',
    xpReward: 1000,
    coinReward: 100,
    duration: '10 min',
    quizCount: 8,
    requiredMissions: ['mission_4_rebuild'],
    screen: null,
  },
];

function MissionCard({
  mission,
  isCompleted,
  isUnlocked,
  onPress,
  index,
}: {
  mission: typeof MISSIONS[0];
  isCompleted: boolean;
  isUnlocked: boolean;
  onPress: () => void;
  index: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 400, delay: index * 100, useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0, tension: 70, friction: 10, delay: index * 100, useNativeDriver: true,
      }),
    ]).start();

    let pulse: Animated.CompositeAnimation | null = null;
    if (isUnlocked && !isCompleted) {
      pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.02, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ])
      );
      pulse.start();
    }
    return () => { pulse?.stop(); };
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: pulseAnim }] }}>
      <TouchableOpacity
        style={[
          styles.missionCard,
          isCompleted && styles.missionCardCompleted,
          isUnlocked && !isCompleted && { borderColor: mission.color + '60', ...SHADOWS.primary },
          !isUnlocked && styles.missionCardLocked,
        ]}
        onPress={onPress}
        activeOpacity={isUnlocked ? 0.85 : 0.6}
      >
        {isUnlocked && !isCompleted && (
          <View style={[styles.cardGlow, { backgroundColor: mission.color + '08' }]} />
        )}

        {/* Left: NPC portrait or icon */}
        <View style={[
          styles.missionIconWrap,
          { backgroundColor: isUnlocked ? mission.color + '20' : COLORS.bgCardAlt },
          isCompleted && { backgroundColor: COLORS.success + '20' },
        ]}>
          {mission.npcImage && isUnlocked && !isCompleted ? (
            <Image
              source={mission.npcImage as ImageSourcePropType}
              style={styles.npcPortrait}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.missionIcon}>
              {isCompleted ? '✅' : isUnlocked ? mission.icon : '🔒'}
            </Text>
          )}
        </View>

        {/* Center: info */}
        <View style={styles.missionInfo}>
          <View style={styles.missionTopRow}>
            <Text style={styles.missionNumber}>MISSION {mission.number}</Text>
            {isCompleted && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>DONE</Text>
              </View>
            )}
            {!isUnlocked && (
              <View style={styles.lockedBadge}>
                <Text style={styles.lockedBadgeText}>🔒 LOCKED</Text>
              </View>
            )}
          </View>
          <Text style={[
            styles.missionTitle,
            isCompleted && { color: COLORS.textSecondary },
            !isUnlocked && { color: COLORS.textMuted },
          ]}>
            {mission.title}
          </Text>
          {mission.npcName && isUnlocked && (
            <Text style={[styles.npcLabel, { color: mission.color }]}>
              with {mission.npcName}
            </Text>
          )}
          <Text style={styles.missionSubtitle}>{mission.subtitle}</Text>
          <View style={styles.missionMeta}>
            <View style={styles.metaPill}>
              <Text style={styles.metaPillText}>⏱ {mission.duration}</Text>
            </View>
            <View style={styles.metaPill}>
              <Text style={styles.metaPillText}>❓ {mission.quizCount} Q</Text>
            </View>
            <View style={[styles.metaPill, { backgroundColor: COLORS.primary + '20', borderColor: COLORS.primary + '40' }]}>
              <Text style={[styles.metaPillText, { color: COLORS.primary }]}>+{mission.xpReward} XP</Text>
            </View>
          </View>
        </View>

        {isUnlocked && (
          <Text style={[styles.chevron, { color: isCompleted ? COLORS.success : mission.color }]}>
            {isCompleted ? '↩' : '→'}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function MissionsListScreen({ navigation }: any) {
  const completedModules = useGameStore((s) => s.completedModules);
  const xp = useGameStore((s) => s.xp);
  const level = useGameStore((s) => s.level);

  const totalCompleted = MISSIONS.filter((m) => completedModules.includes(m.id)).length;
  const progressPct = totalCompleted / MISSIONS.length;

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleMissionPress = (mission: typeof MISSIONS[0], isUnlocked: boolean) => {
    if (!isUnlocked) return;
    if (mission.screen) {
      navigation.navigate('MissionIntro', { missionKey: mission.screen });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── HEADER ─────────────────────────── */}
        <Animated.View style={[styles.header, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
          <Text style={styles.headerLabel}>YOUR JOURNEY</Text>
          <Text style={styles.headerTitle}>Missions</Text>

          <View style={styles.overallProgress}>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, { width: `${progressPct * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>{totalCompleted}/{MISSIONS.length} complete</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{totalCompleted}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: COLORS.primary }]}>Lv {level}</Text>
              <Text style={styles.statLabel}>Current Level</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: COLORS.secondary }]}>{xp.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── CHARACTER ROSTER ───────────────── */}
        <View style={styles.rosterWrap}>
          <Text style={styles.rosterLabel}>CHARACTERS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rosterRow}>
            {[
              { image: IMAGES.hero, name: 'You', role: 'Hero' },
              { image: IMAGES.npcDiana, name: 'Diana', role: 'Counselor' },
              { image: IMAGES.npcPriya, name: 'Priya', role: 'Mortgage' },
              { image: IMAGES.npcMarcus, name: 'Marcus', role: 'Collector' },
              { image: IMAGES.npcAlgorithm, name: 'Algorithm', role: 'Boss' },
            ].map((char, i) => (
              <View key={i} style={styles.rosterCard}>
                <Image source={char.image} style={styles.rosterImage} resizeMode="cover" />
                <Text style={styles.rosterName}>{char.name}</Text>
                <Text style={styles.rosterRole}>{char.role}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── MISSION LIST ───────────────────── */}
        <View style={styles.missionList}>
          {MISSIONS.map((mission, index) => {
            const isCompleted = completedModules.includes(mission.id);
            const prereqsMet = mission.requiredMissions.every((r) => completedModules.includes(r));
            const isUnlocked = prereqsMet;

            return (
              <MissionCard
                key={mission.id}
                mission={mission}
                isCompleted={isCompleted}
                isUnlocked={isUnlocked}
                onPress={() => handleMissionPress(mission, isUnlocked)}
                index={index}
              />
            );
          })}
        </View>

        {/* ── REAL LIFE SCENARIOS ────────────── */}
        <TouchableOpacity
          style={styles.scenarioCard}
          onPress={() => navigation.navigate('Scenarios', { chapterId: 'mission_1_five_factors' })}
          activeOpacity={0.85}
        >
          <View style={styles.scenarioLeft}>
            <Text style={styles.scenarioEmoji}>🎭</Text>
          </View>
          <View style={styles.scenarioInfo}>
            <Text style={styles.scenarioLabel}>SIMULATION MODE</Text>
            <Text style={styles.scenarioTitle}>Real Life Scenarios</Text>
            <Text style={styles.scenarioDesc}>
              Missed payments, maxed cards, closing old accounts — live through real credit decisions and see the score impact instantly.
            </Text>
            <View style={styles.scenarioPills}>
              <View style={styles.scenarioPill}><Text style={styles.scenarioPillText}>6 Scenarios</Text></View>
              <View style={[styles.scenarioPill, { backgroundColor: COLORS.accent + '20', borderColor: COLORS.accent + '40' }]}>
                <Text style={[styles.scenarioPillText, { color: COLORS.accent }]}>+750 XP</Text>
              </View>
            </View>
          </View>
          <Text style={[styles.chevron, { color: COLORS.accent }]}>→</Text>
        </TouchableOpacity>

        {/* ── COMING SOON ────────────────────── */}
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonEmoji}>🚀</Text>
          <Text style={styles.comingSoonTitle}>More missions coming soon</Text>
          <Text style={styles.comingSoonDesc}>
            Advanced topics: mortgage optimization, business credit, credit repair secrets, and more.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingBottom: 40 },

  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
    paddingBottom: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  headerLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
    letterSpacing: 3,
    fontWeight: '800',
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONTS.sizes.hero,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },

  overallProgress: { gap: SPACING.xs, marginBottom: SPACING.lg },
  progressTrack: {
    height: 8,
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
  },
  progressText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    fontWeight: '700',
  },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statBox: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: FONTS.sizes.xl, fontWeight: '900', color: COLORS.textPrimary },
  statLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: COLORS.border },

  // Character roster
  rosterWrap: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  rosterLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    fontWeight: '800',
    letterSpacing: 2,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  rosterRow: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  rosterCard: {
    alignItems: 'center',
    gap: 4,
  },
  rosterImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  rosterName: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  rosterRole: {
    fontSize: 9,
    color: COLORS.textMuted,
  },

  missionList: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },

  missionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: SPACING.md,
    overflow: 'hidden',
  },
  missionCardCompleted: {
    borderColor: COLORS.success + '40',
    backgroundColor: COLORS.success + '08',
  },
  missionCardLocked: {
    opacity: 0.6,
  },
  cardGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS.xl,
  },
  missionIconWrap: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  npcPortrait: {
    width: 60,
    height: 60,
  },
  missionIcon: { fontSize: 28 },

  missionInfo: { flex: 1, gap: 3 },
  missionTopRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 2 },
  missionNumber: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    fontWeight: '800',
    letterSpacing: 1,
  },
  completedBadge: {
    backgroundColor: COLORS.success + '20',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: COLORS.success + '40',
  },
  completedBadgeText: { fontSize: 9, fontWeight: '900', color: COLORS.success },
  lockedBadge: {
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  lockedBadgeText: { fontSize: 9, fontWeight: '700', color: COLORS.textMuted },

  missionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  npcLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  missionSubtitle: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },

  missionMeta: { flexDirection: 'row', gap: SPACING.xs, flexWrap: 'wrap' },
  metaPill: {
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metaPillText: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted },

  chevron: {
    fontSize: 22,
    fontWeight: '800',
    flexShrink: 0,
    paddingRight: SPACING.xs,
  },

  scenarioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.accent + '50',
    gap: SPACING.md,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  scenarioLeft: {
    width: 56, height: 56,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.accent + '20',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  scenarioEmoji: { fontSize: 28 },
  scenarioInfo: { flex: 1, gap: 3 },
  scenarioLabel: { fontSize: FONTS.sizes.xs, color: COLORS.accent, fontWeight: '800', letterSpacing: 1 },
  scenarioTitle: { fontSize: FONTS.sizes.lg, fontWeight: '900', color: COLORS.textPrimary },
  scenarioDesc: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, lineHeight: 17, marginTop: 2, marginBottom: SPACING.xs },
  scenarioPills: { flexDirection: 'row', gap: SPACING.xs },
  scenarioPill: {
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm, paddingVertical: 2,
    borderWidth: 1, borderColor: COLORS.border,
  },
  scenarioPillText: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted },

  comingSoon: {
    marginTop: SPACING.xl,
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  comingSoonEmoji: { fontSize: 40, marginBottom: SPACING.sm },
  comingSoonTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  comingSoonDesc: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
