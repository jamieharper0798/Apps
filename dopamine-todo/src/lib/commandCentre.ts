import type { Task } from '../types';
import type { Filter } from '../components/TaskList';

/** Same underlying filter state as the classic view, just displayed as labeled chips in this order. */
export const CC_FILTER_ORDER: { value: Filter; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'done', label: 'Done' },
  { value: 'all', label: 'All' },
];

function dayDiff(dueDate: string, today: string): number {
  const [y, m, d] = dueDate.split('-').map(Number);
  const [ty, tm, td] = today.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const todayDate = new Date(ty, tm - 1, td);
  return Math.round((date.getTime() - todayDate.getTime()) / 86400000);
}

/** "Yesterday" / "Today" / "Tomorrow" / "Thu 30 Oct", or "No date" when unset. */
export function formatCCDue(dueDate: string | null, today: string): string {
  if (!dueDate) return 'No date';
  const diff = dayDiff(dueDate, today);
  if (diff === -1) return 'Yesterday';
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';

  const [y, m, d] = dueDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

export function isOverdue(task: Task, today: string): boolean {
  return !task.done && !!task.dueDate && task.dueDate < today;
}

function isTomorrow(task: Task, today: string): boolean {
  return !task.done && !!task.dueDate && dayDiff(task.dueDate, today) === 1;
}

/** Narrows a task list down to one filter chip's semantics — identical rules to the classic view's. */
export function filterTasksForCommandCentre(tasks: Task[], filter: Filter, today: string): Task[] {
  if (filter === 'active') return tasks.filter((t) => !t.done);
  if (filter === 'overdue') return tasks.filter((t) => isOverdue(t, today));
  if (filter === 'done') return tasks.filter((t) => t.done);
  return tasks;
}

export interface CCGroup {
  key: 'overdue' | 'tomorrow' | 'later' | 'completed';
  label: string;
  dotClassName: string;
  headerClassName: string;
  tasks: Task[];
}

/** Buckets an already-filtered task list into Overdue / Tomorrow / Later / Completed, in that order, skipping empty groups. */
export function groupTasksForCommandCentre(tasks: Task[], today: string): CCGroup[] {
  const overdue = tasks.filter((t) => isOverdue(t, today));
  const tomorrow = tasks.filter((t) => isTomorrow(t, today));
  const completed = tasks.filter((t) => t.done);
  const later = tasks.filter((t) => !t.done && !isOverdue(t, today) && !isTomorrow(t, today));

  const groups: CCGroup[] = [
    { key: 'overdue', label: 'Overdue', dotClassName: 'bg-[var(--cc-red-dot)]', headerClassName: 'text-cc-red', tasks: overdue },
    { key: 'tomorrow', label: 'Tomorrow', dotClassName: 'bg-cc-ink', headerClassName: 'text-cc-ink', tasks: tomorrow },
    { key: 'later', label: 'Later', dotClassName: 'bg-cc-ink', headerClassName: 'text-cc-ink', tasks: later },
    { key: 'completed', label: 'Completed', dotClassName: 'bg-[var(--cc-green-dot)]', headerClassName: 'text-cc-green', tasks: completed },
  ];

  return groups.filter((g) => g.tasks.length > 0);
}

/** A human-presentable first name from a sign-in email, since the app has no dedicated name field. */
export function deriveDisplayName(email: string | null | undefined): string | null {
  if (!email) return null;
  const local = email.split('@')[0];
  if (!local) return null;
  const first = local.split(/[._-]/)[0];
  if (!first) return null;
  return first.charAt(0).toUpperCase() + first.slice(1);
}

export function greetingForHour(hour: number): string {
  if (hour < 5) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/** The single next task to act on (overdue first), plus up to two more as "then" preview rows. */
export function pickFocusTasks(tasks: Task[], today: string): { focus: Task | null; then: Task[] } {
  const pending = tasks.filter((t) => !t.done);
  const overdue = pending
    .filter((t) => isOverdue(t, today))
    .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : a.dueDate! > b.dueDate! ? 1 : 0));
  const rest = pending.filter((t) => !isOverdue(t, today));
  const ordered = [...overdue, ...rest];
  const [focus, ...then] = ordered;
  return { focus: focus ?? null, then: then.slice(0, 2) };
}
