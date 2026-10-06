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
