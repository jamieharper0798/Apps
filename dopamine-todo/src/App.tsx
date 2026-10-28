import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTodos } from './hooks/useTodos';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { ListId } from './types';
import { LIST_ORDER, LIST_META } from './lib/lists';
import { AddTaskForm } from './components/AddTaskForm';
import { TaskList } from './components/TaskList';
import type { Filter } from './components/TaskList';
import { ListToggle } from './components/ListToggle';
import { XPBar } from './components/XPBar';
import { StreakBadge } from './components/StreakBadge';
import { ProgressRing } from './components/ProgressRing';
import { CelebrationToast } from './components/CelebrationToast';
import type { ToastData } from './components/CelebrationToast';
import { LevelUpOverlay } from './components/LevelUpOverlay';
import { InstallButton } from './components/InstallButton';
import { UpdateToast } from './components/UpdateToast';
import { UndoToast } from './components/UndoToast';
import type { UndoData } from './components/UndoToast';
import { BrandingEditor } from './components/BrandingEditor';
import { AccountButton } from './components/AccountButton';
import { AuthModal } from './components/AuthModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { useBranding } from './hooks/useBranding';
import { useBrandingMeta } from './hooks/useBrandingMeta';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { isFirebaseConfigured } from './lib/firebase';
import { DEFAULT_ICON_192 } from './lib/icons';
import { burstConfetti, burstLevelUp } from './lib/celebrate';
import { playComplete, playDelete, playLevelUp } from './lib/sound';
import { randomHype, dayKey } from './lib/gamify';
import { deriveDisplayName } from './lib/commandCentre';
import { CommandCentreView } from './components/commandCentre/CommandCentreView';
import { CommandCentreTaskModal } from './components/commandCentre/CommandCentreTaskModal';
import { CommandCentreLevelUpOverlay } from './components/commandCentre/CommandCentreLevelUpOverlay';

function App() {
  const {
    tasks,
    dopamine,
    levelInfo,
    syncing,
    syncError,
    addTask,
    deleteTask,
    restoreTask,
    editTask,
    toggleTask,
    setPriority,
    setOwner,
    setDueDate,
    setNotes,
    setRepeat,
    reorderTasks,
    clearCompleted,
  } = useTodos();
  const { branding, setName, setIconFromFile, resetIcon, setAccentColor } = useBranding();
  useBrandingMeta(branding);
  const { user, signIn, signUp, signOutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [viewMode, setViewMode] = useLocalStorage<'classic' | 'command-centre'>('dopamine-todo:viewMode', 'classic');
  const [ccTaskView, setCcTaskView] = useLocalStorage<'list' | 'grid'>('dopamine-todo:ccTaskView', 'list');
  const [activeList, setActiveList] = useLocalStorage<ListId>('dopamine-todo:activeList', 'personal');
  const [filter, setFilter] = useState<Filter>('all');
  const [toast, setToast] = useState<ToastData | null>(null);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const [muted, setMuted] = useState(false);
  const [editingBrand, setEditingBrand] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [undo, setUndo] = useState<(UndoData & { task: (typeof tasks)[number]; index: number }) | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    if (undoTimer.current) clearTimeout(undoTimer.current);
  }, []);

  const listCounts = LIST_ORDER.reduce(
    (acc, list) => ({ ...acc, [list]: tasks.filter((t) => t.list === list).length }),
    {} as Record<ListId, number>,
  );

  const openTask = tasks.find((t) => t.id === openTaskId) ?? null;

  const listTasks = tasks.filter((t) => t.list === activeList);
  const total = listTasks.length;
  const completed = listTasks.filter((t) => t.done).length;
  const progress = total === 0 ? 0 : completed / total;
  const activeCount = total - completed;
  const today = dayKey();
  const overdueCount = listTasks.filter((t) => !t.done && t.dueDate && t.dueDate < today).length;

  const handleToggle = (id: string) => {
    const result = toggleTask(id);
    if (!result) return;

    if (!muted) {
      if (result.leveledUp) playLevelUp();
      else playComplete();
    }
    burstConfetti(0.5, 0.4);

    setToast({ id: Date.now(), message: randomHype(), xp: result.xpGained });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);

    if (result.leveledUp) {
      setTimeout(() => {
        setLevelUp(result.newLevel);
        burstLevelUp();
      }, 250);
    }
  };

  const handleDelete = (id: string) => {
    const index = tasks.findIndex((t) => t.id === id);
    const task = tasks[index];
    if (!task) return;

    if (!muted) playDelete();
    deleteTask(id);

    const label = task.text.length > 40 ? `${task.text.slice(0, 40)}…` : task.text;
    setUndo({ id: Date.now(), message: `Deleted "${label}"`, task, index });
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndo(null), 6000);
  };

  const handleUndo = () => {
    if (!undo) return;
    restoreTask(undo.task, undo.index);
    setUndo(null);
    if (undoTimer.current) clearTimeout(undoTimer.current);
  };

  const FILTERS: { value: Filter; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: total },
    { value: 'active', label: 'Active', count: activeCount },
    { value: 'done', label: 'Done', count: completed },
    ...(overdueCount > 0 ? [{ value: 'overdue' as Filter, label: 'Overdue', count: overdueCount }] : []),
  ];

  return (
    <div className="min-h-screen bg-[var(--surface)]">
      <CelebrationToast toast={toast} />
      {viewMode === 'command-centre' ? (
        <CommandCentreLevelUpOverlay level={levelUp} onClose={() => setLevelUp(null)} />
      ) : (
        <LevelUpOverlay level={levelUp} onClose={() => setLevelUp(null)} />
      )}
      <UpdateToast />
      <UndoToast undo={undo} onUndo={handleUndo} />
      <BrandingEditor
        open={editingBrand}
        branding={branding}
        onClose={() => setEditingBrand(false)}
        onSaveName={setName}
        onUploadIcon={setIconFromFile}
        onResetIcon={resetIcon}
        onAccentColorChange={setAccentColor}
      />
      {isFirebaseConfigured && (
        <AuthModal
          open={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSignIn={signIn}
          onSignUp={signUp}
        />
      )}
      {viewMode === 'command-centre' ? (
        <CommandCentreTaskModal
          task={openTask}
          onClose={() => setOpenTaskId(null)}
          onEditTitle={editTask}
          onEditNotes={setNotes}
          onRepeatChange={setRepeat}
          onPriorityChange={setPriority}
          onOwnerChange={setOwner}
          onDueDateChange={setDueDate}
          onDelete={handleDelete}
        />
      ) : (
        <TaskDetailModal
          task={openTask}
          onClose={() => setOpenTaskId(null)}
          onEditTitle={editTask}
          onEditNotes={setNotes}
          onRepeatChange={setRepeat}
          onPriorityChange={setPriority}
          onOwnerChange={setOwner}
          onDueDateChange={setDueDate}
          onDelete={handleDelete}
        />
      )}

      {viewMode === 'command-centre' ? (
        <CommandCentreView
          tasks={tasks}
          dopamine={dopamine}
          levelInfo={levelInfo}
          activeList={activeList}
          onActiveListChange={setActiveList}
          filter={filter}
          onFilterChange={setFilter}
          onAddTask={addTask}
          onSetNotes={setNotes}
          onToggle={handleToggle}
          onOpenTask={setOpenTaskId}
          onOpenSettings={() => setEditingBrand(true)}
          onSwitchToClassic={() => setViewMode('classic')}
          displayName={deriveDisplayName(user?.email)}
          taskView={ccTaskView}
          onTaskViewChange={setCcTaskView}
        />
      ) : (
      <>
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-[var(--surface)]/75 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between py-5 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))]">
          <button
            onClick={() => setEditingBrand(true)}
            className="group flex min-w-0 items-center gap-3 rounded-lg py-1 pr-2 transition active:scale-[0.98] hover:bg-ink/5"
            title="Customize name and icon"
          >
            <img
              src={branding.icon192 ?? DEFAULT_ICON_192}
              alt=""
              className="h-9 w-9 shrink-0 rounded-xl border-2 border-accent/60 object-cover shadow-[0_0_16px_-6px_color-mix(in_srgb,var(--accent)_60%,transparent)]"
            />
            <h1 className="truncate text-[clamp(1.05rem,3vw,1.25rem)] font-bold tracking-tight text-ink">{branding.name}</h1>
            <svg
              viewBox="0 0 24 24"
              className="hidden h-3.5 w-3.5 shrink-0 text-ink/0 transition group-hover:text-ink/40 sm:block"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5m-1.5-9.5a2.121 2.121 0 0 1 3 3L12 16l-4 1 1-4 9.5-9.5Z"
              />
            </svg>
          </button>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {isFirebaseConfigured && (
              <AccountButton
                user={user}
                syncing={syncing}
                syncError={syncError}
                onSignInClick={() => setAuthModalOpen(true)}
                onSignOut={signOutUser}
              />
            )}
            <InstallButton appName={branding.name} />
            <button
              onClick={() => setViewMode('command-centre')}
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-accent/60 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-accent transition active:scale-95 hover:bg-accent/10 hover:shadow-[0_0_16px_-6px_var(--accent)]"
              aria-label="Switch to Command Centre view"
              title="Command Centre view"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="3" width="7" height="9" rx="1.5" />
                <rect x="14" y="3" width="7" height="5" rx="1.5" />
                <rect x="14" y="12" width="7" height="9" rx="1.5" />
                <rect x="3" y="16" width="7" height="5" rx="1.5" />
              </svg>
              <span className="hidden sm:inline">Command Centre</span>
            </button>
            <button
              onClick={toggleTheme}
              className="shrink-0 rounded-lg border border-ink/15 p-2 text-ink/50 transition active:scale-90 hover:border-ink/30 hover:text-ink"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => setMuted((m) => !m)}
              className="shrink-0 rounded-lg border border-ink/15 p-2 text-ink/50 transition active:scale-90 hover:border-ink/30 hover:text-ink"
              aria-label={muted ? 'Unmute sound' : 'Mute sound'}
              title={muted ? 'Unmute' : 'Mute'}
            >
              {muted ? '🔇' : '🔊'}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 pb-[max(4rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-6 sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))] lg:grid-cols-[1fr_300px]">
        <main className="flex min-w-0 flex-col gap-5">
          <ListToggle active={activeList} counts={listCounts} onChange={setActiveList} />

          <AddTaskForm
            onAdd={(text, priority) => addTask(text, priority, activeList)}
            listLabel={LIST_META[activeList].label}
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              {FILTERS.map((f) => {
                const isOverdue = f.value === 'overdue';
                const isActive = filter === f.value;
                return (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className={`relative flex items-center gap-1 pb-1.5 text-xs font-semibold uppercase tracking-wide transition active:scale-95 ${
                      isActive
                        ? isOverdue
                          ? 'text-danger'
                          : 'text-ink'
                        : isOverdue
                          ? 'text-danger/70 hover:text-danger'
                          : 'text-ink/35 hover:text-ink/60'
                    }`}
                  >
                    {isOverdue && <span aria-hidden>⚠</span>}
                    {f.label} <span className={`font-mono tabular-nums ${isOverdue ? 'text-danger/70' : 'text-ink/25'}`}>· {f.count}</span>
                    {isActive && (
                      <motion.div
                        layoutId="filter-tab-underline"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        className={`absolute inset-x-0 -bottom-px h-0.5 rounded-full ${
                          isOverdue ? 'bg-danger' : 'bg-accent shadow-[0_0_10px_-1px_var(--accent)]'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-3 text-xs text-ink/40">
              <span className="font-mono tabular-nums">{activeCount} left</span>
              {completed > 0 && (
                <button
                  onClick={() => clearCompleted(activeList)}
                  className="font-medium uppercase tracking-wide text-ink/40 transition active:scale-95 hover:text-danger"
                >
                  Clear done
                </button>
              )}
            </div>
          </div>

          <TaskList
            tasks={listTasks}
            filter={filter}
            listLabel={LIST_META[activeList].label}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEdit={editTask}
            onOwnerChange={setOwner}
            onDueDateChange={setDueDate}
            onPriorityChange={setPriority}
            onReorder={reorderTasks}
            onOpen={setOpenTaskId}
          />
        </main>

        <aside className="flex flex-col gap-4 lg:pt-[52px]">
          <div className="panel panel-hover rounded-xl p-4">
            <XPBar level={levelInfo.level} xpIntoLevel={levelInfo.xpIntoLevel} xpForNextLevel={levelInfo.xpForNextLevel} />
          </div>
          <div className="panel panel-hover flex items-center justify-between gap-3 rounded-xl p-4">
            <StreakBadge streak={dopamine.streak} />
            <ProgressRing progress={progress} />
          </div>
          <div className="panel panel-hover rounded-xl p-4 text-center">
            <p className="text-[10px] uppercase tracking-widest text-ink/30">All-time cleared</p>
            <p className="mt-1 font-mono text-3xl font-bold tabular-nums text-accent">{dopamine.totalCompleted}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wide text-ink/25">
              {dopamine.totalCompleted > 0 ? 'keep the streak alive' : 'complete your first task'}
            </p>
          </div>
        </aside>
      </div>
      </>
      )}
    </div>
  );
}

export default App;
