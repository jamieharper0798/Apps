import type { Priority } from '../types';

export const XP_BY_PRIORITY: Record<Priority, number> = {
  low: 10,
  medium: 20,
  high: 35,
};

const LEVEL_TITLES = [
  'Newcomer',
  'Starter',
  'Doer',
  'Achiever',
  'Focused',
  'Consistent',
  'Productive',
  'Momentum Master',
  'Unstoppable',
  'Legend',
];

/** XP required to go from level n to n+1 grows with each level. */
export function xpForLevel(level: number): number {
  return 60 + (level - 1) * 40;
}

export function levelFromTotalXp(totalXp: number): {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
} {
  let level = 1;
  let remaining = totalXp;
  let needed = xpForLevel(level);
  while (remaining >= needed) {
    remaining -= needed;
    level += 1;
    needed = xpForLevel(level);
  }
  return { level, xpIntoLevel: remaining, xpForNextLevel: needed };
}

export function levelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
}

export function dayKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function isYesterday(dayA: string, dayB: string): boolean {
  const a = new Date(dayA + 'T00:00:00');
  const b = new Date(dayB + 'T00:00:00');
  const diff = (a.getTime() - b.getTime()) / 86400000;
  return diff === 1;
}

export const HYPE_MESSAGES = [
  "Nice one! 🔥",
  "You're on fire!",
  "Crushing it! 💪",
  "Big brain move.",
  "Keep the streak alive!",
  "That's the way!",
  "Momentum builds momentum.",
  "One step closer 🚀",
  "Look at you go!",
  "Progress unlocked.",
];

export function randomHype(): string {
  return HYPE_MESSAGES[Math.floor(Math.random() * HYPE_MESSAGES.length)];
}
