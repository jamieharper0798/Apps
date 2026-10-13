import type { Repeat } from '../types';
import { dayKey } from './gamify';

export const REPEAT_ORDER: Repeat[] = ['none', 'daily', 'weekly'];

export const REPEAT_CODE: Record<Repeat, string> = {
  none: 'OFF',
  daily: 'DAILY',
  weekly: 'WEEKLY',
};

/** The next due date for a recurring task, advancing from its current due date (or today if unset). */
export function nextDueDate(repeat: Repeat, currentDueDate: string | null): string | null {
  if (repeat === 'none') return currentDueDate;
  const days = repeat === 'daily' ? 1 : 7;
  const base = currentDueDate ?? dayKey();
  const [y, m, d] = base.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return dayKey(date);
}
