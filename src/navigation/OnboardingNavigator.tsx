/**
 * FEDGE 2.O — Onboarding Navigation Stack
 * Linear flow: Splash → HeroIntro → ChoosePath → ConnectBureaus → ScoreReveal → FirstMission
 * No back button — forward momentum keeps engagement high (Candy Crush principle)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '@screens/onboarding/SplashScreen';
import HeroIntroScreen from '@screens/onboarding/HeroIntroScreen';
import ChoosePathScreen from '@screens/onboarding/ChoosePathScreen';
import ConnectBureausScreen from '@screens/onboarding/ConnectBureausScreen';
import ScoreRevealScreen from '@screens/onboarding/ScoreRevealScreen';
import FirstMissionScreen from '@screens/onboarding/FirstMissionScreen';

export type OnboardingStackParamList = {
  Splash: undefined;
  HeroIntro: undefined;
  ChoosePath: undefined;
  ConnectBureaus: undefined;
  ScoreReveal: undefined;
  FirstMission: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: false,      // No swipe-back — forward only!
        contentStyle: { backgroundColor: '#06060F' },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="HeroIntro" component={HeroIntroScreen} />
      <Stack.Screen name="ChoosePath" component={ChoosePathScreen} />
      <Stack.Screen name="ConnectBureaus" component={ConnectBureausScreen} />
      <Stack.Screen name="ScoreReveal" component={ScoreRevealScreen} />
      <Stack.Screen name="FirstMission" component={FirstMissionScreen} />
    </Stack.Navigator>
  );
}
