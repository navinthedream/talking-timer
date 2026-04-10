import { useCallback } from 'react';
import * as Speech from 'expo-speech';
import { TTS_LOCALES } from '../constants';

export function useTTS() {
  const speak = useCallback((text: string, lang = 'en') => {
    Speech.stop();
    Speech.speak(text, { language: TTS_LOCALES[lang] ?? 'en-US', pitch: 1.0, rate: 0.9 });
  }, []);

  const stop = useCallback(() => Speech.stop(), []);

  return { speak, stop };
}