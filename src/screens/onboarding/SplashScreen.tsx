/**
 * FEDGE 2.O — Splash Screen
 * Cinematic logo reveal. Sets the tone: premium, powerful, exciting.
 * Inspired by: Clash of Clans intro, Candy Crush splash energy
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, SPACING } from '@constants/theme';
import { OnboardingStackParamList } from '@navigation/OnboardingNavigator';

const { width, height } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Splash'>;
};

export default function SplashScreen({ navigation }: Props) {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.5)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  // Particle positions
  const particles = Array.from({ length: 12 }, (_, i) => ({
    opacity: useRef(new Animated.Value(0)).current,
    translateY: useRef(new Animated.Value(0)).current,
    translateX: useRef(new Animated.Value((i % 2 === 0 ? 1 : -1) * Math.random() * width * 0.4)).current,
  }));

  useEffect(() => {
    // Step 1: Glow pulse in
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(glowOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(glowScale, { toValue: 1.5, duration: 800, useNativeDriver: true }),
      ]),

      // Step 2: Logo slams in
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),

      // Step 3: Tagline fades in
      Animated.delay(300),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),

      // Step 4: Particles shoot up
      Animated.delay(200),
    ]).start(() => {
      // Animate particles
      particles.forEach((p, i) => {
        Animated.sequence([
          Animated.delay(i * 60),
          Animated.parallel([
            Animated.timing(p.opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.timing(p.translateY, { toValue: -height * 0.5, duration: 1200, useNativeDriver: true }),
          ]),
          Animated.timing(p.opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start();
      });

      // Subtitle
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(subtitleOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]).start();

      // Auto-navigate after 3 seconds
      setTimeout(() => {
        navigation.replace('HeroIntro');
      }, 3200);
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Glow blob */}
      <Animated.View
        style={[
          styles.glow,
          { opacity: glowOpacity, transform: [{ scale: glowScale }] },
        ]}
      />

      {/* Particles */}
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              opacity: p.opacity,
              transform: [
                { translateX: p.translateX },
                { translateY: p.translateY },
              ],
            },
          ]}
        />
      ))}

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <Text style={styles.logoText}>FEDGE</Text>
        <View style={styles.versionBadge}>
          <Text style={styles.versionText}>2.O</Text>
        </View>
      </Animated.View>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Credit Education Game
      </Animated.Text>

      {/* Subtitle */}
      <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
        Learn it. Build it. Own it.
      </Animated.Text>

      {/* Bottom bar */}
      <View style={styles.loadingBar}>
        <Animated.View
          style={[
            styles.loadingFill,
            { width: logoOpacity.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.primaryGlow,
  },
  particle: {
    position: 'absolute',
    bottom: height * 0.3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.secondary,
  },
  logoContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  logoText: {
    fontSize: FONTS.sizes.display,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 4,
  },
  versionBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginTop: SPACING.sm,
  },
  versionText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '900',
    color: COLORS.bg,
    letterSpacing: 2,
  },
  tagline: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  subtitle: {
    marginTop: SPACING.sm,
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  loadingBar: {
    position: 'absolute',
    bottom: 60,
    width: width * 0.5,
    height: 3,
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
});
