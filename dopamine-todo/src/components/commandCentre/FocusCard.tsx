import type { Task } from '../../types';
import { XP_BY_PRIORITY } from '../../lib/gamify';
import { PRIORITY_SHORT_LABELS } from '../../lib/priority';
import { formatCCDue, isOverdue, pickFocusTasks } from '../../lib/commandCentre';

interface FocusCardProps {
  tasks: Task[];
  today: string;
  onToggle: (id: string) => void;
  onOpenTask: (id: string) => void;
}

function focusTag(task: Task, today: string): string {
  if (!task.dueDate) return 'No due date';
  if (isOverdue(task, today)) return 'Overdue';
  const due = formatCCDue(task.dueDate, today);
  if (due === 'Today' || due === 'Tomorrow') return `Due ${due.toLowerCase()}`;
  return `Due ${due}`;
}

export function FocusCard({ tasks, today, onToggle, onOpenTask }: FocusCardProps) {
  const { focus, then } = pickFocusTasks(tasks, today);

  return (
    <div className="flex w-full flex-col gap-3.5 sm:sticky sm:top-5 sm:w-auto">
      <span className="pl-1.5 text-[13px] font-bold text-cc-ink">Focus now</span>

      {focus ? (
        <div className="flex flex-col gap-4.5 rounded-[22px] bg-[#1d1a16] p-5 text-white shadow-[0_18px_40px_rgba(30,20,10,0.3)]">
          <div className="flex items-center justify-between">
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-bold text-cc-ink"
              style={{ background: isOverdue(focus, today) ? '#f6b7a9' : '#fff' }}
            >
              {focusTag(focus, today)}
            </span>
            <span className="text-xs opacity-60">{PRIORITY_SHORT_LABELS[focus.priority]} priority</span>
          </div>
          <button onClick={() => onOpenTask(focus.id)} className="flex flex-col gap-1 text-left transition active:scale-[0.98]">
            <span className="text-[22px] font-bold leading-tight tracking-tight">{focus.text}</span>
            {focus.notes && <span className="text-sm opacity-75">{focus.notes}</span>}
          </button>
          <button
            onClick={() => onToggle(focus.id)}
            className="rounded-[14px] border-none p-3.5 text-[14px] font-bold text-white transition active:scale-[0.97]"
            style={{ background: 'linear-gradient(160deg, oklch(0.7 0.1 172), oklch(0.55 0.09 176))' }}
          >
            Mark done · +{XP_BY_PRIORITY[focus.priority]} XP
          </button>
        </div>
      ) : (
        <div className="cc-glass-card flex flex-col items-center gap-1 rounded-[22px] p-6 text-center">
          <span className="text-2xl">✨</span>
          <span className="text-sm font-semibold text-cc-ink">All clear</span>
          <span className="text-xs text-cc-ink-3">Nothing pending right now.</span>
        </div>
      )}

      {then.map((task) => (
        <button
          key={task.id}
          onClick={() => onOpenTask(task.id)}
          className="cc-glass-card flex items-center justify-between gap-2.5 rounded-2xl px-3.5 py-3 text-left transition active:scale-[0.98]"
        >
          <div className="flex min-w-0 flex-col">
            <span className="text-[11px] font-semibold text-cc-ink-4">THEN</span>
            <span className="truncate text-sm font-semibold text-cc-ink">{task.text}</span>
          </div>
          <span className="whitespace-nowrap text-xs text-cc-ink-3">{formatCCDue(task.dueDate, today)}</span>
        </button>
      ))}
    </div>
  );
}
