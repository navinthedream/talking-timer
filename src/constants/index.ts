import { BlindStructure, Settings } from '../types';

const r = (sb: number, bb: number, ante: number, mins: number, brk = 0) => ({
  smallBlind: sb, bigBlind: bb, ante, durationMinutes: mins,
  breakAfterMinutes: brk, comment: '',
});

export const DEFAULT_STRUCTURES: BlindStructure[] = [
  {
    id: 0, name: 'WSOP 2015',
    rounds: [
      r(25,50,0,20), r(50,100,0,20), r(75,150,0,20), r(100,200,25,20,20),
      r(150,300,25,20), r(200,400,50,20), r(250,500,50,20), r(300,600,75,20,20),
      r(400,800,100,20), r(500,1000,100,20), r(600,1200,200,20), r(800,1600,200,20,20),
      r(1000,2000,300,20), r(1200,2400,400,20), r(1500,3000,500,20), r(2000,4000,500,20),
    ],
  },
  {
    id: 1, name: 'Simple',
    rounds: [
      r(1,2,0,15), r(2,4,0,15), r(3,6,0,15), r(5,10,0,15,15),
      r(10,20,0,15), r(15,30,0,15), r(25,50,0,15), r(50,100,0,15,15),
      r(75,150,0,15), r(100,200,0,15),
    ],
  },
  {
    id: 2, name: 'Party Poker',
    rounds: [
      r(10,20,0,20), r(15,30,0,20), r(20,40,0,20), r(25,50,0,20,15),
      r(50,100,0,20), r(75,150,0,20), r(100,200,25,20), r(150,300,25,20,15),
      r(200,400,50,20), r(300,600,50,20), r(400,800,100,20), r(500,1000,100,20),
    ],
  },
  { id: 3, name: 'Custom 1', rounds: Array.from({length: 30}, () => r(0,0,0,20)) },
  { id: 4, name: 'Custom 2', rounds: Array.from({length: 30}, () => r(0,0,0,20)) },
  { id: 5, name: 'Custom 3', rounds: Array.from({length: 30}, () => r(0,0,0,20)) },
];

export const DEFAULT_SETTINGS: Settings = {
  sayBlinds: true,
  oneMinuteVoiceOn: true,
  ttsLanguage: 'en',
  roundAlertOn: true,
  oneMinuteAlertOn: true,
  vibrateOn: true,
  showStackDetails: false,
  showTimeToBreak: true,
  showNextBlind: true,
  callTheClockSeconds: 30,
  clockSizeMultiplier: 1.2,
  blindsSizeMultiplier: 1.0,
};

export const DEFAULT_PAYOUT_PERCENTAGES: Record<number, number[]> = {
  1: [100],
  2: [60, 40],
  3: [50, 30, 20],
  4: [45, 27, 18, 10],
  5: [40, 25, 17, 12, 6],
  6: [38, 24, 16, 11, 7, 4],
  7: [35, 22, 15, 10, 8, 6, 4],
  8: [33, 21, 14, 10, 8, 6, 5, 3],
  9: [31, 20, 13, 10, 8, 6, 5, 4, 3],
  10: [30, 19, 13, 10, 8, 6, 5, 4, 3, 2],
};

export const TTS_LOCALES: Record<string, string> = {
  en: 'en-US', fr: 'fr-FR', it: 'it-IT',
  de: 'de-DE', es: 'es-ES', ru: 'ru-RU',
};