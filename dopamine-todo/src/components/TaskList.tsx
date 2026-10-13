import { AnimatePresence, motion } from 'framer-motion';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import type { Priority, Task } from '../types';
import { TaskItem } from './TaskItem';
import { PRIORITY_ORDER, PRIORITY_STYLES } from '../lib/priority';
import { dayKey } from '../lib/gamify';

export type Filter = 'all' | 'active' | 'done' | 'overdue';

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
  onReorder: (orderedIds: string[]) => void;
  onOpen: (id: string) => void;
}

const PRIORITY_LABELS: Record<Task['priority'], string> = {
  high: 'High priority',
  medium: 'Medium priority',
  low: 'Low priority',
};

function PriorityGroup({
  priority,
  tasks,
  startIndex,
  onToggle,
  onDelete,
  onEdit,
  onOwnerChange,
  onDueDateChange,
  onPriorityChange,
  onReorder,
  onOpen,
}: {
  priority: Priority;
  tasks: Task[];
  startIndex: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onOwnerChange: (id: string, owner: string) => void;
  onDueDateChange: (id: string, dueDate: string | null) => void;
  onPriorityChange: (id: string, priority: Priority) => void;
  onReorder: (orderedIds: string[]) => void;
  onOpen: (id: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ids = tasks.map((t) => t.id);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(ids, oldIndex, newIndex));
  };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2 border-b border-ink/10 pb-2 text-xs font-semibold uppercase tracking-widest text-ink/35">
        <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_STYLES[priority]}`} />
        {PRIORITY_LABELS[priority]}
        <span className="font-mono font-normal normal-case text-ink/20">· {tasks.length}</span>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={rectSortingStrategy}>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence initial={false}>
              {tasks.map((task, i) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  index={startIndex + i}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onOwnerChange={onOwnerChange}
                  onDueDateChange={onDueDateChange}
                  onPriorityChange={onPriorityChange}
                  onOpen={onOpen}
                />
              ))}
            </AnimatePresence>
          </ul>
        </SortableContext>
      </DndContext>
    </section>
  );
}

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
  onReorder,
  onOpen,
}: TaskListProps) {
  const today = dayKey();
  const filtered = tasks.filter((t) => {
    if (filter === 'active') return !t.done;
    if (filter === 'done') return t.done;
    if (filter === 'overdue') return !t.done && !!t.dueDate && t.dueDate < today;
    return true;
  });

  if (filtered.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="panel flex flex-col items-center gap-3 rounded-xl py-16 text-center"
      >
        <motion.span
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="text-5xl"
        >
          {filter === 'done' ? '🏁' : filter === 'overdue' ? '🎉' : '✨'}
        </motion.span>
        <p className="font-display text-lg font-medium text-ink/70">
          {filter === 'done'
            ? 'Nothing completed yet'
            : filter === 'overdue'
              ? 'Nothing overdue'
              : filter === 'active'
                ? "You're all caught up"
                : `No ${listLabel.toLowerCase()} tasks yet`}
        </p>
        <p className="max-w-xs text-sm text-ink/35">
          {filter === 'overdue'
            ? "You're on top of your due dates."
            : filter === 'active'
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

  let runningIndex = 1;

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => {
        const startIndex = runningIndex;
        runningIndex += group.tasks.length;
        return (
          <PriorityGroup
            key={group.priority}
            priority={group.priority}
            tasks={group.tasks}
            startIndex={startIndex}
            onToggle={onToggle}
            onDelete={onDelete}
            onEdit={onEdit}
            onOwnerChange={onOwnerChange}
            onDueDateChange={onDueDateChange}
            onPriorityChange={onPriorityChange}
            onReorder={onReorder}
            onOpen={onOpen}
          />
        );
      })}
    </div>
  );
}
