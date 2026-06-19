import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, SPACING } from '@constants/theme';
import { OnboardingStackParamList } from '@navigation/OnboardingNavigator';
import { IMAGES } from '@assets/index';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Splash'>;
};

export default function SplashScreen({ navigation }: Props) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(20)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const barWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(logoTranslateY, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
      Animated.delay(200),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.delay(150),
      Animated.timing(subtitleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => navigation.replace('HeroIntro'), 1800);
    });

    Animated.timing(barWidth, {
      toValue: width * 0.5,
      duration: 2800,
      delay: 400,
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: logoOpacity, transform: [{ translateY: logoTranslateY }] },
        ]}
      >
        <Image
          source={IMAGES.logoClean}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <View style={styles.logoTextRow}>
          <Text style={styles.logoText}>FEDGE</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>2.O</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Credit Education Game
      </Animated.Text>

      <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
        Learn it. Build it. Own it.
      </Animated.Text>

      <View style={styles.loadingBar}>
        <Animated.View style={[styles.loadingFill, { width: barWidth }]} />
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
  logoContainer: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  logoImage: {
    width: 260,
    height: 260,
  },
  logoTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    borderRadius: 6,
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
