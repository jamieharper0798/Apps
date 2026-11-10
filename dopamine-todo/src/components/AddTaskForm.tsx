import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { Priority } from '../types';
import { PRIORITY_CODE } from '../lib/priority';
import { dueDatePillClasses } from '../lib/dueDate';
import { formatDueDate } from '../lib/formatDueDate';
import { dayKey } from '../lib/gamify';

interface AddTaskFormProps {
  onAdd: (text: string, priority: Priority, dueDate: string | null) => void;
  listLabel: string;
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="5" width="18" height="16" rx="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 3v4M16 3v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AddTaskForm({ onAdd, listLabel }: AddTaskFormProps) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  // Defaults to today — left untouched, a new task is due today; pick another date to override.
  const [dueDate, setDueDate] = useState(dayKey());

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text, priority, dueDate || null);
    setText('');
    setDueDate(dayKey());
  };

  const handleDueDate = (e: ChangeEvent<HTMLInputElement>) => {
    setDueDate(e.target.value);
  };

  const openDatePicker = (e: { currentTarget: HTMLInputElement }) => {
    try {
      e.currentTarget.showPicker?.();
    } catch {
      // showPicker isn't available/allowed here — the input is still focused and usable.
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="panel flex flex-col gap-3 rounded-xl p-3 ring-1 ring-transparent transition-shadow duration-200 focus-within:shadow-[0_0_0_1px_color-mix(in_srgb,var(--accent)_40%,transparent),0_0_24px_-8px_color-mix(in_srgb,var(--accent)_40%,transparent)] focus-within:ring-accent/40 sm:flex-row sm:items-center sm:p-2 sm:pl-4"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="shrink-0 font-mono text-accent">&gt;</span>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`add a ${listLabel.toLowerCase()} task_`}
          className="min-w-0 flex-1 bg-transparent py-2 text-[15px] text-ink placeholder-ink/30 outline-none"
          maxLength={200}
        />
      </div>
      <div className="flex items-center gap-2">
        <div className="flex gap-1 rounded-lg border border-ink/10 p-1">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={`rounded-md px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition active:scale-90 ${
                priority === p ? 'bg-ink/10 text-ink' : 'text-ink/35 hover:text-ink/70'
              }`}
              title={PRIORITY_CODE[p]}
            >
              {PRIORITY_CODE[p]}
            </button>
          ))}
        </div>
        <div className="relative shrink-0">
          <div
            className={`pointer-events-none flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-[11px] font-medium uppercase tracking-wide ${dueDatePillClasses(dueDate || null, false)}`}
          >
            <CalendarIcon />
            <span className="font-mono">{dueDate ? formatDueDate(dueDate) : 'No due'}</span>
          </div>
          <input
            type="date"
            value={dueDate}
            onChange={handleDueDate}
            onClick={openDatePicker}
            onFocus={openDatePicker}
            aria-label="Due date"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-lg border border-accent/60 px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-accent transition hover:shadow-[0_0_20px_-6px_var(--accent)] active:scale-95 hover:bg-accent/10 disabled:opacity-30 disabled:hover:shadow-none"
          disabled={!text.trim()}
        >
          Add
          <span aria-hidden>↵</span>
        </button>
      </div>
    </form>
  );
}
