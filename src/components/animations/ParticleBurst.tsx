/**
 * FEDGE 2.O — Particle Burst System
 * Coins, XP orbs, and stars explode out from a trigger point.
 * Drop anywhere and call .trigger() via ref.
 *
 * Usage:
 *   const burstRef = useRef<ParticleBurstRef>(null);
 *   <ParticleBurst ref={burstRef} type="coins" count={12} />
 *   burstRef.current?.trigger();
 */

import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS } from '@constants/theme';

const { width: SCREEN_W } = Dimensions.get('window');

export type BurstType = 'coins' | 'xp' | 'stars' | 'confetti';

export interface ParticleBurstRef {
  trigger: () => void;
}

interface Particle {
  id: number;
  emoji: string;
  color: string;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  rotation: Animated.Value;
  vx: number;
  vy: number;
}

interface Props {
  type?: BurstType;
  count?: number;
  originX?: number;
  originY?: number;
}

const PARTICLE_SETS: Record<BurstType, { emojis: string[]; colors: string[] }> = {
  coins:    { emojis: ['🪙', '💰', '🤑'], colors: [COLORS.secondary, COLORS.warning, '#FFF176'] },
  xp:       { emojis: ['⚡', '✨', '💫'],  colors: [COLORS.primary, COLORS.accent, COLORS.success] },
  stars:    { emojis: ['⭐', '🌟', '✨'],  colors: [COLORS.secondary, COLORS.warning, COLORS.accent] },
  confetti: { emojis: ['🎊', '🎉', '✨'],  colors: [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.danger, COLORS.accent] },
};

function makeParticles(count: number, type: BurstType): Particle[] {
  const set = PARTICLE_SETS[type];
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const speed = 3 + Math.random() * 5;
    return {
      id: i,
      emoji: set.emojis[i % set.emojis.length],
      color: set.colors[i % set.colors.length],
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
      rotation: new Animated.Value(0),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2, // slight upward bias
    };
  });
}

const ParticleBurst = forwardRef<ParticleBurstRef, Props>(
  ({ type = 'coins', count = 12, originX = SCREEN_W / 2, originY = 300 }, ref) => {
    const [particles] = useState(() => makeParticles(count, type));
    const [active, setActive] = useState(false);

    useImperativeHandle(ref, () => ({
      trigger() {
        setActive(true);

        // Reset all particles
        particles.forEach((p) => {
          p.x.setValue(0);
          p.y.setValue(0);
          p.opacity.setValue(0);
          p.scale.setValue(0);
          p.rotation.setValue(0);
        });

        // Launch each particle
        particles.forEach((p, i) => {
          const delay = i * 30;
          const distance = 80 + Math.random() * 120;

          Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
              // Explode outward
              Animated.timing(p.x, {
                toValue: p.vx * distance / 5,
                duration: 700,
                useNativeDriver: true,
              }),
              Animated.timing(p.y, {
                toValue: p.vy * distance / 5 - 60,
                duration: 700,
                useNativeDriver: true,
              }),
              // Scale in then out
              Animated.sequence([
                Animated.spring(p.scale, {
                  toValue: 1,
                  tension: 150,
                  friction: 5,
                  useNativeDriver: true,
                }),
                Animated.delay(300),
                Animated.timing(p.scale, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }),
              ]),
              // Fade in then out
              Animated.sequence([
                Animated.timing(p.opacity, { toValue: 1, duration: 100, useNativeDriver: true }),
                Animated.delay(500),
                Animated.timing(p.opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
              ]),
              // Spin
              Animated.timing(p.rotation, {
                toValue: (Math.random() > 0.5 ? 1 : -1) * 720,
                duration: 700,
                useNativeDriver: true,
              }),
            ]),
          ]).start(() => {
            if (i === particles.length - 1) setActive(false);
          });
        });
      },
    }));

    if (!active) return null;

    return (
      <View style={[StyleSheet.absoluteFillObject, { pointerEvents: 'none' }]} pointerEvents="none">
        {particles.map((p) => {
          const rotate = p.rotation.interpolate({
            inputRange: [-720, 720],
            outputRange: ['-720deg', '720deg'],
          });
          return (
            <Animated.View
              key={p.id}
              style={[
                styles.particle,
                {
                  left: originX - 16,
                  top:  originY - 16,
                  opacity: p.opacity,
                  transform: [
                    { translateX: p.x },
                    { translateY: p.y },
                    { scale: p.scale },
                    { rotate },
                  ],
                },
              ]}
            >
              <Text style={styles.particleEmoji}>{p.emoji}</Text>
            </Animated.View>
          );
        })}
      </View>
    );
  }
);

export default ParticleBurst;

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  particleEmoji: { fontSize: 22 },
});
