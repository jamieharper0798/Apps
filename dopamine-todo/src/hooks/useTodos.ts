import { useCallback } from 'react';
import type { AppState, ListId, Priority, Repeat, Task } from '../types';
import { useAppState } from './useAppState';
import { XP_BY_PRIORITY, dayKey, isYesterday, levelFromTotalXp } from '../lib/gamify';
import { nextDueDate } from '../lib/repeat';

/** Coerces an invalid stored count (undefined, or NaN from the brief window this field
    could be written as NaN) back to 0, since destructure defaults only catch undefined. */
function safeCount(n: number | undefined): number {
  return Number.isFinite(n) ? (n as number) : 0;
}

const INITIAL_STATE: AppState = {
  tasks: [],
  dopamine: {
    xp: 0,
    level: 1,
    streak: 0,
    lastCompletedDay: null,
    totalCompleted: 0,
    completedToday: 0,
  },
};

export interface CompleteResult {
  xpGained: number;
  leveledUp: boolean;
  newLevel: number;
  streak: number;
  streakExtended: boolean;
}

export function useTodos() {
  const [state, setState, { syncing, syncError }] = useAppState(INITIAL_STATE);

  /** Returns the new task's id (or undefined if the text was blank), so a caller can chain a follow-up write like setNotes. */
  const addTask = useCallback(
    (text: string, priority: Priority, list: ListId): string | undefined => {
      const trimmed = text.trim();
      if (!trimmed) return undefined;
      const task: Task = {
        id: crypto.randomUUID(),
        text: trimmed,
        done: false,
        priority,
        owner: '',
        list,
        dueDate: null,
        notes: '',
        repeat: 'none',
        createdAt: Date.now(),
        completedAt: null,
      };
      setState((prev) => ({ ...prev, tasks: [task, ...prev.tasks] }));
      return task.id;
    },
    [setState],
  );

  const deleteTask = useCallback(
    (id: string) => {
      setState((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== id) }));
    },
    [setState],
  );

  /** Re-inserts a deleted task at its original position, for an "undo delete" action. */
  const restoreTask = useCallback(
    (task: Task, index: number) => {
      setState((prev) => {
        if (prev.tasks.some((t) => t.id === task.id)) return prev;
        const tasks = [...prev.tasks];
        tasks.splice(Math.min(index, tasks.length), 0, task);
        return { ...prev, tasks };
      });
    },
    [setState],
  );

  const editTask = useCallback(
    (id: string, text: string) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === id ? { ...t, text } : t)),
      }));
    },
    [setState],
  );

  const setPriority = useCallback(
    (id: string, priority: Priority) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === id ? { ...t, priority } : t)),
      }));
    },
    [setState],
  );

  const setOwner = useCallback(
    (id: string, owner: string) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === id ? { ...t, owner: owner.slice(0, 40) } : t)),
      }));
    },
    [setState],
  );

  const setDueDate = useCallback(
    (id: string, dueDate: string | null) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === id ? { ...t, dueDate } : t)),
      }));
    },
    [setState],
  );

  const setNotes = useCallback(
    (id: string, notes: string) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === id ? { ...t, notes: notes.slice(0, 4000) } : t)),
      }));
    },
    [setState],
  );

  const setRepeat = useCallback(
    (id: string, repeat: Repeat) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === id ? { ...t, repeat } : t)),
      }));
    },
    [setState],
  );

  /** Reorders a subset of tasks (e.g. one priority group) to match `orderedIds`, leaving every other task's position untouched. */
  const reorderTasks = useCallback(
    (orderedIds: string[]) => {
      setState((prev) => {
        const byId = new Map(prev.tasks.map((t) => [t.id, t]));
        const orderedSet = new Set(orderedIds);
        let cursor = 0;
        const tasks = prev.tasks.map((t) => {
          if (!orderedSet.has(t.id)) return t;
          const next = byId.get(orderedIds[cursor]);
          cursor += 1;
          return next ?? t;
        });
        return { ...prev, tasks };
      });
    },
    [setState],
  );

  const clearCompleted = useCallback(
    (list: ListId) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((t) => !(t.done && (t.list ?? 'personal') === list)),
      }));
    },
    [setState],
  );

  /** Toggles a task and returns gamification info synchronously so the UI can celebrate. */
  const toggleTask = useCallback(
    (id: string): CompleteResult | null => {
      const target = state.tasks.find((t) => t.id === id);
      if (!target) return null;

      const nowCompleting = !target.done;
      const prevLevelInfo = levelFromTotalXp(state.dopamine.xp);
      const xpDelta = nowCompleting
        ? XP_BY_PRIORITY[target.priority]
        : -XP_BY_PRIORITY[target.priority];
      const newXp = Math.max(0, state.dopamine.xp + xpDelta);

      // completedToday may be absent (state saved before it existed) or NaN (state saved
      // during the brief window it could become NaN) — this reads state.dopamine directly,
      // not the hook's normalized return value below, so normalize it here too.
      let { streak, lastCompletedDay, totalCompleted } = state.dopamine;
      let completedToday = safeCount(state.dopamine.completedToday);
      let streakExtended = false;

      if (nowCompleting) {
        const today = dayKey();
        if (lastCompletedDay === today) {
          // already logged today, streak unchanged
          completedToday += 1;
        } else if (lastCompletedDay && isYesterday(today, lastCompletedDay)) {
          streak += 1;
          streakExtended = true;
          completedToday = 1;
        } else {
          streak = 1;
          streakExtended = true;
          completedToday = 1;
        }
        lastCompletedDay = today;
        totalCompleted += 1;
      } else {
        // Undoing a completion: mirror the increment so the counts stay accurate. totalCompleted
        // is a lifetime count so it always comes back down; completedToday only comes back down
        // when the completion being undone actually happened today — undoing an old completion
        // (e.g. from the Done filter) shouldn't touch today's count.
        totalCompleted = Math.max(0, totalCompleted - 1);
        const today = dayKey();
        const wasCompletedToday = target.completedAt !== null && dayKey(new Date(target.completedAt)) === today;
        if (wasCompletedToday && lastCompletedDay === today) {
          completedToday = Math.max(0, completedToday - 1);
        }
      }

      const newLevelInfo = levelFromTotalXp(newXp);
      // Tasks created before `repeat` existed have no such field in storage — treat
      // that the same as 'none' rather than letting `undefined !== 'none'` read as recurring.
      const isRecurring = nowCompleting && (target.repeat ?? 'none') !== 'none';

      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => {
          if (t.id !== id) return t;
          if (isRecurring) {
            // Recurring tasks grant XP/streak like any completion, but immediately roll
            // forward to their next occurrence instead of sitting in the Done list.
            return { ...t, done: false, completedAt: Date.now(), dueDate: nextDueDate(t.repeat, t.dueDate) };
          }
          return { ...t, done: nowCompleting, completedAt: nowCompleting ? Date.now() : null };
        }),
        dopamine: {
          xp: newXp,
          level: newLevelInfo.level,
          streak,
          lastCompletedDay,
          totalCompleted,
          completedToday,
        },
      }));

      if (!nowCompleting) return null;

      return {
        xpGained: XP_BY_PRIORITY[target.priority],
        leveledUp: newLevelInfo.level > prevLevelInfo.level,
        newLevel: newLevelInfo.level,
        streak,
        streakExtended,
      };
    },
    [state.tasks, state.dopamine, setState],
  );

  const levelInfo = levelFromTotalXp(state.dopamine.xp);

  // Tasks created before per-list support existed have no `list` field — default them to personal.
  // Tasks created before notes/repeat existed have no `notes`/`repeat` field — default them.
  const tasks: Task[] = state.tasks.map((t) => {
    if (t.list && t.notes !== undefined && t.repeat !== undefined) return t;
    return { ...t, list: t.list ?? 'personal', notes: t.notes ?? '', repeat: t.repeat ?? 'none' };
  });

  // Dopamine state saved before completedToday existed has no such field in storage, and a
  // brief window could write it as NaN — normalize either case back to 0.
  const dopamine: AppState['dopamine'] = Number.isFinite(state.dopamine.completedToday)
    ? state.dopamine
    : { ...state.dopamine, completedToday: 0 };

  return {
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
  };
}
