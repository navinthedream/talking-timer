import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../store';

// To add real sound files:
//   1. Place buzzer.wav and chimes.wav in assets/sounds/
//   2. Uncomment the expo-av imports and Sound calls below

// import { Audio } from 'expo-av';

export function useSoundAlerts() {
  const playRoundEnd = useCallback(async () => {
    const { settings } = useAppStore.getState();
    if (!settings.roundAlertOn) return;

    if (settings.vibrateOn) {
      // Double heavy impact to simulate buzzer
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 150);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 300);
    }

    // Uncomment to add sound (add assets/sounds/buzzer.wav first):
    // try {
    //   const { sound } = await Audio.Sound.createAsync(
    //     require('../../assets/sounds/buzzer.wav')
    //   );
    //   await sound.playAsync();
    //   sound.setOnPlaybackStatusUpdate(status => {
    //     if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
    //   });
    // } catch (e) { console.warn('[sound] round end error', e); }
  }, []);

  const playOneMinute = useCallback(async () => {
    const { settings } = useAppStore.getState();
    if (!settings.oneMinuteAlertOn) return;

    if (settings.vibrateOn) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    // Uncomment to add sound (add assets/sounds/chimes.wav first):
    // try {
    //   const { sound } = await Audio.Sound.createAsync(
    //     require('../../assets/sounds/chimes.wav')
    //   );
    //   await sound.playAsync();
    //   sound.setOnPlaybackStatusUpdate(status => {
    //     if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
    //   });
    // } catch (e) { console.warn('[sound] one minute error', e); }
  }, []);

  return { playRoundEnd, playOneMinute };
}
