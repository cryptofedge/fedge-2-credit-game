/**
 * FEDGE 2.O — Level-Up Modal
 * Full-screen gold celebration that fires whenever the player levels up.
 * Shows: new level number, new title, XP bar fill animation, particle burst,
 * and a "What's unlocked" teaser for the next tier.
 *
 * Usage:
 *   Wire <LevelUpModal /> inside RootNavigator or App.tsx.
 *   It listens to the gameStore level value automatically.
 *   The modal appears any time the level increases.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@constants/theme';
import { useGameStore } from '@store/gameStore';
import { LEVELS } from '@constants/gameConfig';
import ParticleBurst, { ParticleBurstRef } from '@components/animations/ParticleBurst';

const { width, height } = Dimensions.get('window');

// ─── Level tier badge colors ──────────────────
function tierColor(level: number): string {
  if (level >= 45) return COLORS.scoreExceptional;
  if (level >= 35) return COLORS.secondary;
  if (level >= 25) return COLORS.accent;
  if (level >= 15) return COLORS.success;
  if (level >= 5)  return COLORS.primary;
  return COLORS.textSecondary;
}

// ─── What unlocks at each level milestone ─────
function getUnlockTeaser(level: number): string | null {
  const unlocks: Record<number, string> = {
    2:  'New daily mission slot unlocked',
    5:  'Credit dispute tools unlocked',
    10: 'Advanced simulator scenarios unlocked',
    15: 'Business credit module unlocked',
    20: 'Mortgage optimizer unlocked',
    25: 'Credit repair secrets unlocked',
    30: 'Elite strategies module unlocked',
    40: 'FEDGE mentor mode unlocked',
    50: '🏆 FEDGE Elite status achieved',
  };
  return unlocks[level] ?? null;
}

export default function LevelUpModal() {
  const level   = useGameStore((s) => s.level);
  const xp      = useGameStore((s) => s.xp);

  const [visible, setVisible]     = useState(false);
  const [shownLevel, setShownLevel] = useState(level);
  const [celebLevel, setCelebLevel] = useState(level);

  // Animations
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const cardScale       = useRef(new Animated.Value(0.5)).current;
  const cardOpacity     = useRef(new Animated.Value(0)).current;
  const xpBarWidth      = useRef(new Animated.Value(0)).current;
  const levelNumScale   = useRef(new Animated.Value(0)).current;
  const glowAnim        = useRef(new Animated.Value(0)).current;
  const burstRef        = useRef<ParticleBurstRef>(null);
  const starBurstRef    = useRef<ParticleBurstRef>(null);

  // Watch for level-up
  useEffect(() => {
    if (level > shownLevel) {
      setCelebLevel(level);
      triggerCelebration();
    }
    setShownLevel(level);
  }, [level]);

  const triggerCelebration = () => {
    // Reset
    backdropOpacity.setValue(0);
    cardScale.setValue(0.5);
    cardOpacity.setValue(0);
    xpBarWidth.setValue(0);
    levelNumScale.setValue(0);
    glowAnim.setValue(0);

    setVisible(true);

    Animated.sequence([
      // Backdrop fade in
      Animated.timing(backdropOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      // Card pop in
      Animated.parallel([
        Animated.spring(cardScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
    ]).start(() => {
      // Level number bounce
      Animated.sequence([
        Animated.spring(levelNumScale, { toValue: 1.3, tension: 200, friction: 4, useNativeDriver: true }),
        Animated.spring(levelNumScale, { toValue: 1,   tension: 100, friction: 8, useNativeDriver: true }),
      ]).start();

      // XP bar fill
      Animated.timing(xpBarWidth, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false,
      }).start();

      // Glow pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: false }),
          Animated.timing(glowAnim, { toValue: 0.3, duration: 800, useNativeDriver: false }),
        ]),
        { iterations: 4 }
      ).start();

      // Particles
      setTimeout(() => {
        burstRef.current?.trigger();
        starBurstRef.current?.trigger();
      }, 200);
    });
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(cardOpacity,     { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(cardScale,       { toValue: 0.8, duration: 250, useNativeDriver: true }),
    ]).start(() => setVisible(false));
  };

  const levelData    = LEVELS[Math.min(celebLevel - 1, LEVELS.length - 1)];
  const color        = tierColor(celebLevel);
  const teaser       = getUnlockTeaser(celebLevel);
  const xpBarInterp  = xpBarWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const glowColor    = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [color + '00', color + '40'] });

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={handleClose}>
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>

        {/* Particles */}
        <ParticleBurst ref={burstRef}     type="stars"    count={16} originX={width / 2} originY={height * 0.42} />
        <ParticleBurst ref={starBurstRef} type="confetti" count={20} originX={width / 2} originY={height * 0.42} />

        <Animated.View style={[
          styles.card,
          {
            opacity: cardOpacity,
            transform: [{ scale: cardScale }],
            borderColor: color + '60',
          }
        ]}>
          {/* Animated glow background */}
          <Animated.View style={[styles.glowBg, { backgroundColor: glowColor }]} />

          {/* Badge */}
          <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color + '40' }]}>
            <Text style={[styles.badgeText, { color }]}>LEVEL UP</Text>
          </View>

          {/* Level number */}
          <Animated.Text style={[
            styles.levelNum,
            { color, transform: [{ scale: levelNumScale }] },
          ]}>
            {celebLevel}
          </Animated.Text>

          {/* Title */}
          <Text style={styles.levelTitle}>{levelData?.title ?? 'Credit Newbie'}</Text>
          <Text style={styles.levelSub}>You've leveled up!</Text>

          {/* XP bar */}
          <View style={styles.xpSection}>
            <Text style={styles.xpLabel}>{xp.toLocaleString()} XP total</Text>
            <View style={styles.xpTrack}>
              <Animated.View style={[styles.xpFill, { width: xpBarInterp, backgroundColor: color }]} />
            </View>
          </View>

          {/* Perks / teaser */}
          {teaser && (
            <View style={[styles.teaserCard, { borderColor: color + '40', backgroundColor: color + '10' }]}>
              <Text style={styles.teaserIcon}>🔓</Text>
              <Text style={[styles.teaserText, { color }]}>{teaser}</Text>
            </View>
          )}

          {/* CTA */}
          <TouchableOpacity
            style={[styles.continueBtn, { backgroundColor: color }]}
            onPress={handleClose}
            activeOpacity={0.85}
          >
            <Text style={styles.continueBtnText}>Keep Going →</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(6,6,15,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    overflow: 'hidden',
    gap: SPACING.md,
    ...SHADOWS.gold,
  },
  glowBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS.xl,
  },

  badge: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderWidth: 1,
  },
  badgeText: { fontSize: FONTS.sizes.xs, fontWeight: '900', letterSpacing: 3 },

  levelNum: {
    fontSize: 96,
    fontWeight: '900',
    lineHeight: 100,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  levelTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '900',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  levelSub: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginTop: -SPACING.sm,
  },

  xpSection: { width: '100%', gap: SPACING.xs },
  xpLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, fontWeight: '700', textAlign: 'right' },
  xpTrack: {
    height: 8,
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
  },
  xpFill: { height: '100%', borderRadius: RADIUS.pill },

  teaserCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
  },
  teaserIcon: { fontSize: 22 },
  teaserText: { flex: 1, fontSize: FONTS.sizes.sm, fontWeight: '700', lineHeight: 20 },

  continueBtn: {
    width: '100%',
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  continueBtnText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '900',
    color: COLORS.bg,
  },
});
