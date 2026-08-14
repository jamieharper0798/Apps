import { motion } from 'framer-motion';
import type { ChangeEvent } from 'react';
import type { Task } from '../types';
import { PRIORITY_STYLES } from '../lib/priority';
import { dueDateColor } from '../lib/dueDate';
import { OWNER_COL, DUE_COL } from '../lib/taskColumns';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onOwnerChange: (id: string, owner: string) => void;
  onDueDateChange: (id: string, dueDate: string | null) => void;
}

export function TaskItem({ task, onToggle, onDelete, onOwnerChange, onDueDateChange }: TaskItemProps) {
  const owner = task.owner ?? '';
  const dueDate = task.dueDate ?? null;
  const dueColor = dueDateColor(dueDate, task.done);

  const handleDueDate = (e: ChangeEvent<HTMLInputElement>) => {
    onDueDateChange(task.id, e.target.value || null);
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      className="glass group flex flex-col gap-2 rounded-xl px-3 py-3 sm:px-4"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => onToggle(task.id)}
          aria-label={task.done ? 'Mark as not done' : 'Mark as done'}
          className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
            task.done
              ? 'border-transparent bg-gradient-to-br from-purple-500 to-pink-500'
              : 'border-white/25 hover:border-purple-400'
          }`}
        >
          {task.done && (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </motion.svg>
          )}
        </button>

        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${PRIORITY_STYLES[task.priority]}`} />

        <span
          className={`flex-1 truncate text-left text-[15px] transition-colors ${
            task.done ? 'text-white/35 line-through' : 'text-white/90'
          }`}
        >
          {task.text}
        </span>

        <input
          value={owner}
          onChange={(e) => onOwnerChange(task.id, e.target.value)}
          placeholder="Owner"
          className={`hidden ${OWNER_COL} shrink-0 truncate rounded-lg bg-white/5 px-2 py-1 text-xs text-white/70 placeholder-white/25 outline-none ring-1 ring-transparent transition focus:bg-white/10 focus:ring-purple-400/40 sm:block`}
        />

        <input
          type="date"
          value={dueDate ?? ''}
          onChange={handleDueDate}
          aria-label="Due date"
          className={`hidden ${DUE_COL} shrink-0 rounded-lg bg-white/5 px-2 py-1 text-xs outline-none ring-1 ring-transparent transition focus:bg-white/10 focus:ring-purple-400/40 sm:block ${dueColor}`}
        />

        <button
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
          className="shrink-0 rounded-lg p-1.5 text-white/25 opacity-0 transition hover:bg-white/10 hover:text-red-400 group-hover:opacity-100 focus-visible:opacity-100"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-2 pl-9 sm:hidden">
        <input
          value={owner}
          onChange={(e) => onOwnerChange(task.id, e.target.value)}
          placeholder="Owner"
          className="min-w-0 flex-1 truncate rounded-lg bg-white/5 px-2 py-1 text-xs text-white/70 placeholder-white/25 outline-none ring-1 ring-transparent transition focus:bg-white/10 focus:ring-purple-400/40"
        />
        <input
          type="date"
          value={dueDate ?? ''}
          onChange={handleDueDate}
          aria-label="Due date"
          className={`w-[132px] shrink-0 rounded-lg bg-white/5 px-2 py-1 text-xs outline-none ring-1 ring-transparent transition focus:bg-white/10 focus:ring-purple-400/40 ${dueColor}`}
        />
      </div>
    </motion.li>
  );
}
