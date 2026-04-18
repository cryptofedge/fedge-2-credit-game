/**
 * FEDGE 2.O — Missions Stack Navigator
 * MissionsList → MissionOne → (future missions)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MissionsListScreen from '@screens/missions/MissionsListScreen';
import MissionOneScreen from '@screens/missions/MissionOneScreen';
import MissionTwoScreen from '@screens/missions/MissionTwoScreen';
import ScenarioScreen from '@screens/scenarios/ScenarioScreen';

export type MissionsStackParamList = {
  MissionsList: undefined;
  MissionOne:   undefined;
  MissionTwo:   undefined;
  Scenarios:    { chapterId: string; scenarioId?: string };
};

const Stack = createNativeStackNavigator<MissionsStackParamList>();

export default function MissionsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="MissionsList" component={MissionsListScreen} />
      <Stack.Screen name="MissionOne" component={MissionOneScreen} />
      <Stack.Screen name="MissionTwo" component={MissionTwoScreen} />
      <Stack.Screen name="Scenarios"  component={ScenarioScreen} />
    </Stack.Navigator>
  );
}
