/**
 * FEDGE 2.O — Main Bottom Tab Navigator
 * Home | Missions | Simulator | Profile
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
// View/Text/StyleSheet still used by TabIcon below
import { COLORS, FONTS, RADIUS } from '@constants/theme';
import HomeScreen from '@screens/main/HomeScreen';
import SimulatorScreen from '@screens/main/SimulatorScreen';
import MissionsNavigator from './MissionsNavigator';
import ProfileScreen from '@screens/main/ProfileScreen';

export type MainTabParamList = {
  Home: undefined;
  Missions: undefined;
  Simulator: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  Home:      { active: '🏠', inactive: '🏠' },
  Missions:  { active: '🎯', inactive: '🎯' },
  Simulator: { active: '🔮', inactive: '🔮' },
  Profile:   { active: '👤', inactive: '👤' },
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  return (
    <View style={[tabStyles.iconWrap, focused && tabStyles.iconActive]}>
      <Text style={tabStyles.iconEmoji}>{TAB_ICONS[name]?.active}</Text>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  iconWrap: {
    width: 44, height: 44, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  iconActive: {
    backgroundColor: COLORS.primaryGlow,
  },
  iconEmoji: { fontSize: 22 },
});

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.bgCard,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 82,
          paddingBottom: 16,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: FONTS.sizes.xs,
          fontWeight: '700',
          marginTop: 2,
        },
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Missions" component={MissionsNavigator} />
      <Tab.Screen name="Simulator" component={SimulatorScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
