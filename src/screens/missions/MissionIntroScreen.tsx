/**
 * FEDGE 2.O — Cinematic Mission Intro
 * Full-screen dramatic reveal before each mission.
 * NPC slides in, mission title types out, then launches the mission.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS } from '@constants/theme';
import { MissionsStackParamList } from '@navigation/MissionsNavigator';
import { IMAGES } from '@assets/index';

const { width, height } = Dimensions.get('window');

type MissionConfig = {
  id: string;
  title: string;
  subtitle: string;
  briefing: string;
  npcName: string;
  npcRole: string;
  npcImage: any;
  accentColor: string;
  icon: string;
  targetScreen: keyof MissionsStackParamList;
};

const MISSION_CONFIGS: Record<string, MissionConfig> = {
  MissionOne: {
    id: 'M1',
    title: 'The 5 Factors',
    subtitle: 'Master the FICO Formula',
    briefing: 'Your credit score is controlled by exactly 5 factors. Learn them, master them — and watch your score climb.',
    npcName: 'Diana Wells',
    npcRole: 'Senior Credit Counselor',
    npcImage: IMAGES.npcDiana,
    accentColor: COLORS.primary,
    icon: '📊',
    targetScreen: 'MissionOne',
  },
  MissionTwo: {
    id: 'M2',
    title: 'Utilization Mastery',
    subtitle: 'The Fastest Score Booster',
    briefing: 'One factor alone can add 40+ points in 30 days. Priya Singh will show you exactly how to weaponize it.',
    npcName: 'Priya Singh',
    npcRole: 'Mortgage Specialist',
    npcImage: IMAGES.npcPriya,
    accentColor: COLORS.warning,
    icon: '⚡',
    targetScreen: 'MissionTwo',
  },
};

type Props = {
  navigation: NativeStackNavigationProp<MissionsStackParamList, 'MissionIntro'>;
  route: RouteProp<MissionsStackParamList, 'MissionIntro'>;
};

export default function MissionIntroScreen({ navigation, route }: Props) {
  const { missionKey } = route.params as { missionKey: string };
  const config = MISSION_CONFIGS[missionKey] ?? MISSION_CONFIGS.MissionOne;

  // Animations
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const scanLine = useRef(new Animated.Value(-height)).current;
  const npcSlide = useRef(new Animated.Value(width)).current;
  const npcOpacity = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const badgeSlide = useRef(new Animated.Value(-60)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(30)).current;
  const briefingOpacity = useRef(new Animated.Value(0)).current;
  const ctaOpacity = useRef(new Animated.Value(0)).current;
  const ctaScale = useRef(new Animated.Value(0.8)).current;
  const glowPulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Glow pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0.4, duration: 1200, useNativeDriver: true }),
      ])
    ).start();

    // Main cinematic sequence
    Animated.sequence([
      // 1. Background fades in
      Animated.timing(bgOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),

      // 2. Scan line sweeps down (cinematic reveal)
      Animated.timing(scanLine, { toValue: height * 1.5, duration: 600, useNativeDriver: true }),

      // 3. NPC slides in from right
      Animated.parallel([
        Animated.spring(npcSlide, { toValue: 0, tension: 50, friction: 9, useNativeDriver: true }),
        Animated.timing(npcOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),

      Animated.delay(200),

      // 4. Dark overlay + mission badge slides in
      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(badgeSlide, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
      ]),

      Animated.delay(150),

      // 5. Mission title + briefing fade in
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(titleSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),

      Animated.delay(200),
      Animated.timing(briefingOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(300),

      // 6. CTA button pops in
      Animated.parallel([
        Animated.spring(ctaScale, { toValue: 1, tension: 100, friction: 7, useNativeDriver: true }),
        Animated.timing(ctaOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const launchMission = () => {
    navigation.replace(config.targetScreen as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Dark background */}
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.darkBg, { opacity: bgOpacity }]} />

      {/* Accent color glow */}
      <Animated.View
        style={[
          styles.glow,
          { backgroundColor: config.accentColor, opacity: glowPulse },
        ]}
      />

      {/* NPC portrait */}
      <Animated.View
        style={[
          styles.npcContainer,
          { opacity: npcOpacity, transform: [{ translateX: npcSlide }] },
        ]}
      >
        <Image source={config.npcImage} style={styles.npcImage} resizeMode="cover" />
        {/* Gradient overlay on NPC */}
        <View style={styles.npcGradient} />
      </Animated.View>

      {/* Cinematic scan line */}
      <Animated.View
        style={[styles.scanLine, { transform: [{ translateY: scanLine }] }]}
      />

      {/* Dark overlay for text readability */}
      <Animated.View style={[styles.textOverlay, { opacity: overlayOpacity }]} />

      {/* Content */}
      <View style={styles.content}>
        {/* Mission badge */}
        <Animated.View
          style={[styles.badge, { transform: [{ translateY: badgeSlide }], borderColor: config.accentColor }]}
        >
          <Text style={styles.badgeIcon}>{config.icon}</Text>
          <Text style={[styles.badgeId, { color: config.accentColor }]}>MISSION {config.id}</Text>
        </Animated.View>

        {/* NPC identity */}
        <Animated.View style={[styles.npcIdentity, { transform: [{ translateY: badgeSlide }] }]}>
          <Text style={styles.npcName}>{config.npcName}</Text>
          <Text style={[styles.npcRole, { color: config.accentColor }]}>{config.npcRole}</Text>
        </Animated.View>

        {/* Mission title */}
        <Animated.View style={{ opacity: titleOpacity, transform: [{ translateY: titleSlide }] }}>
          <Text style={styles.missionTitle}>{config.title}</Text>
          <Text style={[styles.missionSubtitle, { color: config.accentColor }]}>{config.subtitle}</Text>
        </Animated.View>

        {/* Divider */}
        <Animated.View style={[styles.divider, { backgroundColor: config.accentColor, opacity: briefingOpacity }]} />

        {/* Briefing */}
        <Animated.Text style={[styles.briefing, { opacity: briefingOpacity }]}>
          "{config.briefing}"
        </Animated.Text>

        {/* CTA */}
        <Animated.View style={{ opacity: ctaOpacity, transform: [{ scale: ctaScale }] }}>
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: config.accentColor }]}
            onPress={launchMission}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>Accept Mission →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.skipText}>← Back to Missions</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  darkBg: { backgroundColor: '#050510' },
  glow: {
    position: 'absolute', bottom: -200, right: -100,
    width: 500, height: 500, borderRadius: 250,
    opacity: 0.12,
  },
  npcContainer: {
    position: 'absolute', right: -40, bottom: 0,
    width: width * 0.85, height: height * 0.75,
  },
  npcImage: { width: '100%', height: '100%' },
  npcGradient: {
    position: 'absolute', top: 0, left: 0, bottom: 0, width: '50%',
    backgroundColor: '#050510',
  },
  scanLine: {
    position: 'absolute', left: 0, right: 0,
    height: 2, backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary, shadowOpacity: 1, shadowRadius: 8,
    elevation: 10,
  },
  textOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,5,16,0.7)',
  },
  content: {
    flex: 1, paddingHorizontal: SPACING.xl, paddingTop: 80, paddingBottom: 48,
    justifyContent: 'flex-end',
  },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    borderWidth: 1, borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    alignSelf: 'flex-start', marginBottom: SPACING.lg,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  badgeIcon: { fontSize: 18 },
  badgeId: { fontSize: FONTS.sizes.xs, fontWeight: '900', letterSpacing: 3 },
  npcIdentity: { marginBottom: SPACING.md },
  npcName: { fontSize: FONTS.sizes.sm, fontWeight: '800', color: COLORS.textPrimary },
  npcRole: { fontSize: FONTS.sizes.xs, letterSpacing: 1 },
  missionTitle: {
    fontSize: 42, fontWeight: '900', color: '#FFFFFF',
    lineHeight: 46, marginBottom: SPACING.xs,
  },
  missionSubtitle: { fontSize: FONTS.sizes.md, fontWeight: '700', marginBottom: SPACING.md },
  divider: { height: 2, width: 60, marginBottom: SPACING.md, borderRadius: 1 },
  briefing: {
    fontSize: FONTS.sizes.md, color: COLORS.textSecondary,
    lineHeight: 24, fontStyle: 'italic', marginBottom: SPACING.xl,
  },
  ctaBtn: {
    borderRadius: RADIUS.pill, paddingVertical: SPACING.md + 4,
    alignItems: 'center', marginBottom: SPACING.sm,
  },
  ctaText: { fontSize: FONTS.sizes.lg, fontWeight: '900', color: '#000' },
  skipBtn: { alignItems: 'center', paddingVertical: SPACING.sm },
  skipText: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted },
});
