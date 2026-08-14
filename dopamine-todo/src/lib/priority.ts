import type { Priority } from '../types';

export const PRIORITY_STYLES: Record<Priority, string> = {
  low: 'bg-cyan-400',
  medium: 'bg-amber-400',
  high: 'bg-pink-500',
};

export const PRIORITY_ORDER: Priority[] = ['high', 'medium', 'low'];

export const PRIORITY_SHORT_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};
