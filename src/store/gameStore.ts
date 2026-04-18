/**
 * FEDGE 2.O Game State Store (Zustand)
 */

import { create } from 'zustand';
import { CreditProfile, calculateCreditScore } from '@utils/creditScore';

interface GameState {
  // Player
  playerName: string;
  isGhostMode: boolean;
  level: number;
  xp: number;
  fedgeCoins: number;
  streak: number;

  // Credit Profile
  creditProfile: CreditProfile;
  creditScore: number;

  // Progress
  completedModules: string[];
  completedChallenges: string[];
  achievements: string[];

  // Actions
  setPlayerName: (name: string) => void;
  setGhostMode: (ghost: boolean) => void;
  addXP: (amount: number) => void;
  addFedgeCoins: (amount: number) => void;
  updateCreditProfile: (updates: Partial<CreditProfile>) => void;
  completeModule: (moduleId: string) => void;
  completeChallenge: (challengeId: string) => void;
  unlockAchievement: (achievementId: string) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
}

const DEFAULT_CREDIT_PROFILE: CreditProfile = {
  paymentHistory: 50,
  creditUtilization: 70,
  creditAge: 12,
  creditMix: 30,
  newCredit: 60,
};

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  playerName: '',
  isGhostMode: false,
  level: 1,
  xp: 0,
  fedgeCoins: 100,
  streak: 0,
  creditProfile: DEFAULT_CREDIT_PROFILE,
  creditScore: calculateCreditScore(DEFAULT_CREDIT_PROFILE),
  completedModules: [],
  completedChallenges: [],
  achievements: [],

  // Actions
  setPlayerName: (name) => set({ playerName: name }),
  setGhostMode: (ghost) => set({ isGhostMode: ghost }),

  addXP: (amount) =>
    set((state) => {
      const newXP = state.xp + amount;
      const newLevel = Math.floor(newXP / 500) + 1;
      return { xp: newXP, level: newLevel };
    }),

  addFedgeCoins: (amount) =>
    set((state) => ({ fedgeCoins: state.fedgeCoins + amount })),

  updateCreditProfile: (updates) =>
    set((state) => {
      const updatedProfile = { ...state.creditProfile, ...updates };
      return {
        creditProfile: updatedProfile,
        creditScore: calculateCreditScore(updatedProfile),
      };
    }),

  completeModule: (moduleId) =>
    set((state) => ({
      completedModules: [...new Set([...state.completedModules, moduleId])],
    })),

  completeChallenge: (challengeId) =>
    set((state) => ({
      completedChallenges: [...new Set([...state.completedChallenges, challengeId])],
    })),

  unlockAchievement: (achievementId) =>
    set((state) => ({
      achievements: [...new Set([...state.achievements, achievementId])],
    })),

  incrementStreak: () =>
    set((state) => ({ streak: state.streak + 1 })),

  resetStreak: () => set({ streak: 0 }),
}));
