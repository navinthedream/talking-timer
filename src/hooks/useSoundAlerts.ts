import { useCallback } from 'react';

// Sound alerts are a no-op until you add assets/sounds/buzzer.wav and chimes.wav
// and uncomment the expo-av implementation below.

export function useSoundAlerts() {
  const playRoundEnd = useCallback(() => {
    // TODO: uncomment once sound files are added
    // const { sound } = await Audio.Sound.createAsync(require('../../assets/sounds/buzzer.wav'));
    // await sound.playAsync();
    console.log('[sound] round end alert');
  }, []);

  const playOneMinute = useCallback(() => {
    console.log('[sound] one minute warning');
  }, []);

  return { playRoundEnd, playOneMinute };
}