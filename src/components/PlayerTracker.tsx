import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PlayerState } from '../types';
import { COLORS } from './theme';

interface Props {
  players: PlayerState;
  onUpdate: (partial: Partial<PlayerState>) => void;
}

function Counter({ label, value, onInc, onDec }: {
  label: string; value: number; onInc: () => void; onDec: () => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.btn} onPress={onDec}>
        <Text style={styles.btnText}>−</Text>
      </TouchableOpacity>
      <Text style={styles.value}>{value}</Text>
      <TouchableOpacity style={styles.btn} onPress={onInc}>
        <Text style={styles.btnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

export function PlayerTracker({ players, onUpdate }: Props) {
  const totalChips =
    (players.playersRemaining * players.buyinChips) +
    (players.rebuysCount * players.rebuyChips) +
    (players.addonsCount * players.addonChips);
  const avgStack = players.playersRemaining > 0
    ? Math.round(totalChips / players.playersRemaining)
    : 0;

  return (
    <View style={styles.container}>
      <Counter
        label="PLAYERS"
        value={players.playersRemaining}
        onInc={() => onUpdate({ playersRemaining: players.playersRemaining + 1 })}
        onDec={() => onUpdate({ playersRemaining: Math.max(1, players.playersRemaining - 1) })}
      />
      <Counter
        label="REBUYS"
        value={players.rebuysCount}
        onInc={() => onUpdate({ rebuysCount: players.rebuysCount + 1 })}
        onDec={() => onUpdate({ rebuysCount: Math.max(0, players.rebuysCount - 1) })}
      />
      <View style={[styles.row, styles.stackRow]}>
        <Text style={styles.label}>AVG STACK</Text>
        <Text style={styles.stackValue}>{avgStack.toLocaleString()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    gap: 10,
    minWidth: 190,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  label: { color: COLORS.labelText, fontSize: 11, letterSpacing: 1.5, flex: 1 },
  btn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: COLORS.btnBg, alignItems: 'center', justifyContent: 'center',
  },
  btnText: { color: COLORS.primaryText, fontSize: 18, lineHeight: 20 },
  value: { color: COLORS.primaryText, fontSize: 18, minWidth: 30, textAlign: 'center' },
  stackRow: { paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.divider },
  stackValue: { color: COLORS.timerText, fontSize: 16 },
});