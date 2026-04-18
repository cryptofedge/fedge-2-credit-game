/**
 * FEDGE 2.O — Animated Score Gauge
 * Speedometer-style arc gauge with animated needle, colored segments,
 * and a score counter that ticks up/down like a real odometer.
 *
 * Usage:
 *   <ScoreGauge score={720} previousScore={658} autoAnimate />
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, FONTS } from '@constants/theme';

// ─── Constants ───────────────────────────────
const SIZE      = 260;
const HALF      = SIZE / 2;
const RADIUS    = 100;
const SEGMENTS  = 36;     // number of arc segments
const SEG_W     = 10;     // segment width
const SEG_H     = 4;      // segment height
const NEEDLE_LEN = RADIUS * 0.78;
const SCORE_MIN = 300;
const SCORE_MAX = 850;

// ─── Score → color ───────────────────────────
function segmentColor(index: number): string {
  const pct = index / SEGMENTS;
  if (pct < 0.25) return COLORS.scorePoor;
  if (pct < 0.45) return COLORS.scoreFair;
  if (pct < 0.65) return COLORS.scoreGood;
  if (pct < 0.85) return COLORS.scoreVeryGood;
  return COLORS.scoreExceptional;
}

function scoreToLabel(score: number) {
  if (score >= 800) return { label: 'Exceptional', color: COLORS.scoreExceptional };
  if (score >= 740) return { label: 'Very Good',   color: COLORS.scoreVeryGood };
  if (score >= 670) return { label: 'Good',         color: COLORS.scoreGood };
  if (score >= 580) return { label: 'Fair',         color: COLORS.scoreFair };
  return                    { label: 'Poor',         color: COLORS.scorePoor };
}

// ─── score → needle angle (degrees, -90 left … +90 right) ───
function scoreToAngle(score: number): number {
  const pct = (Math.min(Math.max(score, SCORE_MIN), SCORE_MAX) - SCORE_MIN) / (SCORE_MAX - SCORE_MIN);
  return pct * 180 - 90; // -90° = left end, +90° = right end
}

// ─── Component ───────────────────────────────
interface ScoreGaugeProps {
  score: number;
  previousScore?: number;
  size?: number;
  autoAnimate?: boolean;
  showDelta?: boolean;
}

export default function ScoreGauge({
  score,
  previousScore,
  autoAnimate = true,
  showDelta = true,
}: ScoreGaugeProps) {
  const needleAnim  = useRef(new Animated.Value(previousScore ?? score)).current;
  const displayAnim = useRef(new Animated.Value(previousScore ?? score)).current;
  const deltaOpacity = useRef(new Animated.Value(0)).current;
  const deltaSlide   = useRef(new Animated.Value(0)).current;
  const [displayScore, setDisplayScore] = useState(previousScore ?? score);
  const [activeSegments, setActiveSegments] = useState(
    Math.round(((previousScore ?? score) - SCORE_MIN) / (SCORE_MAX - SCORE_MIN) * SEGMENTS)
  );

  useEffect(() => {
    if (!autoAnimate) return;

    const targetPct = (score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN);
    const targetSegs = Math.round(targetPct * SEGMENTS);

    // Needle swing
    Animated.spring(needleAnim, {
      toValue: score,
      tension: 30,
      friction: 8,
      useNativeDriver: false,
    }).start();

    // Score counter tick
    Animated.timing(displayAnim, {
      toValue: score,
      duration: 1400,
      useNativeDriver: false,
    }).start();

    // Segment fill animation (tick up/down)
    const startSegs = activeSegments;
    const steps = Math.abs(targetSegs - startSegs);
    const dir = targetSegs > startSegs ? 1 : -1;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setActiveSegments(startSegs + dir * step);
      if (step >= steps) clearInterval(interval);
    }, 1400 / Math.max(steps, 1));

    // Delta popup
    if (previousScore !== undefined && previousScore !== score) {
      Animated.sequence([
        Animated.delay(800),
        Animated.parallel([
          Animated.timing(deltaOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.spring(deltaSlide, { toValue: -24, tension: 60, friction: 8, useNativeDriver: true }),
        ]),
        Animated.delay(1200),
        Animated.timing(deltaOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    }

    return () => clearInterval(interval);
  }, [score]);

  // Keep display score in sync
  displayAnim.addListener(({ value }) => setDisplayScore(Math.round(value)));

  const needleAngleDeg = needleAnim.interpolate({
    inputRange: [SCORE_MIN, SCORE_MAX],
    outputRange: ['-90deg', '90deg'],
  });

  const { label, color } = scoreToLabel(score);
  const delta = previousScore !== undefined ? score - previousScore : 0;

  return (
    <View style={styles.container}>
      {/* ── Arc segments ── */}
      <View style={styles.gaugeArea}>
        {Array.from({ length: SEGMENTS }, (_, i) => {
          // Place each segment around the top semicircle
          // angle goes from 180° (left) to 0° (right) — i.e. left to right arc
          const angleDeg = 180 - (i / (SEGMENTS - 1)) * 180;
          const angleRad = (angleDeg * Math.PI) / 180;
          const cx = HALF + Math.cos(angleRad) * RADIUS;
          const cy = HALF - Math.sin(angleRad) * RADIUS; // y inverted in screen coords
          const isActive = i < activeSegments;
          const segCol = segmentColor(i);

          return (
            <View
              key={i}
              style={[
                styles.segment,
                {
                  left: cx - SEG_W / 2,
                  top:  cy - SEG_H / 2,
                  backgroundColor: isActive ? segCol : COLORS.bgCardAlt,
                  transform: [{ rotate: `${angleDeg + 90}deg` }],
                  opacity: isActive ? 1 : 0.35,
                },
              ]}
            />
          );
        })}

        {/* ── Needle ── */}
        <Animated.View
          style={[
            styles.needle,
            {
              left:  HALF - 1.5,
              top:   HALF - NEEDLE_LEN,
              transform: [
                { translateY:  NEEDLE_LEN / 2 },
                { rotate: needleAngleDeg },
                { translateY: -NEEDLE_LEN / 2 },
              ],
            },
          ]}
        />
        {/* Needle center cap */}
        <View style={[styles.needleCap, { left: HALF - 9, top: HALF - 9 }]} />

        {/* ── Score display ── */}
        <View style={[styles.scoreCenter, { left: HALF - 60, top: HALF + 8 }]}>
          <Text style={[styles.scoreNum, { color }]}>{displayScore}</Text>
          <Text style={[styles.scoreTier, { color }]}>{label}</Text>
          <Text style={styles.scoreRange}>300 — 850</Text>
        </View>

        {/* ── Delta popup ── */}
        {showDelta && delta !== 0 && (
          <Animated.View style={[
            styles.deltaPopup,
            {
              opacity: deltaOpacity,
              transform: [{ translateY: deltaSlide }],
              left: HALF - 30,
              top: HALF - 40,
            }
          ]}>
            <Text style={[
              styles.deltaText,
              { color: delta > 0 ? COLORS.success : COLORS.danger }
            ]}>
              {delta > 0 ? `+${delta}` : delta} pts
            </Text>
          </Animated.View>
        )}
      </View>

      {/* ── Tier labels ── */}
      <View style={styles.tierLabels}>
        <Text style={[styles.tierLabel, { color: COLORS.scorePoor }]}>Poor</Text>
        <Text style={[styles.tierLabel, { color: COLORS.scoreFair }]}>Fair</Text>
        <Text style={[styles.tierLabel, { color: COLORS.scoreGood }]}>Good</Text>
        <Text style={[styles.tierLabel, { color: COLORS.scoreVeryGood }]}>V.Good</Text>
        <Text style={[styles.tierLabel, { color: COLORS.scoreExceptional }]}>Excellent</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  gaugeArea: { width: SIZE, height: HALF + 60, position: 'relative' },

  segment: {
    position: 'absolute',
    width: SEG_W,
    height: SEG_H,
    borderRadius: 2,
  },

  needle: {
    position: 'absolute',
    width: 3,
    height: NEEDLE_LEN,
    backgroundColor: COLORS.textPrimary,
    borderRadius: 2,
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  needleCap: {
    position: 'absolute',
    width: 18, height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.bgCard,
    borderWidth: 3,
    borderColor: COLORS.primary,
    zIndex: 10,
  },

  scoreCenter: {
    position: 'absolute',
    width: 120,
    alignItems: 'center',
  },
  scoreNum: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: '900',
    lineHeight: 38,
  },
  scoreTier: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '800',
  },
  scoreRange: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  deltaPopup: {
    position: 'absolute',
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  deltaText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '900',
  },

  tierLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: SIZE,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  tierLabel: {
    fontSize: 9,
    fontWeight: '700',
  },
});
