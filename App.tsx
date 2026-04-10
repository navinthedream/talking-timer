import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TimerScreen } from './src/screens/TimerScreen';
import { BlindEditorScreen, PayoutScreen, SettingsScreen } from './src/screens/PlaceholderScreens';
import { useAppStore } from './src/store';
import { COLORS } from './src/components/theme';

const Tab = createBottomTabNavigator();

const icon = (emoji: string) => () => <Text style={{ fontSize: 20 }}>{emoji}</Text>;

export default function App() {
  const loadState = useAppStore((s) => s.loadState);
  const saveState = useAppStore((s) => s.saveState);

  useEffect(() => { loadState(); }, []);

  useEffect(() => {
    const id = setInterval(() => saveState(), 10_000);
    return () => { clearInterval(id); saveState(); };
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: COLORS.timerText,
          tabBarInactiveTintColor: COLORS.dimText,
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        <Tab.Screen name="Timer"    component={TimerScreen}      options={{ tabBarIcon: icon('⏱') }} />
        <Tab.Screen name="Blinds"   component={BlindEditorScreen} options={{ tabBarIcon: icon('📋') }} />
        <Tab.Screen name="Payout"   component={PayoutScreen}      options={{ tabBarIcon: icon('💰') }} />
        <Tab.Screen name="Settings" component={SettingsScreen}    options={{ tabBarIcon: icon('⚙️') }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar:   { backgroundColor: COLORS.surface, borderTopColor: COLORS.divider, borderTopWidth: 1 },
  tabLabel: { fontSize: 10, letterSpacing: 1, marginBottom: 2 },
});