import { useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';

export function useSoundAlerts() {
  const buzzerRef = useRef<Audio.Sound | null>(null);
  const chimesRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let buzzer: Audio.Sound;
    let chimes: Audio.Sound;

    async function load() {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });
      ({ sound: buzzer } = await Audio.Sound.createAsync(
        require('../../assets/sounds/buzzer1.wav'), { shouldPlay: false }
      ));
      ({ sound: chimes } = await Audio.Sound.createAsync(
        require('../../assets/sounds/chimes.wav'), { shouldPlay: false }
      ));
      buzzerRef.current = buzzer;
      chimesRef.current = chimes;
    }

    load().catch(console.warn);
    return () => {
      buzzer?.unloadAsync().catch(() => {});
      chimes?.unloadAsync().catch(() => {});
    };
  }, []);

  const playRoundEnd = useCallback(async () => {
    try {
      const sound = buzzerRef.current;
      if (!sound) return;
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch (e) { console.warn('playRoundEnd error', e); }
  }, []);

  const playOneMinute = useCallback(async () => {
    try {
      const sound = chimesRef.current;
      if (!sound) return;
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch (e) { console.warn('playOneMinute error', e); }
  }, []);

  return { playRoundEnd, playOneMinute };
}
