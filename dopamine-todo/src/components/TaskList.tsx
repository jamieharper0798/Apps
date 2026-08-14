import { AnimatePresence, motion } from 'framer-motion';
import type { Task } from '../types';
import { TaskItem } from './TaskItem';
import { PRIORITY_STYLES } from '../lib/priority';
import { CHECKBOX_COL, DOT_COL, OWNER_COL, DUE_COL, DELETE_COL } from '../lib/taskColumns';

export type Filter = 'all' | 'active' | 'done';

interface TaskListProps {
  tasks: Task[];
  filter: Filter;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onOwnerChange: (id: string, owner: string) => void;
  onDueDateChange: (id: string, dueDate: string | null) => void;
}

const PRIORITY_ORDER: Task['priority'][] = ['high', 'medium', 'low'];

const PRIORITY_LABELS: Record<Task['priority'], string> = {
  high: 'High priority',
  medium: 'Medium priority',
  low: 'Low priority',
};

export function TaskList({ tasks, filter, onToggle, onDelete, onOwnerChange, onDueDateChange }: TaskListProps) {
  const filtered = tasks.filter((t) => {
    if (filter === 'active') return !t.done;
    if (filter === 'done') return t.done;
    return true;
  });

  if (filtered.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass flex flex-col items-center gap-2 rounded-2xl py-16 text-center"
      >
        <span className="text-4xl">{filter === 'done' ? '🏁' : '✨'}</span>
        <p className="font-display text-lg font-medium text-white/70">
          {filter === 'done' ? 'Nothing completed yet' : filter === 'active' ? "You're all caught up" : 'A blank slate'}
        </p>
        <p className="max-w-xs text-sm text-white/35">
          {filter === 'active'
            ? 'Add a new task above and start earning XP.'
            : 'Add your first task and feel the momentum build.'}
        </p>
      </motion.div>
    );
  }

  const groups = PRIORITY_ORDER.map((priority) => ({
    priority,
    tasks: filtered.filter((t) => t.priority === priority),
  })).filter((group) => group.tasks.length > 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="hidden items-center gap-3 px-1 text-[11px] font-medium uppercase tracking-wide text-white/25 sm:flex">
        <span className={`${CHECKBOX_COL} shrink-0`} />
        <span className={`${DOT_COL} shrink-0`} />
        <span className="flex-1">Task</span>
        <span className={`${OWNER_COL} shrink-0`}>Owner</span>
        <span className={`${DUE_COL} shrink-0`}>Due</span>
        <span className={`${DELETE_COL} shrink-0`} />
      </div>

      <div className="flex flex-col gap-5">
        {groups.map((group) => (
          <section key={group.priority} className="flex flex-col gap-2">
            <div className="flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-white/35">
              <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_STYLES[group.priority]}`} />
              {PRIORITY_LABELS[group.priority]}
              <span className="font-normal normal-case text-white/20">· {group.tasks.length}</span>
            </div>
            <ul className="flex flex-col gap-2">
              <AnimatePresence initial={false}>
                {group.tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    onOwnerChange={onOwnerChange}
                    onDueDateChange={onDueDateChange}
                  />
                ))}
              </AnimatePresence>
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
