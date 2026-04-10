import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../components/theme';

function Placeholder({ title }: { title: string }) {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>Coming soon</Text>
    </View>
  );
}

export function BlindEditorScreen() { return <Placeholder title="BLIND EDITOR" />; }
export function PayoutScreen()      { return <Placeholder title="PAYOUT CALCULATOR" />; }
export function SettingsScreen()    { return <Placeholder title="SETTINGS" />; }

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  title: { color: COLORS.timerText, fontSize: 20, letterSpacing: 3, marginBottom: 12 },
  body:  { color: COLORS.dimText, fontSize: 14 },
});