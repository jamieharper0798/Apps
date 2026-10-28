import type { Task } from '../types';
import type { Filter } from '../components/TaskList';
import { PRIORITY_ORDER, PRIORITY_SHORT_LABELS } from './priority';

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

/** Narrows a task list down to one filter chip's semantics — identical rules to the classic view's. */
export function filterTasksForCommandCentre(tasks: Task[], filter: Filter, today: string): Task[] {
  if (filter === 'active') return tasks.filter((t) => !t.done);
  if (filter === 'overdue') return tasks.filter((t) => isOverdue(t, today));
  if (filter === 'done') return tasks.filter((t) => t.done);
  return tasks;
}

export interface CCGroup {
  key: Task['priority'];
  label: string;
  dotClassName: string;
  headerClassName: string;
  tasks: Task[];
}

const PRIORITY_GROUP_STYLE: Record<Task['priority'], { dotClassName: string; headerClassName: string }> = {
  high: { dotClassName: 'bg-cc-teal', headerClassName: 'text-cc-teal' },
  medium: { dotClassName: 'bg-cc-ink', headerClassName: 'text-cc-ink' },
  low: { dotClassName: 'bg-cc-ink-4', headerClassName: 'text-cc-ink-3' },
};

/** Buckets an already-filtered task list into High / Medium / Low priority, in that order, skipping empty groups — matching the classic view's own grouping. */
export function groupTasksForCommandCentre(tasks: Task[]): CCGroup[] {
  const groups: CCGroup[] = PRIORITY_ORDER.map((priority) => ({
    key: priority,
    label: `${PRIORITY_SHORT_LABELS[priority]} Priority`,
    ...PRIORITY_GROUP_STYLE[priority],
    tasks: tasks.filter((t) => t.priority === priority),
  }));

  return groups.filter((g) => g.tasks.length > 0);
}

/** Known sign-ins whose email local-part doesn't cleanly split into a readable name. */
const KNOWN_DISPLAY_NAMES: Record<string, string> = {
  'jamieharper07@gmail.com': 'Jamie Harper',
};

/** A human-presentable name from a sign-in email, since the app has no dedicated name field. */
export function deriveDisplayName(email: string | null | undefined): string | null {
  if (!email) return null;
  const known = KNOWN_DISPLAY_NAMES[email.toLowerCase()];
  if (known) return known;
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
