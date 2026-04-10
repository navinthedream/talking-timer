import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from './theme';

interface Props {
  durationSeconds: number;
}

export function BetTimer({ durationSeconds }: Props) {
  const [seconds, setSeconds] = useState(durationSeconds);
  const [running, setRunning] = useState(false);
  const [done, setDone]       = useState(false);
  const intervalRef           = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { reset(); }, [durationSeconds]);

  function start() {
    if (running || done) return;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          setRunning(false);
          setDone(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  function reset() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSeconds(durationSeconds);
    setRunning(false);
    setDone(false);
  }

  const pct = seconds / durationSeconds;
  const barColor = done ? COLORS.danger : seconds <= 10 ? COLORS.warning : COLORS.timerText;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>CALL THE CLOCK</Text>
      <Text style={[styles.countdown, done && { color: COLORS.danger }]}>{seconds}s</Text>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%` as any, backgroundColor: barColor }]} />
      </View>

      <View style={styles.btnRow}>
        {!running && !done && (
          <TouchableOpacity style={styles.startBtn} onPress={start}>
            <Text style={styles.startText}>START</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.resetBtn} onPress={reset}>
          <Text style={styles.resetText}>RESET</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { alignItems: 'center', gap: 12, padding: 8 },
  label:      { color: COLORS.labelText, fontSize: 11, letterSpacing: 2 },
  countdown:  { color: COLORS.primaryText, fontSize: 42 },
  track:      { width: 180, height: 6, backgroundColor: COLORS.divider, borderRadius: 3, overflow: 'hidden' },
  fill:       { height: '100%', borderRadius: 3 },
  btnRow:     { flexDirection: 'row', gap: 10 },
  startBtn:   { backgroundColor: COLORS.accent, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 8 },
  startText:  { color: '#000', fontSize: 12, letterSpacing: 1 },
  resetBtn:   { borderWidth: 1, borderColor: COLORS.divider, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 8 },
  resetText:  { color: COLORS.dimText, fontSize: 12, letterSpacing: 1 },
});