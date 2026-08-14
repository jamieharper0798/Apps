import { useCallback } from 'react';
import type { AppState, Priority, Task } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { XP_BY_PRIORITY, dayKey, isYesterday, levelFromTotalXp } from '../lib/gamify';

const INITIAL_STATE: AppState = {
  tasks: [],
  dopamine: {
    xp: 0,
    level: 1,
    streak: 0,
    lastCompletedDay: null,
    totalCompleted: 0,
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
  const [state, setState] = useLocalStorage<AppState>('dopamine-todo:v1', INITIAL_STATE);

  const addTask = useCallback(
    (text: string, priority: Priority) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const task: Task = {
        id: crypto.randomUUID(),
        text: trimmed,
        done: false,
        priority,
        owner: '',
        dueDate: null,
        createdAt: Date.now(),
        completedAt: null,
      };
      setState((prev) => ({ ...prev, tasks: [task, ...prev.tasks] }));
    },
    [setState],
  );

  const deleteTask = useCallback(
    (id: string) => {
      setState((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== id) }));
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

  const clearCompleted = useCallback(() => {
    setState((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => !t.done) }));
  }, [setState]);

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

      let { streak, lastCompletedDay, totalCompleted } = state.dopamine;
      let streakExtended = false;

      if (nowCompleting) {
        const today = dayKey();
        if (lastCompletedDay === today) {
          // already logged today, streak unchanged
        } else if (lastCompletedDay && isYesterday(today, lastCompletedDay)) {
          streak += 1;
          streakExtended = true;
        } else {
          streak = 1;
          streakExtended = true;
        }
        lastCompletedDay = today;
        totalCompleted += 1;
      }

      const newLevelInfo = levelFromTotalXp(newXp);

      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === id
            ? { ...t, done: nowCompleting, completedAt: nowCompleting ? Date.now() : null }
            : t,
        ),
        dopamine: {
          xp: newXp,
          level: newLevelInfo.level,
          streak,
          lastCompletedDay,
          totalCompleted,
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

  return {
    tasks: state.tasks,
    dopamine: state.dopamine,
    levelInfo,
    addTask,
    deleteTask,
    editTask,
    toggleTask,
    setPriority,
    setOwner,
    setDueDate,
    clearCompleted,
  };
}
