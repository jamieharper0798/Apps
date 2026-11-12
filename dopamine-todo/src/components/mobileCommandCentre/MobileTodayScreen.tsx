import type { DopamineState, Task } from '../../types';
import type { User } from 'firebase/auth';
import { XP_BY_PRIORITY } from '../../lib/gamify';
import { formatCCDue, isOverdue, pickFocusTasks, greetingForHour } from '../../lib/commandCentre';
import { PRIORITY_SHORT_LABELS } from '../../lib/priority';
import { LIST_META } from '../../lib/lists';
import { pickUpNext, MOBILE_DAILY_GOAL } from '../../lib/mobileCommandCentre';
import type { AccentTokens } from '../../lib/accent';

interface MobileTodayScreenProps {
  tasks: Task[];
  dopamine: DopamineState;
  levelInfo: { level: number; xpIntoLevel: number; xpForNextLevel: number };
  today: string;
  displayName: string | null;
  user: User | null;
  syncing: boolean;
  syncError: boolean;
  accent: AccentTokens;
  onToggle: (id: string) => void;
  onSnooze: (id: string) => void;
  onOpenTask: (id: string) => void;
  onOpenSettings: () => void;
  onOpenProgress: () => void;
  onSeeAll: () => void;
}

function focusTag(task: Task, today: string): string {
  if (isOverdue(task, today)) return 'Overdue';
  if (!task.dueDate) return 'No due date';
  const due = formatCCDue(task.dueDate, today);
  if (due === 'Today' || due === 'Tomorrow') return `Due ${due.toLowerCase()}`;
  return `Due ${due}`;
}

export function MobileTodayScreen({
  tasks,
  dopamine,
  levelInfo,
  today,
  displayName,
  user,
  syncing,
  syncError,
  accent,
  onToggle,
  onSnooze,
  onOpenTask,
  onOpenSettings,
  onOpenProgress,
  onSeeAll,
}: MobileTodayScreenProps) {
  const now = new Date();
  const { focus } = pickFocusTasks(tasks);
  const upNext = pickUpNext(tasks, focus?.id ?? null);
  const activeCount = tasks.filter((t) => !t.done).length;
  const overdueCount = tasks.filter((t) => isOverdue(t, today)).length;
  const completedToday = dopamine.lastCompletedDay === today ? dopamine.completedToday : 0;
  const goalPct = Math.min(100, (completedToday / MOBILE_DAILY_GOAL) * 100);
  const xpPct = levelInfo.xpForNextLevel ? (levelInfo.xpIntoLevel / levelInfo.xpForNextLevel) * 100 : 0;
  const streakSafe = dopamine.lastCompletedDay === today;
  const avatarInitial = displayName ? displayName.charAt(0).toUpperCase() : 'J';
  const syncLabel = !user ? 'On this phone' : syncError ? 'Sync error' : syncing ? 'Syncing…' : 'Synced';

  return (
    <div className="flex flex-col gap-5 px-4 pb-32 pt-[max(1.1rem,calc(env(safe-area-inset-top)+0.6rem))]">
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-semibold text-cc-ink-3">
            {now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 rounded-full border border-white/50 bg-white/40 px-2.5 py-1.5 text-[11px] font-semibold text-cc-ink transition active:scale-95"
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: syncError ? 'var(--cc-red-dot)' : syncing ? '#c9a227' : 'var(--cc-green-dot)' }}
              />
              {syncLabel}
            </button>
            <button
              aria-label="Notifications"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-cc-ink transition active:scale-90"
            >
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
            </button>
            <button
              onClick={onOpenSettings}
              aria-label="Settings and account"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1d1a16] text-[14px] font-bold text-white transition active:scale-90"
            >
              {avatarInitial}
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[28px] font-bold leading-tight tracking-tight text-cc-ink">
            {greetingForHour(now.getHours())}
            {displayName ? `, ${displayName}` : ''}
          </span>
          <span className="text-[14px] text-cc-ink-2">
            {activeCount} task{activeCount === 1 ? '' : 's'} left. {overdueCount > 0 ? 'Start with the overdue one.' : 'Nothing overdue.'}
          </span>
        </div>
      </header>

      <button
        onClick={onOpenProgress}
        className="cc-glass-card flex flex-col gap-4 rounded-[26px] p-5 text-left transition active:scale-[0.98]"
      >
        <div className="flex items-center gap-4">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(${accent.solid} ${goalPct}%, rgba(29,26,22,.1) ${goalPct}%)` }}>
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#faf7f2] text-sm font-bold text-cc-ink">
              {completedToday}/{MOBILE_DAILY_GOAL}
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-[15px] font-bold text-cc-ink">Level {levelInfo.level}</span>
            <div className="h-1.5 overflow-hidden rounded-full bg-cc-ink/10">
              <div className="h-1.5 rounded-full" style={{ width: `${xpPct}%`, background: accent.gradient, transition: 'width .5s cubic-bezier(.2,.9,.25,1)' }} />
            </div>
            <span className="text-[11px] text-cc-ink-4">{levelInfo.xpForNextLevel - levelInfo.xpIntoLevel} XP to next level</span>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-white/50 px-3.5 py-2.5">
          <span className="text-[13px] font-semibold text-cc-ink">🔥 {dopamine.streak} day{dopamine.streak === 1 ? '' : 's'} streak</span>
          <span
            className="rounded-md px-2 py-1 text-[11px] font-bold"
            style={{ background: streakSafe ? 'var(--cc-green-bg)' : 'var(--cc-red-bg)', color: streakSafe ? 'var(--cc-green-text)' : 'var(--cc-red-text)' }}
          >
            {streakSafe ? 'Safe' : 'At risk'}
          </span>
        </div>
      </button>

      <div className="flex flex-col gap-3">
        <span className="pl-1 text-[13px] font-bold text-cc-ink">Focus now</span>
        {focus ? (
          <div className="flex flex-col gap-4 rounded-[24px] bg-[#1d1a16] p-5 text-white shadow-[0_18px_40px_rgba(30,20,10,.3)]">
            <div className="flex items-center justify-between">
              <span
                className="rounded-full px-2.5 py-1 text-[11px] font-bold text-cc-ink"
                style={{ background: isOverdue(focus, today) ? '#f6b7a9' : '#fff' }}
              >
                {focusTag(focus, today)}
              </span>
              <span className="text-xs opacity-60">
                {PRIORITY_SHORT_LABELS[focus.priority]} priority · {LIST_META[focus.list].label}
              </span>
            </div>
            <button onClick={() => onOpenTask(focus.id)} className="flex flex-col gap-1 text-left transition active:scale-[0.98]">
              <span className="text-[21px] font-bold leading-tight tracking-tight">{focus.text}</span>
              {focus.notes && <span className="text-sm opacity-75">{focus.notes}</span>}
            </button>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <button
                onClick={() => onToggle(focus.id)}
                className="rounded-[14px] border-none p-3.5 text-[14px] font-bold text-white transition active:scale-[0.97]"
                style={{ background: accent.gradient }}
              >
                Mark done · +{XP_BY_PRIORITY[focus.priority]} XP
              </button>
              <button
                onClick={() => onSnooze(focus.id)}
                className="rounded-[14px] bg-white/15 px-4 text-[13px] font-semibold text-white transition active:scale-[0.97]"
              >
                Snooze
              </button>
            </div>
          </div>
        ) : (
          <div className="cc-glass-card flex flex-col items-center gap-1 rounded-[24px] p-6 text-center">
            <span className="text-2xl">✨</span>
            <span className="text-sm font-semibold text-cc-ink">All clear</span>
            <span className="text-xs text-cc-ink-3">Nothing pending right now.</span>
          </div>
        )}
      </div>

      {upNext.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[13px] font-bold text-cc-ink">Up next</span>
            {activeCount > upNext.length + (focus ? 1 : 0) && (
              <button onClick={onSeeAll} className="text-[12px] font-semibold text-cc-ink-3 transition active:scale-95">
                See all {activeCount}
              </button>
            )}
          </div>
          {upNext.map((task) => (
            <button
              key={task.id}
              onClick={() => onOpenTask(task.id)}
              className="cc-glass-card flex items-center justify-between gap-2.5 rounded-2xl px-3.5 py-3 text-left transition active:scale-[0.98]"
            >
              <span className="truncate text-sm font-semibold text-cc-ink">{task.text}</span>
              <span className="shrink-0 whitespace-nowrap text-xs text-cc-ink-3">{formatCCDue(task.dueDate, today)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
