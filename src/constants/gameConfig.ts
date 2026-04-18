/**
 * FEDGE 2.O Game Configuration
 * Tuned for maximum retention — Candy Crush-style reward cadence
 */

export const XP = {
  // Onboarding rewards (front-load dopamine hits!)
  CREATE_PROFILE: 50,
  CHOOSE_PATH: 25,
  CONNECT_BUREAU: 150,      // Big reward per bureau — makes connecting feel worth it
  ALL_BUREAUS: 500,         // Jackpot for connecting all 3
  SCORE_REVEALED: 100,
  FIRST_MISSION_ACCEPTED: 75,
  COMPLETE_ONBOARDING: 250,

  // Daily rewards
  DAILY_LOGIN: 25,
  STREAK_7_DAY: 200,
  STREAK_30_DAY: 1000,
  STREAK_100_DAY: 5000,

  // Learning
  LESSON_COMPLETE: 50,
  QUIZ_PASS: 100,
  QUIZ_PERFECT: 150,
  MODULE_COMPLETE: 300,

  // Credit actions
  SIMULATE_ACTION: 10,
  DISPUTE_FILED: 200,
  SCORE_INCREASE: 500,
};

export const FEDGE_COINS = {
  CREATE_PROFILE: 10,
  CONNECT_BUREAU: 50,
  ALL_BUREAUS: 200,
  LESSON_COMPLETE: 10,
  QUIZ_PERFECT: 25,
  DAILY_LOGIN: 5,
  STREAK_7_DAY: 50,
};

export const LEVELS = Array.from({ length: 50 }, (_, i) => ({
  level: i + 1,
  xpRequired: Math.floor(500 * Math.pow(1.15, i)),
  title: getLevelTitle(i + 1),
}));

function getLevelTitle(level: number): string {
  if (level <= 5) return 'Credit Newbie';
  if (level <= 10) return 'Credit Apprentice';
  if (level <= 15) return 'Credit Builder';
  if (level <= 20) return 'Credit Challenger';
  if (level <= 25) return 'Credit Repairer';
  if (level <= 30) return 'Credit Strategist';
  if (level <= 35) return 'Credit Expert';
  if (level <= 40) return 'Credit Master';
  if (level <= 45) return 'Credit Champion';
  return 'FEDGE Elite';
}

export const CREDIT_PATHS = [
  {
    id: 'build',
    title: 'Build It',
    subtitle: 'Starting from scratch or thin file',
    icon: '🏗️',
    description: 'No credit history? No problem. We\'ll build yours from zero to hero.',
    color: '#00D4FF',
    startingScore: 580,
    missions: ['Get a secured card', 'Become an authorized user', 'Report rent payments'],
  },
  {
    id: 'fix',
    title: 'Fix It',
    subtitle: 'Repairing damaged credit',
    icon: '🔧',
    description: 'Past mistakes don\'t define you. Let\'s repair and rebuild.',
    color: '#FF9F0A',
    startingScore: 520,
    missions: ['Dispute errors', 'Negotiate pay-for-delete', 'Reduce utilization'],
  },
  {
    id: 'protect',
    title: 'Master It',
    subtitle: 'Optimizing excellent credit',
    icon: '🛡️',
    description: 'You\'re good. Let\'s make you exceptional and keep you there.',
    color: '#00FF94',
    startingScore: 740,
    missions: ['Optimize utilization', 'Strategic new credit', 'Monitor for fraud'],
  },
];

export const BUREAUS = [
  {
    id: 'equifax',
    name: 'Equifax',
    tagline: 'Vault 1 of 3',
    color: '#CC0000',
    glowColor: 'rgba(204, 0, 0, 0.4)',
    icon: '🔴',
    xpReward: XP.CONNECT_BUREAU,
    coinReward: FEDGE_COINS.CONNECT_BUREAU,
    description: 'One of the 3 major bureaus. Lenders check your Equifax report for big purchases.',
    oauthUrl: 'https://www.equifax.com/personal/products/credit/monitoring/', // Placeholder
  },
  {
    id: 'experian',
    name: 'Experian',
    tagline: 'Vault 2 of 3',
    color: '#4A2C8F',
    glowColor: 'rgba(74, 44, 143, 0.4)',
    icon: '🟣',
    xpReward: XP.CONNECT_BUREAU,
    coinReward: FEDGE_COINS.CONNECT_BUREAU,
    description: 'The largest bureau. Your Experian score is used in 70% of lending decisions.',
    oauthUrl: 'https://www.experian.com/consumer-products/free-credit-report.html', // Placeholder
  },
  {
    id: 'transunion',
    name: 'TransUnion',
    tagline: 'Vault 3 of 3',
    color: '#0057A8',
    glowColor: 'rgba(0, 87, 168, 0.4)',
    icon: '🔵',
    xpReward: XP.CONNECT_BUREAU,
    coinReward: FEDGE_COINS.CONNECT_BUREAU,
    description: 'The bureau that tracks the most data points. Critical for auto loans.',
    oauthUrl: 'https://www.transunion.com/credit-monitoring', // Placeholder
  },
];

export const ONBOARDING_STEPS = [
  { id: 'splash', label: 'Welcome' },
  { id: 'hero', label: 'Your Mission' },
  { id: 'path', label: 'Choose Path' },
  { id: 'bureaus', label: 'Connect Vaults' },
  { id: 'reveal', label: 'Score Reveal' },
  { id: 'mission', label: 'First Mission' },
];
