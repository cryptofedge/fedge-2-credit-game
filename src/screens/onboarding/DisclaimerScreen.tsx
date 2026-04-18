/**
 * FEDGE 2.O — Disclaimer Screen
 * First screen shown before anything else.
 * Educational purpose only — not legal or financial advice.
 * User must accept before proceeding.
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '@constants/theme';
import { OnboardingStackParamList } from '@navigation/OnboardingNavigator';

const { width, height } = Dimensions.get('window');
const FEDGE_LOGO = require('@assets/images/logo.png');

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Disclaimer'>;
};

const DISCLAIMER_POINTS = [
  {
    icon: '📚',
    title: 'For Educational Purposes Only',
    body: 'FEDGE 2.O is a credit education game. All content, tips, simulations, and strategies are provided solely for learning purposes.',
  },
  {
    icon: '⚖️',
    title: 'Not Legal or Financial Advice',
    body: 'Nothing in this app constitutes legal, financial, tax, or credit counseling advice. Always consult a licensed financial advisor, attorney, or credit counselor before making real financial decisions.',
  },
  {
    icon: '🏦',
    title: 'Not Affiliated With Credit Bureaus',
    body: 'FEDGE 2.O is not affiliated with, endorsed by, or sponsored by Equifax, Experian, TransUnion, FICO, or any financial institution.',
  },
  {
    icon: '🔮',
    title: 'Simulated Scores Are Estimates',
    body: 'Credit score simulations within the game are estimates based on general credit scoring models. Actual scores may vary. Real credit decisions are made by lenders using their own criteria.',
  },
  {
    icon: '🔒',
    title: 'Your Data Is Protected',
    body: 'If you choose to connect bureau data, it is read-only and encrypted. We never store passwords or make changes to your accounts. See our Privacy Policy for full details.',
  },
  {
    icon: '👻',
    title: 'Ghost Mode Available',
    body: 'You can play with simulated demo data without sharing any personal information. Real bureau connections are optional and can be added anytime.',
  },
];

export default function DisclaimerScreen({ navigation }: Props) {
  const [accepted, setAccepted] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const ctaSlide = useRef(new Animated.Value(40)).current;
  const ctaOpacity = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (scrolledToBottom) {
      Animated.parallel([
        Animated.timing(ctaOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(ctaSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    }
  }, [scrolledToBottom]);

  const handleScroll = (e: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const isBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 60;
    if (isBottom && !scrolledToBottom) setScrolledToBottom(true);
  };

  const handleAccept = () => {
    setAccepted(true);
    Animated.sequence([
      Animated.timing(checkScale, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.timing(checkScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => navigation.replace('Splash'), 300);
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <Animated.View style={[styles.inner, { opacity: fadeIn }]}>
        {/* Top branding */}
        <View style={styles.brandRow}>
          <Image source={FEDGE_LOGO} style={styles.logo} resizeMode="contain" />
          <View>
            <Text style={styles.brandName}>FEDGE 2.O</Text>
            <Text style={styles.brandSub}>Credit Education Game</Text>
          </View>
        </View>

        <Text style={styles.headline}>Before You Play</Text>
        <Text style={styles.subheadline}>
          Please read and accept our disclaimer.{'\n'}
          Scroll to the bottom to continue.
        </Text>

        {/* Disclaimer points */}
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={100}
        >
          {DISCLAIMER_POINTS.map((point, i) => (
            <View key={i} style={styles.pointCard}>
              <Text style={styles.pointIcon}>{point.icon}</Text>
              <View style={styles.pointText}>
                <Text style={styles.pointTitle}>{point.title}</Text>
                <Text style={styles.pointBody}>{point.body}</Text>
              </View>
            </View>
          ))}

          {/* Full legal text */}
          <View style={styles.legalBox}>
            <Text style={styles.legalTitle}>FULL DISCLAIMER</Text>
            <Text style={styles.legalText}>
              FEDGE 2.O ("the App") is designed and distributed for educational and entertainment purposes only. The App does not provide legal, financial, investment, tax, or credit counseling advice of any kind.{'\n\n'}
              The information, simulations, tips, strategies, and content provided within the App are general in nature and do not constitute professional advice tailored to your individual financial situation. Results experienced by other users are not guaranteed.{'\n\n'}
              Credit scores, reports, and financial outcomes vary significantly based on individual circumstances, lender criteria, and credit bureau methodologies. Any score simulations are estimates only.{'\n\n'}
              The App is not affiliated with, endorsed by, or sponsored by Equifax Inc., Experian plc, TransUnion LLC, Fair Isaac Corporation (FICO), or any government agency, financial institution, or credit counseling organization.{'\n\n'}
              By tapping "I Understand & Accept," you acknowledge that you have read this disclaimer, understand that the App is for educational purposes only, and agree that you will seek qualified professional advice for your specific financial decisions.{'\n\n'}
              For questions, contact: cryptofedge@gmail.com
            </Text>
          </View>

          <View style={{ height: SPACING.xl }} />
        </ScrollView>

        {/* CTA */}
        <Animated.View
          style={[
            styles.ctaContainer,
            { opacity: ctaOpacity, transform: [{ translateY: ctaSlide }] },
          ]}
        >
          {!scrolledToBottom && (
            <Text style={styles.scrollHint}>↓ Scroll down to read full disclaimer</Text>
          )}

          <TouchableOpacity
            style={[styles.ctaButton, !scrolledToBottom && styles.ctaDisabled]}
            onPress={handleAccept}
            disabled={!scrolledToBottom}
            activeOpacity={0.85}
          >
            <Animated.View style={{ transform: [{ scale: checkScale }] }}>
              <Text style={styles.ctaText}>
                {accepted ? '✓ Accepted!' : 'I Understand & Accept →'}
              </Text>
            </Animated.View>
          </TouchableOpacity>

          <Text style={styles.ctaNote}>
            You can review this anytime in Settings → Legal
          </Text>
        </Animated.View>

        {/* Always visible scroll prompt */}
        {!scrolledToBottom && (
          <View style={styles.scrollPrompt}>
            <Text style={styles.scrollPromptText}>Scroll to read ↓</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  inner: { flex: 1, paddingTop: 56 },
  brandRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg,
  },
  logo: { width: 44, height: 44 },
  brandName: { fontSize: FONTS.sizes.xl, fontWeight: '900', color: COLORS.textPrimary },
  brandSub: { fontSize: FONTS.sizes.xs, color: COLORS.primary, letterSpacing: 1 },
  headline: {
    fontSize: FONTS.sizes.xxl, fontWeight: '900', color: COLORS.textPrimary,
    paddingHorizontal: SPACING.lg, marginBottom: SPACING.xs,
  },
  subheadline: {
    fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 20,
    paddingHorizontal: SPACING.lg, marginBottom: SPACING.md,
  },
  scroll: { flex: 1, paddingHorizontal: SPACING.lg },
  pointCard: {
    backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.sm,
    flexDirection: 'row', gap: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  pointIcon: { fontSize: 28, marginTop: 2 },
  pointText: { flex: 1 },
  pointTitle: { fontSize: FONTS.sizes.md, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  pointBody: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 20 },
  legalBox: {
    backgroundColor: COLORS.bgCardAlt, borderRadius: RADIUS.md,
    padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, marginTop: SPACING.sm,
  },
  legalTitle: {
    fontSize: FONTS.sizes.xs, color: COLORS.textMuted, letterSpacing: 2,
    marginBottom: SPACING.sm, fontWeight: '700',
  },
  legalText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, lineHeight: 18 },
  ctaContainer: {
    paddingHorizontal: SPACING.lg, paddingBottom: 36, paddingTop: SPACING.md,
    gap: SPACING.sm, alignItems: 'center',
    borderTopWidth: 1, borderTopColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  scrollHint: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  ctaButton: {
    width: '100%', backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill, paddingVertical: SPACING.md + 2,
    alignItems: 'center', ...SHADOWS.primary,
  },
  ctaDisabled: { backgroundColor: COLORS.bgCardAlt, shadowOpacity: 0, elevation: 0 },
  ctaText: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.bg },
  ctaNote: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, textAlign: 'center' },
  scrollPrompt: { position: 'absolute', bottom: 130, alignSelf: 'center' },
  scrollPromptText: { fontSize: FONTS.sizes.xs, color: COLORS.primary, letterSpacing: 1 },
});
