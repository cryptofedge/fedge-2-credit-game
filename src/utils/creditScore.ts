/**
 * FEDGE 2.O Credit Score Engine
 * Simulates FICO-style credit scoring logic for the game
 */

export interface CreditProfile {
  paymentHistory: number;       // 0–100 (35% weight)
  creditUtilization: number;    // 0–100 (30% weight)
  creditAge: number;            // months (15% weight)
  creditMix: number;            // 0–100 (10% weight)
  newCredit: number;            // 0–100 (10% weight)
}

export interface ScoreTier {
  label: string;
  color: string;
  range: [number, number];
  description: string;
}

export const SCORE_TIERS: ScoreTier[] = [
  {
    label: 'Poor',
    color: '#FF3B30',
    range: [300, 579],
    description: 'Significant credit challenges. Focus on on-time payments first.',
  },
  {
    label: 'Fair',
    color: '#FF9500',
    range: [580, 669],
    description: 'Below average. Small improvements can make a big difference.',
  },
  {
    label: 'Good',
    color: '#FFCC00',
    range: [670, 739],
    description: 'Near or slightly above average. Keep building!',
  },
  {
    label: 'Very Good',
    color: '#34C759',
    range: [740, 799],
    description: 'Above average. Eligible for most products at good rates.',
  },
  {
    label: 'Exceptional',
    color: '#00B4FF',
    range: [800, 850],
    description: 'Elite status. Best rates and terms available to you.',
  },
];

/**
 * Calculate a simulated credit score from a credit profile
 */
export function calculateCreditScore(profile: CreditProfile): number {
  const paymentScore = profile.paymentHistory * 0.35;
  const utilizationScore = (100 - profile.creditUtilization) * 0.30;
  const ageScore = Math.min(profile.creditAge / 120, 1) * 100 * 0.15;
  const mixScore = profile.creditMix * 0.10;
  const newCreditScore = profile.newCredit * 0.10;

  const normalized = paymentScore + utilizationScore + ageScore + mixScore + newCreditScore;
  return Math.round(300 + (normalized / 100) * 550);
}

/**
 * Get the score tier for a given credit score
 */
export function getScoreTier(score: number): ScoreTier {
  return (
    SCORE_TIERS.find(tier => score >= tier.range[0] && score <= tier.range[1]) ??
    SCORE_TIERS[0]
  );
}

/**
 * Simulate the impact of a credit action on the score
 */
export function simulateAction(
  profile: CreditProfile,
  action: Partial<CreditProfile>
): { before: number; after: number; delta: number } {
  const before = calculateCreditScore(profile);
  const updatedProfile = { ...profile, ...action };
  const after = calculateCreditScore(updatedProfile);
  return { before, after, delta: after - before };
}
