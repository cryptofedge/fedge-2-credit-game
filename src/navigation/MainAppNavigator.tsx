/**
 * FEDGE 2.O — Main App Navigator
 * Wraps the bottom tabs in a stack so modal screens (Leaderboard, etc.)
 * can be pushed from any tab without breaking the tab bar.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';
import LeaderboardScreen from '@screens/main/LeaderboardScreen';

export type MainAppStackParamList = {
  Tabs: undefined;
  Leaderboard: undefined;
};

const Stack = createNativeStackNavigator<MainAppStackParamList>();

export default function MainAppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Tabs" component={MainTabNavigator} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
    </Stack.Navigator>
  );
}
