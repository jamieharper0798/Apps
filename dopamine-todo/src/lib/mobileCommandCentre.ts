import type { Task } from '../types';
import type { Filter } from '../components/TaskList';
import { dayKey, isYesterday } from './gamify';
import { isOverdue } from './commandCentre';

export const MOBILE_DAILY_GOAL = 5;

export function tomorrowOf(today: string): string {
  const [y, m, d] = today.split('-').map(Number);
  const date = new Date(y, m - 1, d + 1);
  return dayKey(date);
}

/** Soonest due date first, undated tasks last — same ordering rule as the desktop Command
    Centre's own (private) sortByDueDate, duplicated here rather than exported from
    commandCentre.ts to avoid touching that file for an already-tiny helper. */
export function sortByDue(tasks: Task[]): Task[] {
  const withDate = tasks
    .filter((t) => t.dueDate !== null)
    .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : a.dueDate! > b.dueDate! ? 1 : 0));
  const withoutDate = tasks.filter((t) => t.dueDate === null);
  return [...withDate, ...withoutDate];
}

/** The next 3 pending tasks after the Focus card's task, in the same due-date order. */
export function pickUpNext(tasks: Task[], excludeId: string | null): Task[] {
  const ordered = sortByDue(tasks.filter((t) => !t.done && t.id !== excludeId));
  return ordered.slice(0, 3);
}

function isTomorrow(dueDate: string, today: string): boolean {
  return isYesterday(dueDate, today);
}

export type MobileGroupKey = 'overdue' | 'today' | 'tomorrow' | 'later' | 'nodate' | 'completed';

export interface MobileGroup {
  key: MobileGroupKey;
  label: string;
  tasks: Task[];
}

const GROUP_LABELS: Record<MobileGroupKey, string> = {
  overdue: 'Overdue',
  today: 'Today',
  tomorrow: 'Tomorrow',
  later: 'Later',
  nodate: 'No date',
  completed: 'Completed',
};

/** Buckets an already-filtered/searched task list by due date, in the order the iPhone spec
    calls for: Overdue, Today, Tomorrow, Later, No date, Completed — skipping empty groups. */
export function groupTasksByDueBucket(tasks: Task[], today: string): MobileGroup[] {
  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done).sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));

  const buckets: Record<Exclude<MobileGroupKey, 'completed'>, Task[]> = {
    overdue: [],
    today: [],
    tomorrow: [],
    later: [],
    nodate: [],
  };

  for (const t of pending) {
    if (!t.dueDate) buckets.nodate.push(t);
    else if (t.dueDate < today) buckets.overdue.push(t);
    else if (t.dueDate === today) buckets.today.push(t);
    else if (isTomorrow(t.dueDate, today)) buckets.tomorrow.push(t);
    else buckets.later.push(t);
  }

  const order: MobileGroupKey[] = ['overdue', 'today', 'tomorrow', 'later', 'nodate', 'completed'];
  return order
    .map((key) => ({
      key,
      label: GROUP_LABELS[key],
      tasks: key === 'completed' ? done : sortByDue(buckets[key as Exclude<MobileGroupKey, 'completed'>]),
    }))
    .filter((g) => g.tasks.length > 0);
}

/** Case-insensitive match across title, notes and owner, for the Tasks screen search field. */
export function searchTasks(tasks: Task[], query: string): Task[] {
  const q = query.trim().toLowerCase();
  if (!q) return tasks;
  return tasks.filter(
    (t) => t.text.toLowerCase().includes(q) || t.notes.toLowerCase().includes(q) || t.owner.toLowerCase().includes(q),
  );
}

export interface MobileFilterChip {
  value: Filter;
  label: string;
  count: number;
}

/** All/Active/Done/Overdue chips with counts — Overdue only appears when it's non-zero, same
    rule as the classic view and desktop Command Centre. */
export function mobileFilterChips(tasks: Task[], today: string): MobileFilterChip[] {
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const active = total - done;
  const overdue = tasks.filter((t) => isOverdue(t, today)).length;
  const chips: MobileFilterChip[] = [
    { value: 'all', label: 'All', count: total },
    { value: 'active', label: 'Active', count: active },
    { value: 'done', label: 'Done', count: done },
  ];
  if (overdue > 0) chips.push({ value: 'overdue', label: 'Overdue', count: overdue });
  return chips;
}

/** ISO day keys for the last `count` days, oldest first, ending on `today`. */
function lastDays(today: string, count: number): string[] {
  const [y, m, d] = today.split('-').map(Number);
  const base = new Date(y, m - 1, d);
  const days: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(base);
    date.setDate(date.getDate() - i);
    days.push(dayKey(date));
  }
  return days;
}

export interface DayBar {
  day: string;
  label: string;
  count: number;
}

/** Tasks don't persist a per-day completion log, so this derives "Cleared this week" live from
    each task's own completedAt timestamp (scanning the current tasks array) instead of adding a
    new aggregate field to dopamine state — keeping the data model exactly as it is today. */
export function weeklyCompletionBars(tasks: Task[], today: string): DayBar[] {
  const days = lastDays(today, 7);
  const counts = new Map(days.map((d) => [d, 0]));
  for (const t of tasks) {
    if (t.completedAt === null) continue;
    const key = dayKey(new Date(t.completedAt));
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return days.map((d) => {
    const [y, m, dd] = d.split('-').map(Number);
    const date = new Date(y, m - 1, dd);
    return { day: d, label: date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 1), count: counts.get(d) ?? 0 };
  });
}

/** Same 7-day window as the bar chart, but as a simple "did anything get cleared that day"
    boolean row, for the Progress screen's streak strip. */
export function weeklyStreakDots(tasks: Task[], today: string): { day: string; label: string; cleared: boolean }[] {
  return weeklyCompletionBars(tasks, today).map(({ day, label, count }) => ({ day, label, cleared: count > 0 }));
}
