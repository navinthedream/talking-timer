import { Round } from '../types';

export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function effectiveBigBlind(round: Round): number {
  return round.bigBlind === 0 ? round.smallBlind * 2 : round.bigBlind;
}

export function formatBlind(value: number): string {
  if (value >= 1000) {
    const k = value / 1000;
    return k % 1 === 0 ? `${k}K` : `${k.toFixed(1)}K`;
  }
  return String(value);
}

export function isEmptyRound(round: Round): boolean {
  return round.smallBlind === 0 && round.durationMinutes === 0;
}

export function activeRounds(rounds: Round[]): Round[] {
  return rounds.filter(r => !isEmptyRound(r));
}

export function calculateTimeToBreak(
  rounds: Round[],
  currentRound: number,
  secondsRemaining: number
): number | null {
  const current = rounds[currentRound];
  if (!current) return null;
  if (current.breakAfterMinutes > 0) return secondsRemaining;
  let total = secondsRemaining;
  for (let i = currentRound + 1; i < rounds.length; i++) {
    const round = rounds[i];
    if (isEmptyRound(round)) break;
    total += round.durationMinutes * 60;
    if (round.breakAfterMinutes > 0) return total;
  }
  return null;
}

export function buildBlindAnnouncement(sb: number, bb: number, ante: number, lang: string): string {
  const n = (v: number) => {
    if (v >= 1000) {
      const t = Math.floor(v / 1000);
      const h = Math.floor((v % 1000) / 100) * 100;
      return h > 0 ? `${t} thousand ${h}` : `${t} thousand`;
    }
    return String(v);
  };
  const phrases: Record<string, string> = {
    en: `Small blind is ${n(sb)}, big blind is ${n(bb)}${ante > 0 ? `, ante ${n(ante)}` : ''}`,
    fr: `Petite blinde ${n(sb)}, grande blinde ${n(bb)}${ante > 0 ? `, mise ${n(ante)}` : ''}`,
    it: `Buio piccolo ${n(sb)}, buio grande ${n(bb)}${ante > 0 ? `, ante ${n(ante)}` : ''}`,
    de: `Small Blind ${n(sb)}, Big Blind ${n(bb)}${ante > 0 ? `, Ante ${n(ante)}` : ''}`,
    es: `Ciega pequeña ${n(sb)}, ciega grande ${n(bb)}${ante > 0 ? `, ante ${n(ante)}` : ''}`,
    ru: `Малый блайнд ${n(sb)}, большой блайнд ${n(bb)}${ante > 0 ? `, антэ ${n(ante)}` : ''}`,
  };
  return phrases[lang] ?? phrases.en;
}

export function buildOneMinuteWarning(lang: string): string {
  const phrases: Record<string, string> = {
    en: 'One minute remaining', fr: 'Une minute restante',
    it: 'Un minuto rimanente', de: 'Noch eine Minute',
    es: 'Un minuto restante', ru: 'Одна минута осталась',
  };
  return phrases[lang] ?? phrases.en;
}

export function buildBreakAnnouncement(lang: string): string {
  const phrases: Record<string, string> = {
    en: 'Time for a break', fr: "Pause",
    it: 'Pausa', de: 'Pause',
    es: 'Descanso', ru: 'Перерыв',
  };
  return phrases[lang] ?? phrases.en;
}