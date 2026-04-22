import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../store';
import { useTTS } from './useTTS';
import { useSoundAlerts } from './useSoundAlerts';
import { effectiveBigBlind, buildBlindAnnouncement, buildOneMinuteWarning, buildBreakAnnouncement } from '../utils';

export function useTimer() {
  const { speak } = useTTS();
  const { playRoundEnd, playOneMinute } = useSoundAlerts();

  const statusRef         = useRef(useAppStore.getState().status);
  const secondsRef        = useRef(useAppStore.getState().secondsRemaining);
  const isOnBreakRef      = useRef(useAppStore.getState().isOnBreak);
  const oneMinuteFiredRef = useRef(false);
  const roundOverFiredRef = useRef(false);

  // Keep refs fresh
  useEffect(() => useAppStore.subscribe(
    (s) => {
      statusRef.current    = s.status;
      secondsRef.current   = s.secondsRemaining;
      isOnBreakRef.current = s.isOnBreak;
    }
  ), []);

  // Reset alert flags on round change (zustand v5: subscribe takes single listener)
  useEffect(() => {
    let prevRound = useAppStore.getState().currentRound;
    return useAppStore.subscribe(s => {
      if (s.currentRound !== prevRound) {
        prevRound = s.currentRound;
        oneMinuteFiredRef.current = false;
        roundOverFiredRef.current = false;
      }
    });
  }, []);

  const announceCurrentRound = useCallback(() => {
    const s = useAppStore.getState();
    const { settings } = s;
    if (!settings.sayBlinds) return;

    if (s.isOnBreak) {
      speak(buildBreakAnnouncement(settings.ttsLanguage), settings.ttsLanguage);
      return;
    }

    const round = s.getCurrentRound();
    if (!round) return;
    const bb = effectiveBigBlind(round);
    speak(buildBlindAnnouncement(round.smallBlind, bb, round.ante, settings.ttsLanguage), settings.ttsLanguage);
    if (round.comment) {
      setTimeout(() => speak(round.comment, settings.ttsLanguage), 2500);
    }
  }, [speak]);

  const handleRoundOver = useCallback(() => {
    if (roundOverFiredRef.current) return;
    roundOverFiredRef.current = true;

    const { settings } = useAppStore.getState();
    if (settings.roundAlertOn) playRoundEnd();

    setTimeout(() => {
      useAppStore.getState().nextRound();
      if (!useAppStore.getState().isOnBreak) {
        useAppStore.getState().startTimer();
      }
      announceCurrentRound();
    }, 800);
  }, [playRoundEnd, announceCurrentRound]);

  const handleOneMinute = useCallback(() => {
    if (oneMinuteFiredRef.current) return;
    oneMinuteFiredRef.current = true;

    const { settings } = useAppStore.getState();
    if (settings.oneMinuteAlertOn) playOneMinute();
    if (settings.oneMinuteVoiceOn) {
      speak(buildOneMinuteWarning(settings.ttsLanguage), settings.ttsLanguage);
    }
  }, [playOneMinute, speak]);

  useEffect(() => {
    const interval = setInterval(() => {
      const status = statusRef.current;
      if (status !== 'running' && status !== 'break') return;

      const seconds  = secondsRef.current;
      const onBreak  = isOnBreakRef.current;

      if (!onBreak && seconds === 60) handleOneMinute();
      if (!onBreak && seconds <= 1) { handleRoundOver(); return; }

      useAppStore.getState().tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [handleOneMinute, handleRoundOver]);
}