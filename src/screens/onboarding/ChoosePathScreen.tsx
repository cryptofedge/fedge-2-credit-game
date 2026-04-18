/**
 * FEDGE 2.O — Choose Your Path Screen
 * RPG-style class selection. Personalizes the journey.
 * Inspired by: Pokemon starter selection, Duolingo goal setting
 * Hook: user feels seen + committed to their specific path
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@constants/theme';
import { CREDIT_PATHS } from '@constants/gameConfig';
import { useGameStore } from '@store/gameStore';
import { OnboardingStackParamList } from '@navigation/OnboardingNavigator';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'ChoosePath'>;
};

export default function ChoosePathScreen({ navigation }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const addXP = useGameStore((s) => s.addXP);

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-20)).current;
  const cardAnimations = CREDIT_PATHS.map(() => ({
    opacity: useRef(new Animated.Value(0)).current,
    translateX: useRef(new Animated.Value(60)).current,
    scale: useRef(new Animated.Value(1)).current,
  }));
  const ctaOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(headerTranslateY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.stagger(
        150,
        cardAnimations.map((anim) =>
          Animated.parallel([
            Animated.timing(anim.opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(anim.translateX, { toValue: 0, duration: 400, useNativeDriver: true }),
          ])
        )
      ),
    ]).start();
  }, []);

  const handleSelect = (pathId: string) => {
    setSelected(pathId);
    // Pulse animation on selected card
    const idx = CREDIT_PATHS.findIndex((p) => p.id === pathId);
    Animated.sequence([
      Animated.timing(cardAnimations[idx].scale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.spring(cardAnimations[idx].scale, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
    ]).start();

    // Show CTA
    Animated.timing(ctaOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  };

  const handleContinue = () => {
    if (!selected) return;
    addXP(25);
    navigation.navigate('ConnectBureaus');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Progress dots */}
      <View style={styles.progressRow}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={i} style={[styles.dot, i <= 1 && styles.dotActive]} />
        ))}
      </View>

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] },
        ]}
      >
        <Text style={styles.eyebrow}>STEP 2 OF 5</Text>
        <Text style={styles.headline}>Choose Your Path</Text>
        <Text style={styles.subheadline}>
          This customizes your missions, tips, and strategy.{'\n'}You can change it later.
        </Text>
      </Animated.View>

      {/* Path Cards */}
      <View style={styles.cardsContainer}>
        {CREDIT_PATHS.map((path, i) => {
          const isSelected = selected === path.id;
          const anim = cardAnimations[i];

          return (
            <Animated.View
              key={path.id}
              style={[
                {
                  opacity: anim.opacity,
                  transform: [{ translateX: anim.translateX }, { scale: anim.scale }],
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.pathCard,
                  isSelected && {
                    borderColor: path.color,
                    backgroundColor: COLORS.bgCardAlt,
                    shadowColor: path.color,
                    shadowOpacity: 0.4,
                    shadowRadius: 16,
                    elevation: 8,
                  },
                ]}
                onPress={() => handleSelect(path.id)}
                activeOpacity={0.85}
              >
                <View style={styles.cardLeft}>
                  <View style={[styles.iconBadge, { backgroundColor: path.color + '22' }]}>
                    <Text style={styles.pathIcon}>{path.icon}</Text>
                  </View>
                  <View style={styles.cardText}>
                    <Text style={[styles.pathTitle, isSelected && { color: path.color }]}>
                      {path.title}
                    </Text>
                    <Text style={styles.pathSubtitle}>{path.subtitle}</Text>
                  </View>
                </View>
                <View style={[styles.radioOuter, isSelected && { borderColor: path.color }]}>
                  {isSelected && <View style={[styles.radioInner, { backgroundColor: path.color }]} />}
                </View>
              </TouchableOpacity>

              {/* Expanded description when selected */}
              {isSelected && (
                <View style={[styles.expandedCard, { borderColor: path.color + '40' }]}>
                  <Text style={styles.expandedText}>{path.description}</Text>
                  <Text style={styles.expandedMissions}>
                    First missions: {path.missions.slice(0, 2).join(' · ')}
                  </Text>
                </View>
              )}
            </Animated.View>
          );
        })}
      </View>

      {/* CTA */}
      <Animated.View style={[styles.ctaContainer, { opacity: ctaOpacity }]}>
        <TouchableOpacity
          style={[styles.ctaButton, !selected && styles.ctaDisabled]}
          onPress={handleContinue}
          disabled={!selected}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>Lock In My Path →</Text>
        </TouchableOpacity>
        <Text style={styles.xpPreview}>+25 XP for choosing your path</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingTop: 56,
    paddingBottom: 40,
    paddingHorizontal: SPACING.lg,
  },
  progressRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.bgCardAlt,
  },
  dotActive: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  eyebrow: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
    letterSpacing: 3,
    marginBottom: SPACING.sm,
  },
  headline: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  subheadline: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  cardsContainer: {
    gap: SPACING.sm,
    flex: 1,
  },
  pathCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pathIcon: {
    fontSize: 24,
  },
  cardText: {
    flex: 1,
  },
  pathTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  pathSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  expandedCard: {
    backgroundColor: COLORS.bgCardAlt,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginTop: -4,
  },
  expandedText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  expandedMissions: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
  },
  ctaContainer: {
    gap: SPACING.sm,
    alignItems: 'center',
    paddingTop: SPACING.md,
  },
  ctaButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
    ...SHADOWS.primary,
  },
  ctaDisabled: {
    backgroundColor: COLORS.bgCardAlt,
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
    color: COLORS.bg,
  },
  xpPreview: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.secondary,
  },
});
