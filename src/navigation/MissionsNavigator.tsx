/**
 * FEDGE 2.O — Missions Stack Navigator
 * MissionsList → MissionOne → (future missions)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MissionsListScreen from '@screens/missions/MissionsListScreen';
import MissionOneScreen from '@screens/missions/MissionOneScreen';

export type MissionsStackParamList = {
  MissionsList: undefined;
  MissionOne: undefined;
};

const Stack = createNativeStackNavigator<MissionsStackParamList>();

export default function MissionsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="MissionsList" component={MissionsListScreen} />
      <Stack.Screen name="MissionOne" component={MissionOneScreen} />
    </Stack.Navigator>
  );
}
