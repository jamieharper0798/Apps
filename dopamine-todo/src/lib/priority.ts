import type { Priority } from '../types';

export const PRIORITY_STYLES: Record<Priority, string> = {
  low: 'bg-ink/25',
  medium: 'bg-ink/60',
  high: 'bg-accent',
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
  low: 'border-ink/15 text-ink/40 bg-ink/[0.02]',
  medium: 'border-ink/30 text-ink/70 bg-ink/[0.02]',
  high: 'border-accent/60 text-accent bg-accent/[0.06]',
};

/** Border + text + glow classes for the big ordinal number badge, color-coded by priority. */
export const PRIORITY_NUMBER_CLASSES: Record<Priority, string> = {
  low: 'border-prio-low text-prio-low shadow-[0_0_26px_-6px_var(--prio-low)]',
  medium: 'border-prio-medium text-prio-medium shadow-[0_0_26px_-6px_var(--prio-medium)]',
  high: 'border-accent text-accent shadow-[0_0_26px_-6px_var(--accent)]',
};
