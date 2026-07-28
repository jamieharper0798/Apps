import { AnimatePresence, motion } from 'framer-motion';
import type { Task } from '../types';
import { TaskItem } from './TaskItem';

export type Filter = 'all' | 'active' | 'done';

interface TaskListProps {
  tasks: Task[];
  filter: Filter;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskList({ tasks, filter, onToggle, onDelete }: TaskListProps) {
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

  return (
    <ul className="flex flex-col gap-2">
      <AnimatePresence initial={false}>
        {filtered.map((task) => (
          <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
        ))}
      </AnimatePresence>
    </ul>
  );
}
