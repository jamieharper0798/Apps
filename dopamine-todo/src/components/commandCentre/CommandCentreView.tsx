import { useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import type { DopamineState, ListId, Priority, Task } from '../../types';
import type { Filter } from '../TaskList';
import { LIST_ORDER } from '../../lib/lists';
import { PRIORITY_ORDER, PRIORITY_CODE } from '../../lib/priority';
import { dayKey } from '../../lib/gamify';
import { greetingForHour } from '../../lib/commandCentre';
import { TaskPanel } from './TaskPanel';
import { FocusCard } from './FocusCard';

interface CommandCentreViewProps {
  tasks: Task[];
  dopamine: DopamineState;
  levelInfo: { level: number; xpIntoLevel: number; xpForNextLevel: number };
  activeList: ListId;
  onActiveListChange: (list: ListId) => void;
  filter: Filter;
  onFilterChange: (f: Filter) => void;
  onAddTask: (text: string, priority: Priority, list: ListId) => string | undefined;
  onSetNotes: (id: string, notes: string) => void;
  onToggle: (id: string) => void;
  onClearCompleted: () => void;
  onOpenTask: (id: string) => void;
  onOpenSettings: () => void;
  onSwitchToClassic: () => void;
  displayName: string | null;
  taskView: 'list' | 'grid';
  onTaskViewChange: (view: 'list' | 'grid') => void;
}

function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

const RAIL_ICONS: { label: string; path: ReactNode }[] = [
  { label: 'Overview', path: <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" fill="currentColor" stroke="none" /> },
  {
    label: 'Tasks',
    path: (
      <>
        <path d="m9 11 3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </>
    ),
  },
  {
    label: 'Calendar',
    path: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </>
    ),
  },
  { label: 'Streak', path: <path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z" /> },
  { label: 'Stats', path: <path d="M18 20V10M12 20V4M6 20v-6" /> },
  {
    label: 'Settings',
    path: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </>
    ),
  },
];

export function CommandCentreView({
  tasks,
  dopamine,
  levelInfo,
  activeList,
  onActiveListChange,
  filter,
  onFilterChange,
  onAddTask,
  onSetNotes,
  onToggle,
  onClearCompleted,
  onOpenTask,
  onOpenSettings,
  onSwitchToClassic,
  displayName,
  taskView,
  onTaskViewChange,
}: CommandCentreViewProps) {
  const [quickDraft, setQuickDraft] = useState('');
  const [quickPriority, setQuickPriority] = useState<Priority>('medium');
  const quickInputRef = useRef<HTMLInputElement>(null);

  const today = dayKey();
  const now = new Date();
  const listTasks = tasks.filter((t) => t.list === activeList);
  const activeCount = listTasks.filter((t) => !t.done).length;
  const overdueCount = listTasks.filter((t) => !t.done && t.dueDate && t.dueDate < today).length;
  const completedToday = listTasks.filter((t) => t.completedAt && dayKey(new Date(t.completedAt)) === today).length;
  // The All-time-cleared tile pairs with dopamine.totalCompleted, which is global (not per-list),
  // so its "+today" badge is computed globally too, unlike the per-list Today tile above it.
  const completedTodayGlobal = tasks.filter((t) => t.completedAt && dayKey(new Date(t.completedAt)) === today).length;
  const todayTotal = activeCount + completedToday;
  const dayPct = todayTotal ? (completedToday / todayTotal) * 100 : 0;
  const xpPct = levelInfo.xpForNextLevel ? (levelInfo.xpIntoLevel / levelInfo.xpForNextLevel) * 100 : 0;
  const streakSafe = dopamine.lastCompletedDay === today;

  const listCounts = LIST_ORDER.reduce(
    (acc, list) => ({ ...acc, [list]: tasks.filter((t) => t.list === list && !t.done).length }),
    {} as Record<ListId, number>,
  );

  const handleAdd = (raw: string, priority: Priority = 'medium') => {
    const [subjectPart, ...rest] = raw.split('|');
    const subject = subjectPart.trim();
    if (!subject) return;
    const action = rest.join('|').trim();
    const id = onAddTask(subject, priority, activeList);
    if (id && action) onSetNotes(id, action);
    onFilterChange('active');
  };

  const handleQuickKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAdd(quickDraft, quickPriority);
      setQuickDraft('');
    }
  };

  const avatarInitial = displayName ? displayName.charAt(0).toUpperCase() : '•';
  const greetName = displayName ? `, ${displayName}` : '';

  return (
    <div className="command-centre relative min-h-screen font-cc" style={{ background: '#b6a38c' }}>
      {/* overflow-hidden is scoped to this wrapper, not the page root — sitting it on the root
          broke position:sticky for the side rail and Focus Now card below, since any ancestor
          with overflow other than visible becomes the scroll container sticky positions against,
          and this div never itself scrolls (the page does), so sticky silently stopped tracking
          scroll as soon as content grew past one screen. */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="cc-bg-blobs" />
      </div>

      <div className="relative mx-auto flex max-w-[1320px] flex-col gap-4.5 px-5 pb-8 pt-5 sm:px-7">
        {/* Top bar */}
        <div className="cc-glass-bar flex flex-wrap items-center gap-3 rounded-[28px] p-2 sm:flex-nowrap sm:gap-4 sm:rounded-full">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1d1a16] text-[15px] font-bold text-white">
              {avatarInitial}
            </div>
            <span className="truncate text-[15px] font-semibold text-white">Welcome{greetName}</span>
          </div>
          <div className="order-3 flex w-full basis-full items-center gap-3 rounded-full border border-[rgba(255,255,255,0.3)] bg-[rgba(255,255,255,0.18)] py-1.5 pl-1.5 pr-2 sm:order-none sm:w-auto sm:flex-1 sm:basis-[460px]">
            <div
              className="h-7 w-7 shrink-0 rounded-full"
              style={{
                background: 'radial-gradient(circle at 35% 30%, #fff 0%, oklch(0.8 0.1 172) 35%, oklch(0.5 0.1 200) 100%)',
                boxShadow: '0 0 14px oklch(0.8 0.1 172 / 0.7)',
              }}
            />
            <input
              ref={quickInputRef}
              value={quickDraft}
              onChange={(e) => setQuickDraft(e.target.value)}
              onKeyDown={handleQuickKeyDown}
              placeholder="Add a task"
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-white placeholder-white/60 outline-none"
            />
            <div className="flex shrink-0 gap-0.5 rounded-full bg-white/10 p-0.5">
              {PRIORITY_ORDER.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setQuickPriority(p)}
                  className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition active:scale-90 ${
                    quickPriority === p ? 'bg-white text-[#1d1a16]' : 'text-white/70'
                  }`}
                >
                  {PRIORITY_CODE[p]}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                handleAdd(quickDraft, quickPriority);
                setQuickDraft('');
              }}
              className="shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition active:scale-95"
              style={{
                background: quickDraft.trim() ? '#fff' : 'rgba(255,255,255,0.2)',
                color: quickDraft.trim() ? '#1d1a16' : 'rgba(255,255,255,0.8)',
              }}
            >
              Add Task
            </button>
          </div>
          <div className="flex flex-1 items-center justify-end gap-2">
            <div className="flex shrink-0 gap-0.5 rounded-full bg-white/15 p-1">
              <button
                onClick={() => onTaskViewChange('list')}
                aria-label="List view"
                aria-pressed={taskView === 'list'}
                title="List view"
                className={`flex h-8 w-8 items-center justify-center rounded-full transition active:scale-90 ${
                  taskView === 'list' ? 'bg-white text-[#1d1a16]' : 'text-white/70'
                }`}
              >
                <ListIcon />
              </button>
              <button
                onClick={() => onTaskViewChange('grid')}
                aria-label="Grid view"
                aria-pressed={taskView === 'grid'}
                title="Grid view"
                className={`flex h-8 w-8 items-center justify-center rounded-full transition active:scale-90 ${
                  taskView === 'grid' ? 'bg-white text-[#1d1a16]' : 'text-white/70'
                }`}
              >
                <GridIcon />
              </button>
            </div>
            <button
              onClick={onSwitchToClassic}
              aria-label="Switch to classic view"
              title="Classic view"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#1d1a16] transition active:scale-90"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              aria-label="Notifications"
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#1d1a16" strokeWidth={2} strokeLinecap="round">
                <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              <span className="absolute right-[9px] top-2 h-2 w-2 rounded-full border-2 border-white bg-[#e0533d]" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-[56px_minmax(0,1fr)] items-start gap-4">
          {/* Side rail */}
          <div className="cc-glass-bar sticky top-5 mt-10 flex flex-col items-center gap-2.5 rounded-full py-2.5">
            {RAIL_ICONS.map((icon, i) => {
              const isHome = i === 0;
              const isSettings = icon.label === 'Settings';
              return (
                <button
                  key={icon.label}
                  aria-label={icon.label}
                  title={icon.label}
                  onClick={isSettings ? onOpenSettings : undefined}
                  className={`flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full transition active:scale-90 ${
                    isHome ? 'bg-white shadow-[0_4px_12px_rgba(0,0,0,0.12)]' : 'hover:bg-[rgba(255,255,255,0.3)]'
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="17"
                    height="17"
                    fill="none"
                    stroke={isHome ? '#1d1a16' : '#fff'}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {icon.path}
                  </svg>
                </button>
              );
            })}
          </div>

          {/* Main panel */}
          <div className="cc-glass-panel flex min-w-0 flex-col gap-5.5 rounded-[32px] px-8 pb-8 pt-9">
            <div className="flex flex-col gap-1.5">
              <span className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-[1.1] tracking-tight text-cc-ink">
                {greetingForHour(now.getHours())}
                {greetName}
              </span>
              <span className="text-[15px] text-cc-ink-2">
                {activeCount} task{activeCount === 1 ? '' : 's'} left.{' '}
                {overdueCount > 0 ? 'Start with the overdue one.' : 'Nothing overdue.'}
              </span>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,150px),1fr))] gap-2.5 rounded-[22px] border border-[rgba(255,255,255,0.45)] bg-[rgba(255,255,255,0.22)] p-2.5">
              <div className="flex flex-col gap-2.5 rounded-2xl border border-[rgba(255,255,255,0.6)] bg-[rgba(255,255,255,0.55)] p-3.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-[13px] font-medium text-cc-ink-2">Today</span>
                  <span className="text-xl font-bold tracking-tight text-cc-ink">
                    {completedToday}
                    <span className="text-sm font-normal text-cc-ink-4"> / {todayTotal}</span>
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(255,255,255,0.8)]">
                  <div
                    className="h-1.5 rounded-full bg-[#1d1a16]"
                    style={{ width: `${dayPct}%`, transition: 'width 0.5s cubic-bezier(0.2,0.9,0.25,1)' }}
                  />
                </div>
              </div>
              <div
                className="flex flex-col gap-2.5 rounded-2xl p-3.5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                style={{ background: 'linear-gradient(160deg, oklch(0.7 0.1 172), oklch(0.53 0.09 176))' }}
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-[13px] font-medium">Level {levelInfo.level}</span>
                  <span className="text-xs font-semibold">{levelInfo.xpForNextLevel - levelInfo.xpIntoLevel} XP to go</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/30">
                  <div
                    className="h-1.5 rounded-full bg-white"
                    style={{ width: `${xpPct}%`, transition: 'width 0.6s cubic-bezier(0.2,0.9,0.25,1)' }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-[rgba(255,255,255,0.6)] bg-[rgba(255,255,255,0.55)] p-3.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-medium text-cc-ink-2">Streak</span>
                  <span className="text-xl font-bold tracking-tight text-cc-ink">
                    {dopamine.streak} day{dopamine.streak === 1 ? '' : 's'}
                  </span>
                </div>
                <span
                  className="rounded-md px-2.5 py-1 text-[11px] font-bold"
                  style={{
                    background: streakSafe ? 'var(--cc-green-bg)' : 'var(--cc-red-bg)',
                    color: streakSafe ? 'var(--cc-green-text)' : 'var(--cc-red-text)',
                  }}
                >
                  {streakSafe ? 'Safe' : 'At risk'}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-[rgba(255,255,255,0.6)] bg-[rgba(255,255,255,0.55)] p-3.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-medium text-cc-ink-2">All-time cleared</span>
                  <span className="text-xl font-bold tracking-tight text-cc-ink">{dopamine.totalCompleted}</span>
                </div>
                <span className="rounded-md bg-cc-green-bg px-2.5 py-1 text-[11px] font-bold text-cc-green">
                  +{completedTodayGlobal} today
                </span>
              </div>
            </div>

            {/* Task panel + Focus column */}
            {/* items-stretch (the default) so the focus column's wrapper grows to match the task
                panel's height — that's what gives its sticky inner card room to travel as you
                scroll past a long list. The task panel opts back out with self-start below so it
                never gets stretched taller than its own content on the rare occasion it's the
                shorter of the two. */}
            <div className="flex flex-wrap-reverse gap-4">
              <TaskPanel
                activeList={activeList}
                onActiveListChange={onActiveListChange}
                listCounts={listCounts}
                filter={filter}
                onFilterChange={onFilterChange}
                tasks={listTasks}
                today={today}
                onToggle={onToggle}
                onClearCompleted={onClearCompleted}
                onAdd={handleAdd}
                onOpenTask={onOpenTask}
                taskView={taskView}
              />
              <div className="w-full basis-[260px] sm:w-auto sm:flex-1">
                <FocusCard tasks={listTasks} today={today} onToggle={onToggle} onOpenTask={onOpenTask} />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
