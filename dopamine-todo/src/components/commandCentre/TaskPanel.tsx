import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { ListId, Priority, Task } from '../../types';
import type { Filter } from '../TaskList';
import { LIST_ORDER, LIST_META } from '../../lib/lists';
import { PRIORITY_ORDER, PRIORITY_CODE } from '../../lib/priority';
import { CC_FILTER_ORDER, formatCCDue, groupTasksForCommandCentre, filterTasksForCommandCentre } from '../../lib/commandCentre';

interface TaskPanelProps {
  activeList: ListId;
  onActiveListChange: (list: ListId) => void;
  listCounts: Record<ListId, number>;
  filter: Filter;
  onFilterChange: (f: Filter) => void;
  tasks: Task[];
  today: string;
  onToggle: (id: string) => void;
  onAdd: (text: string, priority: Priority) => void;
  onOpenTask: (id: string) => void;
}

export function TaskPanel({
  activeList,
  onActiveListChange,
  listCounts,
  filter,
  onFilterChange,
  tasks,
  today,
  onToggle,
  onAdd,
  onOpenTask,
}: TaskPanelProps) {
  const [draft, setDraft] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');

  const submit = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onAdd(trimmed, priority);
    setDraft('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit();
  };

  const filtered = filterTasksForCommandCentre(tasks, filter, today);
  const groups = groupTasksForCommandCentre(filtered, today);

  return (
    <div className="cc-glass-card flex min-w-0 flex-1 basis-[480px] grow-[999] flex-col gap-4.5 rounded-3xl p-5.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-full bg-[rgba(255,255,255,0.45)] p-1">
          {LIST_ORDER.map((list) => (
            <button
              key={list}
              onClick={() => onActiveListChange(list)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-semibold transition active:scale-95 ${
                list === activeList ? 'bg-[#1d1a16] text-white' : 'text-cc-ink-3'
              }`}
            >
              {LIST_META[list].label} {listCounts[list] ?? 0}
            </button>
          ))}
        </div>
        <div className="flex gap-1 rounded-full bg-[rgba(255,255,255,0.4)] p-1">
          {CC_FILTER_ORDER.map((f) => (
            <button
              key={f.value}
              onClick={() => onFilterChange(f.value)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold text-cc-ink transition active:scale-95 ${
                filter === f.value ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]' : ''
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-[rgba(255,255,255,0.8)] bg-[rgba(255,255,255,0.7)] py-2 pl-4.5 pr-2">
        <span className="text-lg text-cc-ink-4">+</span>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a task"
          className="min-w-0 flex-1 bg-transparent text-[15px] font-medium text-cc-ink outline-none placeholder-cc-ink-4"
        />
        <div className="flex shrink-0 gap-0.5 rounded-lg bg-[rgba(255,255,255,0.6)] p-0.5">
          {PRIORITY_ORDER.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={`rounded-md px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide transition active:scale-90 ${
                priority === p ? 'bg-[#1d1a16] text-white' : 'text-cc-ink-3'
              }`}
            >
              {PRIORITY_CODE[p]}
            </button>
          ))}
        </div>
        <button
          onClick={submit}
          className="shrink-0 rounded-xl bg-[#1d1a16] px-4.5 py-2.5 text-[13px] font-semibold text-white transition active:scale-95"
        >
          Add Task
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="py-9 text-center text-[15px] text-cc-ink-3">Nothing here.</div>
      ) : (
        groups.map((group) => (
          <div key={group.key} className="flex flex-col gap-1.5">
            <div className={`flex items-center gap-2 px-1 pb-1 text-[13px] font-bold ${group.headerClassName}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${group.dotClassName}`} />
              {group.label}
              <span className="font-medium text-cc-ink-4">{group.tasks.length}</span>
            </div>
            {group.tasks.map((task) => {
              const late = group.key === 'overdue';
              return (
                <div
                  key={task.id}
                  className={`grid grid-cols-[26px_minmax(0,1fr)_auto] items-center gap-3.5 rounded-2xl border border-[rgba(255,255,255,0.65)] px-4 py-3.5 transition hover:bg-[rgba(255,255,255,0.8)] ${
                    late ? 'bg-[rgba(253,227,221,0.75)]' : 'bg-[rgba(255,255,255,0.55)]'
                  }`}
                >
                  <button
                    onClick={() => onToggle(task.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-full border-[1.5px] text-xs font-extrabold text-white transition active:scale-[0.88]"
                    style={{
                      background: task.done ? 'var(--cc-teal-solid)' : 'rgba(255,255,255,0.8)',
                      borderColor: task.done ? 'var(--cc-teal-solid)' : 'rgba(29,26,22,0.25)',
                    }}
                    aria-label={task.done ? 'Mark as not done' : 'Mark as done'}
                  >
                    {task.done && '✓'}
                  </button>
                  <button
                    onClick={() => onOpenTask(task.id)}
                    className={`flex min-w-0 flex-col gap-0.5 text-left transition active:scale-[0.98] ${task.done ? 'opacity-50' : ''}`}
                  >
                    <span
                      className={`truncate text-[16px] font-semibold tracking-tight text-cc-ink ${task.done ? 'line-through' : ''}`}
                    >
                      {task.text}
                    </span>
                    {task.notes && <span className="truncate text-[13px] text-cc-ink-3">{task.notes}</span>}
                  </button>
                  <span
                    className="whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-semibold"
                    style={{
                      background: late ? '#fff' : 'rgba(255,255,255,0.85)',
                      color: late ? 'var(--cc-red-text)' : 'var(--cc-ink)',
                    }}
                  >
                    {formatCCDue(task.dueDate, today)}
                  </span>
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}
