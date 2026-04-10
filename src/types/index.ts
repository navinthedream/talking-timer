export interface Round {
    smallBlind: number;
    bigBlind: number;   // 0 = auto (2x smallBlind)
    ante: number;
    durationMinutes: number;
    breakAfterMinutes: number;
    comment: string;
  }
  
  export interface BlindStructure {
    id: number;
    name: string;
    rounds: Round[];
  }
  
  export type TimerStatus = 'idle' | 'running' | 'paused' | 'break';
  
  export interface PlayerState {
    playersRemaining: number;
    rebuysCount: number;
    addonsCount: number;
    buyinChips: number;
    rebuyChips: number;
    addonChips: number;
  }
  
  export type TtsLanguage = 'en' | 'fr' | 'it' | 'de' | 'es' | 'ru';
  
  export interface Settings {
    sayBlinds: boolean;
    oneMinuteVoiceOn: boolean;
    ttsLanguage: TtsLanguage;
    roundAlertOn: boolean;
    oneMinuteAlertOn: boolean;
    vibrateOn: boolean;
    showStackDetails: boolean;
    showTimeToBreak: boolean;
    showNextBlind: boolean;
    callTheClockSeconds: number;
    clockSizeMultiplier: number;
    blindsSizeMultiplier: number;
  }