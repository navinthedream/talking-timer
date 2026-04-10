import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlindStructure, PlayerState, Settings, TimerStatus } from '../types';
import { DEFAULT_STRUCTURES, DEFAULT_SETTINGS } from '../constants';
import { activeRounds, effectiveBigBlind } from '../utils';

const KEYS = {
  modelChoice: 'modelChoice',
  currentRound: 'currentRound',
  timerRemains: 'timerRemains',
  isOnBreak: 'isOnBreak',
  playerState: 'playerState',
  settings: 'settings',
  structures: 'structures',
};

interface AppState {
  // Blind structures
  structures: BlindStructure[];
  modelChoice: number;

  // Timer
  status: TimerStatus;
  currentRound: number;
  secondsRemaining: number;
  isOnBreak: boolean;
  breakSecondsRemaining: number;

  // Players
  players: PlayerState;

  // Settings
  settings: Settings;

  // Helpers
  getRounds: () => ReturnType<typeof activeRounds>;
  getCurrentRound: () => BlindStructure['rounds'][0] | null;
  getNextRound: () => BlindStructure['rounds'][0] | null;

  // Actions
  setModelChoice: (id: number) => void;
  updateStructure: (structure: BlindStructure) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  tick: () => void;
  nextRound: () => void;
  prevRound: () => void;
  goToRound: (r: number) => void;
  updatePlayers: (partial: Partial<PlayerState>) => void;
  updateSettings: (partial: Partial<Settings>) => void;
  saveState: () => Promise<void>;
  loadState: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  structures: DEFAULT_STRUCTURES,
  modelChoice: 0,
  status: 'idle',
  currentRound: 0,
  secondsRemaining: DEFAULT_STRUCTURES[0].rounds[0].durationMinutes * 60,
  isOnBreak: false,
  breakSecondsRemaining: 0,
  players: {
    playersRemaining: 9,
    rebuysCount: 0,
    addonsCount: 0,
    buyinChips: 1500,
    rebuyChips: 1500,
    addonChips: 2000,
  },
  settings: DEFAULT_SETTINGS,

  getRounds: () => activeRounds(get().structures[get().modelChoice].rounds),

  getCurrentRound: () => {
    const { currentRound } = get();
    const rounds = get().getRounds();
    return rounds[currentRound] ?? null;
  },

  getNextRound: () => {
    const { currentRound } = get();
    const rounds = get().getRounds();
    return rounds[currentRound + 1] ?? null;
  },

  setModelChoice: (id) => {
    const rounds = activeRounds(get().structures[id].rounds);
    set({
      modelChoice: id,
      currentRound: 0,
      secondsRemaining: (rounds[0]?.durationMinutes ?? 20) * 60,
      status: 'idle',
      isOnBreak: false,
    });
  },

  updateStructure: (structure) => {
    const structures = [...get().structures];
    structures[structure.id] = structure;
    set({ structures });
  },

  startTimer: () => set({ status: 'running' }),
  pauseTimer: () => set({ status: 'paused' }),

  tick: () => {
    const { isOnBreak, breakSecondsRemaining, secondsRemaining } = get();

    if (isOnBreak) {
      if (breakSecondsRemaining <= 1) {
        const round = get().getCurrentRound();
        set({
          isOnBreak: false,
          breakSecondsRemaining: 0,
          status: 'running',
          secondsRemaining: (round?.durationMinutes ?? 20) * 60,
        });
      } else {
        set({ breakSecondsRemaining: breakSecondsRemaining - 1 });
      }
      return;
    }

    if (secondsRemaining <= 1) {
      set({ secondsRemaining: 0, status: 'paused' });
      // useTimer hook handles the round advance after alerts fire
    } else {
      set({ secondsRemaining: secondsRemaining - 1 });
    }
  },

  nextRound: () => {
    const { currentRound, structures, modelChoice } = get();
    const rounds = activeRounds(structures[modelChoice].rounds);
    const nextIndex = currentRound + 1;
    if (nextIndex >= rounds.length) return;

    const current = rounds[currentRound];
    const next = rounds[nextIndex];

    if (current?.breakAfterMinutes > 0) {
      set({
        currentRound: nextIndex,
        isOnBreak: true,
        breakSecondsRemaining: current.breakAfterMinutes * 60,
        secondsRemaining: next.durationMinutes * 60,
        status: 'break',
      });
    } else {
      set({
        currentRound: nextIndex,
        secondsRemaining: next.durationMinutes * 60,
        status: 'paused',
        isOnBreak: false,
      });
    }
  },

  prevRound: () => {
    const { currentRound } = get();
    if (currentRound <= 0) return;
    get().goToRound(currentRound - 1);
  },

  goToRound: (r) => {
    const rounds = get().getRounds();
    const clamped = Math.max(0, Math.min(r, rounds.length - 1));
    set({
      currentRound: clamped,
      secondsRemaining: (rounds[clamped]?.durationMinutes ?? 20) * 60,
      status: 'paused',
      isOnBreak: false,
    });
  },

  updatePlayers: (partial) =>
    set((s) => ({ players: { ...s.players, ...partial } })),

  updateSettings: (partial) =>
    set((s) => ({ settings: { ...s.settings, ...partial } })),

  saveState: async () => {
    const { modelChoice, currentRound, secondsRemaining, status, isOnBreak, players, settings, structures } = get();
    try {
      await AsyncStorage.multiSet([
        [KEYS.modelChoice,  String(modelChoice)],
        [KEYS.currentRound, String(currentRound)],
        [KEYS.timerRemains, String(secondsRemaining)],
        [KEYS.isOnBreak,    String(isOnBreak)],
        [KEYS.playerState,  JSON.stringify(players)],
        [KEYS.settings,     JSON.stringify(settings)],
        [KEYS.structures,   JSON.stringify(structures)],
      ]);
    } catch (e) {
      console.warn('saveState error', e);
    }
  },

  loadState: async () => {
    try {
      const pairs = await AsyncStorage.multiGet(Object.values(KEYS));
      const stored: Record<string, string | null> = {};
      pairs.forEach(([k, v]) => { stored[k] = v; });

      const modelChoice  = stored[KEYS.modelChoice]  != null ? Number(stored[KEYS.modelChoice])  : 0;
      const currentRound = stored[KEYS.currentRound] != null ? Number(stored[KEYS.currentRound]) : 0;
      const timerRemains = stored[KEYS.timerRemains] != null ? Number(stored[KEYS.timerRemains]) : null;
      const isOnBreak    = stored[KEYS.isOnBreak] === 'true';
      const players      = stored[KEYS.playerState] ? JSON.parse(stored[KEYS.playerState]!) : null;
      const settings     = stored[KEYS.settings]    ? JSON.parse(stored[KEYS.settings]!)    : null;
      const structures   = stored[KEYS.structures]  ? JSON.parse(stored[KEYS.structures]!)  : null;

      const nextStructures = structures ?? DEFAULT_STRUCTURES;
      const nextRounds     = activeRounds(nextStructures[modelChoice].rounds);
      const defaultSeconds = (nextRounds[currentRound]?.durationMinutes ?? 20) * 60;

      set({
        modelChoice,
        currentRound,
        secondsRemaining: timerRemains ?? defaultSeconds,
        isOnBreak,
        status: 'paused',
        structures: nextStructures,
        players:    players   ?? get().players,
        settings:   settings  ?? DEFAULT_SETTINGS,
      });
    } catch (e) {
      console.warn('loadState error', e);
    }
  },
}));