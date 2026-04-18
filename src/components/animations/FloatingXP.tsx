/**
 * FEDGE 2.O — Floating XP Text
 * A "+150 XP ⚡" label that animates upward and fades out
 * whenever XP is earned. Drop it over any screen.
 *
 * Usage (imperative ref):
 *   const xpRef = useRef<FloatingXPRef>(null);
 *   <FloatingXP ref={xpRef} />
 *   xpRef.current?.show(150, 'xp');   // amount + type
 *   xpRef.current?.show(10, 'coins'); // FEDGE Coins
 */

import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, FONTS } from '@constants/theme';

export type FloatingXPType = 'xp' | 'coins' | 'score';

export interface FloatingXPRef {
  show: (amount: number, type?: FloatingXPType) => void;
}

interface FloatItem {
  id: number;
  amount: number;
  type: FloatingXPType;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  x: number;
}

const TYPE_CONFIG: Record<FloatingXPType, { icon: string; color: string; prefix: string }> = {
  xp:     { icon: '⚡', color: COLORS.primary,   prefix: '+' },
  coins:  { icon: '🪙', color: COLORS.secondary, prefix: '+' },
  score:  { icon: '📈', color: COLORS.success,   prefix: '+' },
};

let nextId = 0;

const FloatingXP = forwardRef<FloatingXPRef, {
  originX?: number;
  originY?: number;
}>(({ originX = 200, originY = 400 }, ref) => {
  const [items, setItems] = useState<FloatItem[]>([]);

  useImperativeHandle(ref, () => ({
    show(amount: number, type: FloatingXPType = 'xp') {
      const id = nextId++;
      const y       = new Animated.Value(0);
      const opacity = new Animated.Value(0);
      const scale   = new Animated.Value(0.5);
      // Slight horizontal spread so multiple labels don't stack
      const x = (Math.random() - 0.5) * 60;

      const item: FloatItem = { id, amount, type, y, opacity, scale, x };

      setItems((prev) => [...prev, item]);

      Animated.parallel([
        // Float upward
        Animated.timing(y, {
          toValue: -120,
          duration: 1600,
          useNativeDriver: true,
        }),
        // Fade in, hold, fade out
        Animated.sequence([
          Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
          Animated.delay(900),
          Animated.timing(opacity, { toValue: 0, duration: 550, useNativeDriver: true }),
        ]),
        // Pop in
        Animated.sequence([
          Animated.spring(scale, {
            toValue: 1.15,
            tension: 200,
            friction: 5,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        setItems((prev) => prev.filter((i) => i.id !== id));
      });
    },
  }));

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {items.map((item) => {
        const cfg = TYPE_CONFIG[item.type];
        return (
          <Animated.View
            key={item.id}
            style={[
              styles.floatLabel,
              {
                left: originX - 40 + item.x,
                top:  originY,
                opacity: item.opacity,
                transform: [{ translateY: item.y }, { scale: item.scale }],
              },
            ]}
          >
            <Text style={[styles.floatText, { color: cfg.color }]}>
              {cfg.prefix}{item.amount} {cfg.icon}
            </Text>
          </Animated.View>
        );
      })}
    </View>
  );
});

export default FloatingXP;

const styles = StyleSheet.create({
  floatLabel: {
    position: 'absolute',
    zIndex: 9999,
    alignItems: 'center',
  },
  floatText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
