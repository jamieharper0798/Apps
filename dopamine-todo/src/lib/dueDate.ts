import { dayKey } from './gamify';

/** Combined border+text classes for a due-date badge, reflecting overdue/today/upcoming/empty state. */
export function dueDatePillClasses(dueDate: string | null, done: boolean): string {
  if (!dueDate || done) return 'border-ink/10 text-ink/25';
  const today = dayKey();
  if (dueDate < today) return 'border-red-400/40 text-red-400';
  if (dueDate === today) return 'border-accent/50 text-accent';
  return 'border-ink/15 text-ink/50';
}
