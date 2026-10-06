import { AnimatePresence, motion } from 'framer-motion';
import type { Priority, Task } from '../types';
import { TaskItem } from './TaskItem';
import { PRIORITY_ORDER, PRIORITY_STYLES } from '../lib/priority';

export type Filter = 'all' | 'active' | 'done';

interface TaskListProps {
  tasks: Task[];
  filter: Filter;
  listLabel: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onOwnerChange: (id: string, owner: string) => void;
  onDueDateChange: (id: string, dueDate: string | null) => void;
  onPriorityChange: (id: string, priority: Priority) => void;
}

const PRIORITY_LABELS: Record<Task['priority'], string> = {
  high: 'High priority',
  medium: 'Medium priority',
  low: 'Low priority',
};

export function TaskList({
  tasks,
  filter,
  listLabel,
  onToggle,
  onDelete,
  onEdit,
  onOwnerChange,
  onDueDateChange,
  onPriorityChange,
}: TaskListProps) {
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
        className="panel flex flex-col items-center gap-3 rounded-lg py-16 text-center"
      >
        <motion.span
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="text-5xl"
        >
          {filter === 'done' ? '🏁' : '✨'}
        </motion.span>
        <p className="font-display text-lg font-medium text-white/70">
          {filter === 'done' ? 'Nothing completed yet' : filter === 'active' ? "You're all caught up" : `No ${listLabel.toLowerCase()} tasks yet`}
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

  let runningIndex = 0;

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <section key={group.priority} className="flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-xs font-semibold uppercase tracking-widest text-white/35">
            <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_STYLES[group.priority]}`} />
            {PRIORITY_LABELS[group.priority]}
            <span className="font-normal normal-case text-white/20">· {group.tasks.length}</span>
          </div>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence initial={false}>
              {group.tasks.map((task) => {
                runningIndex += 1;
                return (
                  <TaskItem
                    key={task.id}
                    task={task}
                    index={runningIndex}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onOwnerChange={onOwnerChange}
                    onDueDateChange={onDueDateChange}
                    onPriorityChange={onPriorityChange}
                  />
                );
              })}
            </AnimatePresence>
          </ul>
        </section>
      ))}
    </div>
  );
}
