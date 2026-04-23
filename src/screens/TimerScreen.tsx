import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Animated, Modal, ScrollView, StatusBar,
} from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { useAppStore } from '../store';
import { useTimer } from '../hooks/useTimer';
import { useTTS } from '../hooks/useTTS';
import { BlindsDisplay } from '../components/BlindsDisplay';
import { PlayerTracker } from '../components/PlayerTracker';
import { BetTimer } from '../components/BetTimer';
import { COLORS } from '../components/theme';
import { formatTime, calculateTimeToBreak, effectiveBigBlind, buildBlindAnnouncement, buildBreakAnnouncement } from '../utils';

export function TimerScreen() {
  useKeepAwake();
  useTimer();

  const { speak } = useTTS();
  const store    = useAppStore();
  const { settings, players, status, secondsRemaining, currentRound, isOnBreak, breakSecondsRemaining } = store;
  const round    = store.getCurrentRound();
  const nextRound = store.getNextRound();
  const rounds   = store.getRounds();

  const [showBetTimer, setShowBetTimer]           = useState(false);
  const [showStructurePicker, setShowStructurePicker] = useState(false);

  const announceCurrentRound = useCallback(() => {
    const s = useAppStore.getState();
    const { settings } = s;
    if (!settings.sayBlinds) return;
    if (s.isOnBreak) {
      speak(buildBreakAnnouncement(settings.ttsLanguage), settings.ttsLanguage);
      return;
    }
    const r = s.getCurrentRound();
    if (!r) return;
    const bb = effectiveBigBlind(r);
    speak(buildBlindAnnouncement(r.smallBlind, bb, r.ante, settings.ttsLanguage), settings.ttsLanguage);
  }, [speak]);

  const handleNext = () => {
    store.nextRound();
    setTimeout(() => announceCurrentRound(), 300);
  };

  const handlePrev = () => {
    store.prevRound();
    setTimeout(() => announceCurrentRound(), 300);
  };

  const blinkAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (status === 'paused' || status === 'idle') {
      const loop = Animated.loop(Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0.15, duration: 600, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1,    duration: 600, useNativeDriver: true }),
      ]));
      loop.start();
      return () => loop.stop();
    }
    blinkAnim.setValue(1);
  }, [status]);

  const isRunning     = status === 'running' || status === 'break';
  const displayTime   = isOnBreak ? breakSecondsRemaining : secondsRemaining;
  const timeToBreak   = settings.showTimeToBreak
    ? calculateTimeToBreak(rounds, currentRound, secondsRemaining)
    : null;
  const clockFontSize = 72 * settings.clockSizeMultiplier;

  return (
    <SafeAreaView style={[styles.root, isOnBreak && styles.rootBreak]}>
      <StatusBar barStyle="light-content" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setShowStructurePicker(true)}>
          <Text style={styles.structureName}>
            {store.structures[store.modelChoice].name} ▾
          </Text>
        </TouchableOpacity>
        <Text style={styles.roundLabel}>
          {isOnBreak ? 'ON BREAK' : `LEVEL ${currentRound + 1}`}
        </Text>
      </View>

      {/* Main layout */}
      <View style={styles.main}>

        {/* Left: timer + controls */}
        <View style={styles.left}>
          <Animated.Text style={[
            styles.timer,
            { fontSize: clockFontSize },
            (status === 'paused' || status === 'idle') && { opacity: blinkAnim },
            isOnBreak && { color: '#66BB6A' },
          ]}>
            {formatTime(displayTime)}
          </Animated.Text>

          {timeToBreak !== null && !isOnBreak && (
            <Text style={styles.breakStrip}>BREAK IN {formatTime(timeToBreak)}</Text>
          )}

          <View style={styles.controls}>
            <TouchableOpacity style={styles.ctrlBtn} onPress={handlePrev}>
              <Text style={styles.ctrlIcon}>⏮</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ctrlBtn, styles.playBtn]}
              onPress={() => isRunning ? store.pauseTimer() : store.startTimer()}
            >
              <Text style={[styles.ctrlIcon, { color: '#000', fontSize: 26 }]}>
                {isRunning ? '⏸' : '▶'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ctrlBtn} onPress={handleNext}>
              <Text style={styles.ctrlIcon}>⏭</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.clockBtn} onPress={() => setShowBetTimer(true)}>
            <Text style={styles.clockBtnText}>⏱  CALL THE CLOCK</Text>
          </TouchableOpacity>
        </View>

        {/* Right: blinds + optional player tracker */}
        <View style={styles.right}>
          {round && (
            <View style={isOnBreak && styles.blindsDimmed}>
              <BlindsDisplay
                round={round}
                nextRound={nextRound}
                showNextBlind={settings.showNextBlind}
                sizeMultiplier={settings.blindsSizeMultiplier}
              />
            </View>
          )}
          {settings.showStackDetails && (
            <PlayerTracker players={players} onUpdate={store.updatePlayers} />
          )}
        </View>
      </View>

      {/* Bet Timer Modal */}
      <Modal visible={showBetTimer} transparent animationType="fade" onRequestClose={() => setShowBetTimer(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <BetTimer durationSeconds={settings.callTheClockSeconds} />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowBetTimer(false)}>
              <Text style={styles.closeBtnText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Structure Picker Modal */}
      <Modal visible={showStructurePicker} transparent animationType="slide" onRequestClose={() => setShowStructurePicker(false)}>
        <View style={styles.overlay}>
          <View style={styles.pickerCard}>
            <Text style={styles.pickerTitle}>SELECT STRUCTURE</Text>
            <ScrollView>
              {store.structures.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.pickerRow, s.id === store.modelChoice && styles.pickerRowActive]}
                  onPress={() => { store.setModelChoice(s.id); setShowStructurePicker(false); }}
                >
                  <Text style={[styles.pickerText, s.id === store.modelChoice && { color: COLORS.timerText }]}>
                    {s.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowStructurePicker(false)}>
              <Text style={styles.closeBtnText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:           { flex: 1, backgroundColor: COLORS.background },
  rootBreak:      { backgroundColor: '#1A2A1A' },
  topBar:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  structureName:  { color: COLORS.dimText, fontSize: 12, letterSpacing: 1.5 },
  roundLabel:     { color: COLORS.labelText, fontSize: 13, letterSpacing: 2 },
  main:           { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 16 },
  left:           { flex: 1, alignItems: 'center', gap: 14 },
  timer:          { color: COLORS.timerText, fontWeight: '100', letterSpacing: 4 },
  breakStrip:     { color: COLORS.dimText, fontSize: 11, letterSpacing: 2 },
  controls:       { flexDirection: 'row', alignItems: 'center', gap: 20 },
  ctrlBtn:        { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  ctrlIcon:       { fontSize: 22, color: COLORS.primaryText },
  playBtn:        { width: 68, height: 68, borderRadius: 34, backgroundColor: COLORS.accent },
  clockBtn:       { borderWidth: 1, borderColor: COLORS.divider, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  clockBtnText:   { color: COLORS.dimText, fontSize: 11, letterSpacing: 1.5 },
  right:          { alignItems: 'flex-end', gap: 20, minWidth: '38%' },
  blindsDimmed:   { opacity: 0.35 },
  overlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'center' },
  modalCard:      { backgroundColor: COLORS.surface, borderRadius: 16, padding: 24, alignItems: 'center', gap: 16, minWidth: 220 },
  pickerCard:     { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, width: '80%', maxHeight: '60%', gap: 12 },
  pickerTitle:    { color: COLORS.labelText, fontSize: 12, letterSpacing: 2, textAlign: 'center' },
  pickerRow:      { paddingVertical: 14, paddingHorizontal: 12, borderRadius: 8 },
  pickerRowActive:{ backgroundColor: COLORS.surfaceAlt },
  pickerText:     { color: COLORS.dimText, fontSize: 15, letterSpacing: 1 },
  closeBtn:       { paddingHorizontal: 20, paddingVertical: 8 },
  closeBtnText:   { color: COLORS.dimText, fontSize: 12, letterSpacing: 1.5 },
});