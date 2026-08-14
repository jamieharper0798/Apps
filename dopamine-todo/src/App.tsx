import { useEffect, useRef, useState } from 'react';
import { useTodos } from './hooks/useTodos';
import { AddTaskForm } from './components/AddTaskForm';
import { TaskList } from './components/TaskList';
import type { Filter } from './components/TaskList';
import { XPBar } from './components/XPBar';
import { StreakBadge } from './components/StreakBadge';
import { ProgressRing } from './components/ProgressRing';
import { CelebrationToast } from './components/CelebrationToast';
import type { ToastData } from './components/CelebrationToast';
import { LevelUpOverlay } from './components/LevelUpOverlay';
import { InstallButton } from './components/InstallButton';
import { UpdateToast } from './components/UpdateToast';
import { BrandingEditor } from './components/BrandingEditor';
import { useBranding } from './hooks/useBranding';
import { useBrandingMeta } from './hooks/useBrandingMeta';
import { burstConfetti, burstLevelUp } from './lib/celebrate';
import { playComplete, playDelete, playLevelUp } from './lib/sound';
import { randomHype } from './lib/gamify';

function App() {
  const { tasks, dopamine, levelInfo, addTask, deleteTask, toggleTask, setOwner, setDueDate, clearCompleted } =
    useTodos();
  const { branding, setName, setIconFromFile, resetIcon } = useBranding();
  useBrandingMeta(branding);
  const [filter, setFilter] = useState<Filter>('all');
  const [toast, setToast] = useState<ToastData | null>(null);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const [muted, setMuted] = useState(false);
  const [editingBrand, setEditingBrand] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.done).length;
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

  const FILTERS: { value: Filter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'done', label: 'Done' },
  ];

  return (
    <div className="bg-aurora min-h-screen">
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

      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 pb-16 pt-8 sm:px-6">
        <header className="mb-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setEditingBrand(true)}
              className="group flex items-center gap-2 rounded-lg py-1 pr-2 transition hover:bg-white/5"
              title="Customize name and icon"
            >
              {branding.icon192 ? (
                <img src={branding.icon192} alt="" className="h-7 w-7 rounded-lg object-cover" />
              ) : (
                <span className="text-2xl">⚡</span>
              )}
              <h1 className="font-display text-xl font-bold text-white">{branding.name}</h1>
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5 text-white/0 transition group-hover:text-white/40"
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
            <div className="flex items-center gap-2">
              <InstallButton />
              <button
                onClick={() => setMuted((m) => !m)}
                className="rounded-full p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
                aria-label={muted ? 'Unmute sound' : 'Mute sound'}
                title={muted ? 'Unmute' : 'Mute'}
              >
                {muted ? '🔇' : '🔊'}
              </button>
            </div>
          </div>

          <div className="glass flex items-center justify-between gap-4 rounded-2xl p-4">
            <XPBar level={levelInfo.level} xpIntoLevel={levelInfo.xpIntoLevel} xpForNextLevel={levelInfo.xpForNextLevel} />
            <div className="flex items-center gap-3">
              <StreakBadge streak={dopamine.streak} />
              <ProgressRing progress={progress} />
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-5">
          <AddTaskForm onAdd={addTask} />

          <div className="flex items-center justify-between">
            <div className="flex gap-1 rounded-xl bg-white/5 p-1">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    filter === f.value ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 text-xs text-white/40">
              <span>{activeCount} left</span>
              {completed > 0 && (
                <button onClick={clearCompleted} className="font-medium text-white/40 hover:text-red-400">
                  Clear done
                </button>
              )}
            </div>
          </div>

          <TaskList
            tasks={tasks}
            filter={filter}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onOwnerChange={setOwner}
            onDueDateChange={setDueDate}
          />
        </main>

        <footer className="mt-10 text-center text-xs text-white/25">
          {dopamine.totalCompleted > 0
            ? `${dopamine.totalCompleted} task${dopamine.totalCompleted === 1 ? '' : 's'} completed all-time · keep the streak alive`
            : 'Complete your first task to start earning XP'}
        </footer>
      </div>
    </div>
  );
}

export default App;
