import { dayKey } from './gamify';

/** Combined border+text classes for a due-date badge, reflecting overdue/today/upcoming/empty state. */
export function dueDatePillClasses(dueDate: string | null, done: boolean): string {
  if (!dueDate || done) return 'border-white/10 text-white/25';
  const today = dayKey();
  if (dueDate < today) return 'border-red-400/40 text-red-400';
  if (dueDate === today) return 'border-[#c6ff4a]/50 text-[#c6ff4a]';
  return 'border-white/15 text-white/50';
}
