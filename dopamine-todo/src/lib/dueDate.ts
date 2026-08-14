import { dayKey } from './gamify';

/** Tailwind text color for a due date input, reflecting overdue/today/upcoming/empty state. */
export function dueDateColor(dueDate: string | null, done: boolean): string {
  if (!dueDate || done) return 'text-white/30';
  const today = dayKey();
  if (dueDate < today) return 'text-red-400';
  if (dueDate === today) return 'text-amber-300';
  return 'text-white/60';
}
