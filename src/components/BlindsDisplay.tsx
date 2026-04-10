import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Round } from '../types';
import { effectiveBigBlind, formatBlind } from '../utils';
import { COLORS } from './theme';

interface Props {
  round: Round;
  nextRound: Round | null;
  showNextBlind: boolean;
  sizeMultiplier: number;
}

export function BlindsDisplay({ round, nextRound, showNextBlind, sizeMultiplier }: Props) {
  const bb = effectiveBigBlind(round);
  const m = sizeMultiplier;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { fontSize: 11 * m }]}>BLINDS</Text>
      <Text style={[styles.blindValue, { fontSize: 40 * m }]}>
        {formatBlind(round.smallBlind)}
        <Text style={styles.slash}> / </Text>
        {formatBlind(bb)}
      </Text>

      {round.ante > 0 && (
        <View style={styles.anteRow}>
          <Text style={[styles.label, { fontSize: 10 * m }]}>ANTE</Text>
          <Text style={[styles.anteValue, { fontSize: 26 * m }]}>{formatBlind(round.ante)}</Text>
        </View>
      )}

      {showNextBlind && nextRound && (
        <View style={styles.nextRow}>
          <Text style={styles.nextLabel}>NEXT  </Text>
          <Text style={styles.nextValue}>
            {formatBlind(nextRound.smallBlind)} / {formatBlind(effectiveBigBlind(nextRound))}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { alignItems: 'flex-end', paddingRight: 8 },
  label:      { color: COLORS.labelText, letterSpacing: 2, marginBottom: 2 },
  blindValue: { color: COLORS.blindText, fontWeight: '300' },
  slash:      { color: COLORS.dimText },
  anteRow:    { alignItems: 'flex-end', marginTop: 6 },
  anteValue:  { color: COLORS.anteText, fontWeight: '300' },
  nextRow:    { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  nextLabel:  { color: COLORS.dimText, fontSize: 11, letterSpacing: 2 },
  nextValue:  { color: COLORS.dimText, fontSize: 14 },
});