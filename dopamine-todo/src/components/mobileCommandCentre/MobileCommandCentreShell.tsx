import { useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import type { Branding, DopamineState, ListId, Priority, Repeat, Task } from '../../types';
import { dayKey } from '../../lib/gamify';
import { isOverdue } from '../../lib/commandCentre';
import { DEFAULT_ACCENT_HEX, accentTokens } from '../../lib/accent';
import { tomorrowOf } from '../../lib/mobileCommandCentre';
import { MobileTabBar } from './MobileTabBar';
import type { MobileTab } from './MobileTabBar';
import { MobileTodayScreen } from './MobileTodayScreen';
import { MobileTasksScreen } from './MobileTasksScreen';
import { MobileCalendarScreen } from './MobileCalendarScreen';
import { MobileProgressScreen } from './MobileProgressScreen';
import { MobileNewTaskSheet } from './MobileNewTaskSheet';
import { MobileTaskDetailSheet } from './MobileTaskDetailSheet';
import { MobileSettingsSheet } from './MobileSettingsSheet';
import type { Filter } from '../TaskList';

interface MobileCommandCentreShellProps {
  tasks: Task[];
  dopamine: DopamineState;
  levelInfo: { level: number; xpIntoLevel: number; xpForNextLevel: number };
  activeList: ListId;
  onActiveListChange: (list: ListId) => void;
  onAddTask: (text: string, priority: Priority, list: ListId, dueDate: string | null) => string | undefined;
  onEditTitle: (id: string, text: string) => void;
  onSetNotes: (id: string, notes: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onPriorityChange: (id: string, p: Priority) => void;
  onOwnerChange: (id: string, owner: string) => void;
  onDueDateChange: (id: string, date: string | null) => void;
  onRepeatChange: (id: string, r: Repeat) => void;
  onListChange: (id: string, list: ListId) => void;
  onReorder: (orderedIds: string[]) => void;
  onClearCompleted: () => void;
  taskView: 'list' | 'grid';
  onTaskViewChange: (v: 'list' | 'grid') => void;
  displayName: string | null;
  branding: Branding;
  onSaveName: (name: string) => void;
  onUploadIcon: (file: File) => Promise<void>;
  onResetIcon: () => void;
  onAccentColorChange: (color: string | null) => void;
  user: User | null;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
  onSignOut: () => void;
  syncing: boolean;
  syncError: boolean;
  soundOn: boolean;
  onToggleSound: () => void;
}

const TAB_TITLES: Record<MobileTab, string> = { today: 'Today', tasks: 'Tasks', calendar: 'Calendar', progress: 'Progress' };

export function MobileCommandCentreShell({
  tasks,
  dopamine,
  levelInfo,
  activeList,
  onActiveListChange,
  onAddTask,
  onEditTitle,
  onSetNotes,
  onToggle,
  onDelete,
  onPriorityChange,
  onOwnerChange,
  onDueDateChange,
  onRepeatChange,
  onListChange,
  onReorder,
  onClearCompleted,
  taskView,
  onTaskViewChange,
  displayName,
  branding,
  onSaveName,
  onUploadIcon,
  onResetIcon,
  onAccentColorChange,
  user,
  onSignIn,
  onSignUp,
  onSignOut,
  syncing,
  syncError,
  soundOn,
  onToggleSound,
}: MobileCommandCentreShellProps) {
  const today = dayKey();
  const [tab, setTab] = useState<MobileTab>('today');
  const [filter, setFilter] = useState<Filter>('active');
  const [compact, setCompact] = useState(false);
  const [calendarDay, setCalendarDay] = useState(today);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [newTaskDueDate, setNewTaskDueDate] = useState<string | null>(today);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  const accent = accentTokens(branding.accentColor ?? DEFAULT_ACCENT_HEX);
  const listTasks = tasks.filter((t) => t.list === activeList);
  const listCounts = (['personal', 'work'] as ListId[]).reduce(
    (acc, list) => ({ ...acc, [list]: tasks.filter((t) => t.list === list).length }),
    {} as Record<ListId, number>,
  );
  const overdueCount = listTasks.filter((t) => !t.done && isOverdue(t, today)).length;
  const openTask = tasks.find((t) => t.id === openTaskId) ?? null;

  const changeTab = (next: MobileTab) => {
    setTab(next);
    mainRef.current?.scrollTo({ top: 0 });
  };

  const handleScroll = () => {
    const top = mainRef.current?.scrollTop ?? 0;
    setCompact(top > 48);
  };

  const onSnooze = (id: string) => onDueDateChange(id, tomorrowOf(today));

  const openNewTask = (dueDate: string | null) => {
    setNewTaskDueDate(dueDate);
    setNewTaskOpen(true);
  };

  const avatarInitial = displayName ? displayName.charAt(0).toUpperCase() : 'J';

  return (
    <div className="command-centre relative min-h-[100dvh] font-cc" style={{ background: '#c9b9a4' }}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="cc-bg-blobs" />
      </div>

      {compact && (
        <div
          className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-4 pb-2.5"
          style={{
            paddingTop: 'max(10px, env(safe-area-inset-top))',
            background: 'rgba(201,185,164,.92)',
            backdropFilter: 'blur(18px) saturate(150%)',
            WebkitBackdropFilter: 'blur(18px) saturate(150%)',
            boxShadow: '0 1px 0 rgba(255,255,255,.4)',
          }}
        >
          <span className="text-[15px] font-bold tracking-tight text-cc-ink">{TAB_TITLES[tab]}</span>
          <button
            onClick={() => setSettingsOpen(true)}
            aria-label="Settings and account"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1d1a16] text-[12px] font-bold text-white transition active:scale-90"
          >
            {avatarInitial}
          </button>
        </div>
      )}

      <div ref={mainRef} onScroll={handleScroll} className="relative h-[100dvh] overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
        {tab === 'today' && (
          <MobileTodayScreen
            tasks={listTasks}
            dopamine={dopamine}
            levelInfo={levelInfo}
            today={today}
            displayName={displayName}
            user={user}
            syncing={syncing}
            syncError={syncError}
            accent={accent}
            onToggle={onToggle}
            onSnooze={onSnooze}
            onOpenTask={setOpenTaskId}
            onOpenSettings={() => setSettingsOpen(true)}
            onOpenProgress={() => changeTab('progress')}
            onSeeAll={() => {
              setFilter('active');
              changeTab('tasks');
            }}
          />
        )}
        {tab === 'tasks' && (
          <MobileTasksScreen
            listTasks={listTasks}
            listCounts={listCounts}
            today={today}
            activeList={activeList}
            onActiveListChange={onActiveListChange}
            filter={filter}
            onFilterChange={setFilter}
            taskView={taskView}
            onTaskViewChange={onTaskViewChange}
            accent={accent}
            onToggle={onToggle}
            onSnooze={onSnooze}
            onOpen={setOpenTaskId}
            onReorder={onReorder}
            onClearCompleted={onClearCompleted}
          />
        )}
        {tab === 'calendar' && (
          <MobileCalendarScreen
            listTasks={listTasks}
            today={today}
            selectedDay={calendarDay}
            onSelectDay={setCalendarDay}
            accent={accent}
            onToggle={onToggle}
            onOpen={setOpenTaskId}
            onAddForDay={openNewTask}
          />
        )}
        {tab === 'progress' && <MobileProgressScreen tasks={listTasks} dopamine={dopamine} levelInfo={levelInfo} today={today} accent={accent} />}
      </div>

      <MobileTabBar tab={tab} onTabChange={changeTab} overdueCount={overdueCount} accent={accent} onAddTask={() => openNewTask(tab === 'calendar' ? calendarDay : today)} />

      <MobileNewTaskSheet
        open={newTaskOpen}
        onClose={() => setNewTaskOpen(false)}
        today={today}
        defaultList={activeList}
        defaultDueDate={newTaskDueDate}
        onAdd={onAddTask}
        onSetNotes={onSetNotes}
      />

      {openTask && (
        <MobileTaskDetailSheet
          task={openTask}
          today={today}
          onClose={() => setOpenTaskId(null)}
          onEditTitle={onEditTitle}
          onEditNotes={onSetNotes}
          onPriorityChange={onPriorityChange}
          onOwnerChange={onOwnerChange}
          onDueDateChange={onDueDateChange}
          onRepeatChange={onRepeatChange}
          onListChange={onListChange}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      )}

      <MobileSettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        branding={branding}
        onSaveName={onSaveName}
        onUploadIcon={onUploadIcon}
        onResetIcon={onResetIcon}
        onAccentColorChange={onAccentColorChange}
        user={user}
        onSignIn={onSignIn}
        onSignUp={onSignUp}
        onSignOut={onSignOut}
        syncing={syncing}
        syncError={syncError}
        soundOn={soundOn}
        onToggleSound={onToggleSound}
      />
    </div>
  );
}
