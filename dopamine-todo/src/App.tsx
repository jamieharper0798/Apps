import { useEffect, useRef, useState } from 'react';
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
import { BrandingEditor } from './components/BrandingEditor';
import { AccountButton } from './components/AccountButton';
import { AuthModal } from './components/AuthModal';
import { useBranding } from './hooks/useBranding';
import { useBrandingMeta } from './hooks/useBrandingMeta';
import { useAuth } from './hooks/useAuth';
import { isFirebaseConfigured } from './lib/firebase';
import { DEFAULT_ICON_192 } from './lib/icons';
import { burstConfetti, burstLevelUp } from './lib/celebrate';
import { playComplete, playDelete, playLevelUp } from './lib/sound';
import { randomHype } from './lib/gamify';

function App() {
  const {
    tasks,
    dopamine,
    levelInfo,
    syncing,
    addTask,
    deleteTask,
    editTask,
    toggleTask,
    setPriority,
    setOwner,
    setDueDate,
    reorderTasks,
    clearCompleted,
  } = useTodos();
  const { branding, setName, setIconFromFile, resetIcon } = useBranding();
  useBrandingMeta(branding);
  const { user, signIn, signUp, signOutUser } = useAuth();
  const [activeList, setActiveList] = useLocalStorage<ListId>('dopamine-todo:activeList', 'personal');
  const [filter, setFilter] = useState<Filter>('all');
  const [toast, setToast] = useState<ToastData | null>(null);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const [muted, setMuted] = useState(false);
  const [editingBrand, setEditingBrand] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const listCounts = LIST_ORDER.reduce(
    (acc, list) => ({ ...acc, [list]: tasks.filter((t) => t.list === list).length }),
    {} as Record<ListId, number>,
  );

  const listTasks = tasks.filter((t) => t.list === activeList);
  const total = listTasks.length;
  const completed = listTasks.filter((t) => t.done).length;
  const progress = total === 0 ? 0 : completed / total;
  const activeCount = total - completed;

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
    if (!muted) playDelete();
    deleteTask(id);
  };

  const FILTERS: { value: Filter; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: total },
    { value: 'active', label: 'Active', count: activeCount },
    { value: 'done', label: 'Done', count: completed },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <CelebrationToast toast={toast} />
      <LevelUpOverlay level={levelUp} onClose={() => setLevelUp(null)} />
      <UpdateToast />
      <BrandingEditor
        open={editingBrand}
        branding={branding}
        onClose={() => setEditingBrand(false)}
        onSaveName={setName}
        onUploadIcon={setIconFromFile}
        onResetIcon={resetIcon}
      />
      {isFirebaseConfigured && (
        <AuthModal
          open={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSignIn={signIn}
          onSignUp={signUp}
        />
      )}

      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0a0a0a]/75 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between py-5 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))]">
          <button
            onClick={() => setEditingBrand(true)}
            className="group flex min-w-0 items-center gap-3 rounded-lg py-1 pr-2 transition hover:bg-white/5"
            title="Customize name and icon"
          >
            <img
              src={branding.icon192 ?? DEFAULT_ICON_192}
              alt=""
              className="h-9 w-9 shrink-0 rounded-xl border-2 border-[#c6ff4a]/60 object-cover shadow-[0_0_16px_-6px_#c6ff4a99]"
            />
            <h1 className="truncate text-base font-bold uppercase tracking-wide text-white sm:text-lg sm:tracking-widest">{branding.name}</h1>
            <svg
              viewBox="0 0 24 24"
              className="hidden h-3.5 w-3.5 shrink-0 text-white/0 transition group-hover:text-white/40 sm:block"
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
                onSignInClick={() => setAuthModalOpen(true)}
                onSignOut={signOutUser}
              />
            )}
            <InstallButton appName={branding.name} />
            <button
              onClick={() => setMuted((m) => !m)}
              className="shrink-0 rounded-lg border border-white/15 p-2 text-white/50 transition hover:border-white/30 hover:text-white"
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
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`border-b-2 pb-1 text-xs font-semibold uppercase tracking-wide transition ${
                    filter === f.value ? 'border-[#c6ff4a] text-white' : 'border-transparent text-white/35 hover:text-white/60'
                  }`}
                >
                  {f.label} <span className="tabular-nums text-white/25">· {f.count}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 text-xs text-white/40">
              <span className="tabular-nums">{activeCount} left</span>
              {completed > 0 && (
                <button
                  onClick={() => clearCompleted(activeList)}
                  className="font-medium uppercase tracking-wide text-white/40 hover:text-red-400"
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
            <p className="text-[10px] uppercase tracking-widest text-white/30">All-time cleared</p>
            <p className="mt-1 font-display text-3xl font-bold tabular-nums text-[#c6ff4a]">{dopamine.totalCompleted}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wide text-white/25">
              {dopamine.totalCompleted > 0 ? 'keep the streak alive' : 'complete your first task'}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;
