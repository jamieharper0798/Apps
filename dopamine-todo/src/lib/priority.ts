import type { Priority } from '../types';

export const PRIORITY_STYLES: Record<Priority, string> = {
  low: 'bg-white/25',
  medium: 'bg-white/60',
  high: 'bg-[#c6ff4a]',
};

export const PRIORITY_ORDER: Priority[] = ['high', 'medium', 'low'];

export const PRIORITY_SHORT_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

/** Short monospace code shown inside the outlined priority badge. */
export const PRIORITY_CODE: Record<Priority, string> = {
  low: 'LOW',
  medium: 'MED',
  high: 'HIGH',
};

/** Outlined badge classes — high priority gets the accent treatment, the rest stay neutral. */
export const PRIORITY_BADGE_CLASSES: Record<Priority, string> = {
  low: 'border-white/15 text-white/40',
  medium: 'border-white/30 text-white/70',
  high: 'border-[#c6ff4a]/60 text-[#c6ff4a]',
};

/** Neon hex per priority, used for the big glowing ordinal badge on each card. */
export const PRIORITY_NEON: Record<Priority, string> = {
  low: '#4cc9f0',
  medium: '#ffb703',
  high: '#c6ff4a',
};

/** Border + text + glow classes for the big ordinal number badge, color-coded by priority. */
export const PRIORITY_NUMBER_CLASSES: Record<Priority, string> = {
  low: 'border-[#4cc9f0] text-[#4cc9f0] shadow-[0_0_18px_-4px_#4cc9f0]',
  medium: 'border-[#ffb703] text-[#ffb703] shadow-[0_0_18px_-4px_#ffb703]',
  high: 'border-[#c6ff4a] text-[#c6ff4a] shadow-[0_0_18px_-4px_#c6ff4a]',
};
