import { dayKey } from './gamify';

/** Formats an ISO 'YYYY-MM-DD' date as a short, friendly label: Today, Tomorrow, Mon, or "Oct 12". */
export function formatDueDate(dueDate: string): string {
  const today = dayKey();
  if (dueDate === today) return 'Today';

  const [y, m, d] = dueDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const [ty, tm, td] = today.split('-').map(Number);
  const todayDate = new Date(ty, tm - 1, td);
  const diffDays = Math.round((date.getTime() - todayDate.getTime()) / 86400000);

  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1 && diffDays < 7) return date.toLocaleDateString(undefined, { weekday: 'short' });

  const sameYear = y === ty;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
  });
}
