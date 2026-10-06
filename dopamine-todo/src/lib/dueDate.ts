import { dayKey } from './gamify';

/** Combined pill bg+text classes for a due date, reflecting overdue/today/upcoming/empty state. */
export function dueDatePillClasses(dueDate: string | null, done: boolean): string {
  if (!dueDate || done) return 'text-white/25';
  const today = dayKey();
  if (dueDate < today) return 'bg-red-400/10 text-red-400';
  if (dueDate === today) return 'bg-amber-400/10 text-amber-300';
  return 'text-white/60';
}
