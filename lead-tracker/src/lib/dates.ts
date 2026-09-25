/** Date keys are local calendar days as YYYY-MM-DD, so "today" matches the user's wall clock. */

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function toKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromKey(key: string) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey() {
  return toKey(new Date());
}

export function addDays(key: string, days: number) {
  const d = fromKey(key);
  d.setDate(d.getDate() + days);
  return toKey(d);
}

/** Whole days from `from` to `to` (positive when `to` is later). */
export function diffDays(from: string, to: string) {
  return Math.round((fromKey(to).getTime() - fromKey(from).getTime()) / 86_400_000);
}

export function followUpLabel(key: string, today = todayKey()) {
  const diff = diffDays(today, key);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff < 0) return `${-diff} days overdue`;
  if (diff < 7) return fromKey(key).toLocaleDateString(undefined, { weekday: 'long' });
  return fromKey(key).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function timeAgo(iso: string) {
  const days = diffDays(toKey(new Date(iso)), todayKey());
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export const QUICK_FOLLOW_UPS = [
  { label: 'Tomorrow', days: 1 },
  { label: '3 days', days: 3 },
  { label: '1 week', days: 7 },
  { label: '2 weeks', days: 14 },
  { label: '1 month', days: 30 },
];
