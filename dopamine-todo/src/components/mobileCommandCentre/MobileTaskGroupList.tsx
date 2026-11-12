import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import { formatCCDue, isOverdue } from '../../lib/commandCentre';
import { PRIORITY_CODE } from '../../lib/priority';
import type { MobileGroup } from '../../lib/mobileCommandCentre';
import type { AccentTokens } from '../../lib/accent';
import { MobileTaskRow } from './MobileTaskRow';

interface MobileTaskGroupListProps {
  group: MobileGroup;
  today: string;
  taskView: 'list' | 'grid';
  accent: AccentTokens;
  onToggle: (id: string) => void;
  onSnooze: (id: string) => void;
  onOpen: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
  onClearCompleted?: () => void;
}

interface DragState {
  id: string;
  startPointerY: number;
  startCenter: number;
  order: string[];
  centers: Map<string, number>;
}

/** Owns the within-group reorder gesture: snapshots every row's position when a drag on its ⋮⋮
    grip starts, then on each move re-derives the dragged task's target index from how its
    (delta-shifted) center compares to the other rows' original centers — rather than mutating
    positions incrementally — so a fast flick lands in the right slot in one step. Arrow keys on
    a focused grip do a plain adjacent swap instead. */
export function MobileTaskGroupList({ group, today, taskView, accent, onToggle, onSnooze, onOpen, onReorder, onClearCompleted }: MobileTaskGroupListProps) {
  const [order, setOrder] = useState(group.tasks.map((t) => t.id));
  const tasksById = useRef(new Map(group.tasks.map((t) => [t.id, t])));
  tasksById.current = new Map(group.tasks.map((t) => [t.id, t]));

  useEffect(() => {
    setOrder(group.tasks.map((t) => t.id));
  }, [group.tasks]);

  const rowRefs = useRef(new Map<string, HTMLDivElement>());
  const dragRef = useRef<DragState | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffsetY, setDragOffsetY] = useState(0);

  const registerRef = (id: string, el: HTMLDivElement | null) => {
    if (el) rowRefs.current.set(id, el);
    else rowRefs.current.delete(id);
  };

  const onGripPointerDown = (id: string, e: ReactPointerEvent<HTMLButtonElement>) => {
    const centers = new Map<string, number>();
    order.forEach((taskId) => {
      const el = rowRefs.current.get(taskId);
      if (el) {
        const rect = el.getBoundingClientRect();
        centers.set(taskId, rect.top + rect.height / 2);
      }
    });
    dragRef.current = { id, startPointerY: e.clientY, startCenter: centers.get(id) ?? e.clientY, order: [...order], centers };
    setDraggingId(id);
    setDragOffsetY(0);
  };

  const onGripPointerMove = (id: string, e: ReactPointerEvent<HTMLButtonElement>) => {
    const state = dragRef.current;
    if (!state || state.id !== id) return;
    const offset = e.clientY - state.startPointerY;
    setDragOffsetY(offset);
    const draggedCenter = state.startCenter + offset;
    const others = state.order.filter((taskId) => taskId !== id);
    let targetIndex = others.findIndex((taskId) => draggedCenter < (state.centers.get(taskId) ?? Infinity));
    if (targetIndex === -1) targetIndex = others.length;
    const newOrder = [...others];
    newOrder.splice(targetIndex, 0, id);
    setOrder(newOrder);
  };

  const endDrag = () => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setDraggingId(null);
    setDragOffsetY(0);
    onReorder(order);
  };

  const onGripKeyDown = (id: string, e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    const idx = order.indexOf(id);
    const next = idx + (e.key === 'ArrowUp' ? -1 : 1);
    if (next < 0 || next >= order.length) return;
    const newOrder = [...order];
    [newOrder[idx], newOrder[next]] = [newOrder[next], newOrder[idx]];
    setOrder(newOrder);
    onReorder(newOrder);
  };

  const headerColor =
    group.key === 'overdue' ? 'var(--cc-red-text)' : group.key === 'completed' ? 'var(--cc-green-text)' : 'var(--cc-ink)';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between px-1 pb-0.5">
        <span className="flex items-center gap-2 text-[13px] font-bold" style={{ color: headerColor }}>
          {group.label} <span className="font-medium text-cc-ink-4">{group.tasks.length}</span>
        </span>
        {group.key === 'completed' && onClearCompleted && (
          <button onClick={onClearCompleted} className="text-[12px] font-semibold uppercase tracking-wide text-cc-ink-4 transition active:scale-95">
            Clear completed
          </button>
        )}
      </div>

      {taskView === 'grid' ? (
        <div className="grid grid-cols-2 gap-2.5">
          {group.tasks.map((task) => {
            const late = isOverdue(task, today);
            return (
              <div
                key={task.id}
                className="flex h-[108px] flex-col justify-between gap-1.5 overflow-hidden rounded-2xl border px-3 py-2.5"
                style={{
                  borderColor: late ? 'rgba(253,227,221,.9)' : 'rgba(255,255,255,.65)',
                  background: late ? 'rgba(253,227,221,.85)' : 'rgba(255,255,255,.7)',
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    onClick={() => onToggle(task.id)}
                    aria-label={task.done ? 'Mark as not done' : 'Mark as done'}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] text-xs font-extrabold text-white transition active:scale-[0.88]"
                    style={{ background: task.done ? accent.solid : 'rgba(255,255,255,.85)', borderColor: task.done ? accent.solid : 'rgba(29,26,22,.25)' }}
                  >
                    {task.done && '✓'}
                  </button>
                  <span className="whitespace-nowrap rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cc-ink-3">
                    {PRIORITY_CODE[task.priority]}
                  </span>
                </div>
                <button onClick={() => onOpen(task.id)} className={`flex min-w-0 flex-1 flex-col items-start gap-1 overflow-hidden text-left ${task.done ? 'opacity-50' : ''}`}>
                  <span className={`line-clamp-2 w-full text-[13px] font-semibold leading-snug text-cc-ink ${task.done ? 'line-through' : ''}`}>{task.text}</span>
                </button>
                <span
                  className="self-start whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{ background: late ? '#fff' : 'rgba(255,255,255,.9)', color: late ? 'var(--cc-red-text)' : 'var(--cc-ink)' }}
                >
                  {formatCCDue(task.dueDate, today)}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {order.map((id) => {
            const task = tasksById.current.get(id);
            if (!task) return null;
            return (
              <MobileTaskRow
                key={id}
                task={task}
                today={today}
                accent={accent}
                dragOffsetY={id === draggingId ? dragOffsetY : 0}
                isDragging={id === draggingId}
                registerRef={registerRef}
                onToggle={onToggle}
                onSnooze={onSnooze}
                onOpen={onOpen}
                onGripPointerDown={onGripPointerDown}
                onGripPointerMove={onGripPointerMove}
                onGripPointerUp={endDrag}
                onGripKeyDown={onGripKeyDown}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
