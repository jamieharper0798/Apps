import { dayKey } from './gamify';

/** Formats an ISO 'YYYY-MM-DD' date as a short terminal-style label: TODAY, T+1D, T-2D, or "OCT 12". */
export function formatDueDate(dueDate: string): string {
  const today = dayKey();
  if (dueDate === today) return 'TODAY';

  const [y, m, d] = dueDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const [ty, tm, td] = today.split('-').map(Number);
  const todayDate = new Date(ty, tm - 1, td);
  const diffDays = Math.round((date.getTime() - todayDate.getTime()) / 86400000);

  if (diffDays > 0 && diffDays < 10) return `T+${diffDays}D`;
  if (diffDays < 0 && diffDays > -10) return `T${diffDays}D`;

  const sameYear = y === ty;
  return date
    .toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: sameYear ? undefined : 'numeric',
    })
    .toUpperCase();
}
