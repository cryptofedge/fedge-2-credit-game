/**
 * FEDGE 2.O Design System
 * Dark premium theme — like a credit card hologram meets RPG
 */

export const COLORS = {
  // Backgrounds
  bg: '#06060F',
  bgCard: '#0F0F24',
  bgCardAlt: '#14142E',
  bgModal: '#1A1A38',

  // Brand
  primary: '#00D4FF',       // Electric blue — power, technology
  primaryDark: '#0099BB',
  primaryGlow: 'rgba(0, 212, 255, 0.25)',

  secondary: '#FFD700',     // Gold — wealth, achievement
  secondaryGlow: 'rgba(255, 215, 0, 0.25)',

  accent: '#B44FFF',        // Purple — prestige, premium
  accentGlow: 'rgba(180, 79, 255, 0.25)',

  // Semantic
  success: '#00FF94',
  successGlow: 'rgba(0, 255, 148, 0.25)',
  danger: '#FF3B5C',
  dangerGlow: 'rgba(255, 59, 92, 0.25)',
  warning: '#FF9F0A',
  warningGlow: 'rgba(255, 159, 10, 0.25)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#50506A',
  textGold: '#FFD700',

  // Credit Score Tiers
  scorePoor: '#FF3B5C',
  scoreFair: '#FF9F0A',
  scoreGood: '#FFD700',
  scoreVeryGood: '#00FF94',
  scoreExceptional: '#00D4FF',

  // Bureau Colors
  equifax: '#CC0000',
  equifaxGlow: 'rgba(204, 0, 0, 0.3)',
  experian: '#4A2C8F',
  experianGlow: 'rgba(74, 44, 143, 0.3)',
  transunion: '#0057A8',
  transunionGlow: 'rgba(0, 87, 168, 0.3)',

  // Borders
  border: 'rgba(255,255,255,0.08)',
  borderActive: 'rgba(0, 212, 255, 0.5)',
};

export const FONTS = {
  black: 'System',
  bold: 'System',
  semiBold: 'System',
  regular: 'System',
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 21,
    xxl: 28,
    xxxl: 36,
    hero: 48,
    display: 64,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const SHADOWS = {
  primary: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  gold: {
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
};
