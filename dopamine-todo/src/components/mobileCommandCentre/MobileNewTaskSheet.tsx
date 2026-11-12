import { useEffect, useState } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import type { ListId, Priority } from '../../types';
import { LIST_ORDER, LIST_META } from '../../lib/lists';
import { PRIORITY_ORDER, PRIORITY_SHORT_LABELS } from '../../lib/priority';
import { XP_BY_PRIORITY } from '../../lib/gamify';
import { tomorrowOf } from '../../lib/mobileCommandCentre';
import { MobileSheet } from './MobileSheet';

interface MobileNewTaskSheetProps {
  open: boolean;
  onClose: () => void;
  today: string;
  defaultList: ListId;
  defaultDueDate: string | null;
  onAdd: (text: string, priority: Priority, list: ListId, dueDate: string | null) => string | undefined;
  onSetNotes: (id: string, notes: string) => void;
}

export function MobileNewTaskSheet({ open, onClose, today, defaultList, defaultDueDate, onAdd, onSetNotes }: MobileNewTaskSheetProps) {
  const [draft, setDraft] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [list, setList] = useState<ListId>(defaultList);
  const [dueDate, setDueDate] = useState<string | null>(defaultDueDate);
  const tomorrow = tomorrowOf(today);

  useEffect(() => {
    if (open) {
      setDraft('');
      setPriority('medium');
      setList(defaultList);
      setDueDate(defaultDueDate);
    }
  }, [open, defaultList, defaultDueDate]);

  const submit = () => {
    const [subjectPart, ...rest] = draft.split('|');
    const subject = subjectPart.trim();
    if (!subject) return;
    const notes = rest.join('|').trim();
    const id = onAdd(subject, priority, list, dueDate);
    if (id && notes) onSetNotes(id, notes);
    onClose();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit();
  };

  const handleCustomDate = (e: ChangeEvent<HTMLInputElement>) => {
    setDueDate(e.target.value || null);
  };

  const openDatePicker = (e: { currentTarget: HTMLInputElement }) => {
    try {
      e.currentTarget.showPicker?.();
    } catch {
      // showPicker isn't available/allowed here — the input is still focused and usable.
    }
  };

  const isCustomDate = dueDate !== null && dueDate !== today && dueDate !== tomorrow;

  return (
    <MobileSheet open={open} onClose={onClose} ariaLabel="New task">
      <div className="flex items-center justify-between">
        <h2 className="m-0 text-[18px] font-bold tracking-tight text-cc-ink">New task</h2>
        <button onClick={onClose} className="min-h-10 rounded-full bg-cc-ink/[0.07] px-3.5 text-sm font-semibold text-cc-ink transition active:scale-95">
          Cancel
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="mcc-new-task" className="pl-1 text-xs font-bold text-cc-ink-2">
          Task
        </label>
        <input
          id="mcc-new-task"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          autoComplete="off"
          enterKeyHint="done"
          placeholder="Email Sandra | travel for conference"
          className="min-h-[52px] rounded-2xl border border-cc-ink/[0.14] bg-white px-4 text-base font-medium text-cc-ink outline-none"
        />
        <span className="pl-1 text-xs text-cc-ink-3">Text after | is saved as the task's notes.</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="pl-1 text-xs font-bold text-cc-ink-2">Priority</span>
        <div className="grid grid-cols-3 gap-1 rounded-2xl bg-cc-ink/[0.07] p-1">
          {PRIORITY_ORDER.map((p) => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              aria-pressed={priority === p}
              className={`flex min-h-11 flex-col items-center justify-center rounded-xl text-[13px] font-bold leading-tight transition active:scale-95 ${
                priority === p ? 'bg-[#1d1a16] text-white' : 'text-cc-ink-2'
              }`}
            >
              {PRIORITY_SHORT_LABELS[p]}
              <span className="text-[11px] font-semibold opacity-80">+{XP_BY_PRIORITY[p]} XP</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="pl-1 text-xs font-bold text-cc-ink-2">List</span>
        <div className="grid grid-cols-2 gap-1 rounded-full bg-cc-ink/[0.07] p-1">
          {LIST_ORDER.map((l) => (
            <button
              key={l}
              onClick={() => setList(l)}
              aria-pressed={list === l}
              className={`min-h-10 rounded-full text-sm font-semibold transition active:scale-95 ${l === list ? 'bg-[#1d1a16] text-white' : 'text-cc-ink-2'}`}
            >
              {LIST_META[l].label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="pl-1 text-xs font-bold text-cc-ink-2">Due</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {([
            { label: 'Today', value: today },
            { label: 'Tomorrow', value: tomorrow },
            { label: 'No date', value: null },
          ] as const).map((opt) => {
            const pressed = dueDate === opt.value;
            return (
              <button
                key={opt.label}
                onClick={() => setDueDate(opt.value)}
                aria-pressed={pressed}
                className={`min-h-10 rounded-full border px-3.5 text-sm font-semibold transition active:scale-95 ${
                  pressed ? 'border-[#1d1a16] bg-[#1d1a16] text-white' : 'border-cc-ink/15 bg-white text-cc-ink-2'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
          <label
            className={`flex min-h-10 items-center gap-1.5 rounded-full border bg-white px-3 text-[13px] font-semibold text-cc-ink ${
              isCustomDate ? 'border-[#1d1a16]' : 'border-cc-ink/15'
            }`}
          >
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
              <rect x="3" y="5" width="18" height="16" rx="3" />
              <path d="M8 3v4M16 3v4M3 10h18" />
            </svg>
            <span className="sr-only">Pick a due date</span>
            <input
              type="date"
              value={isCustomDate ? dueDate : ''}
              onChange={handleCustomDate}
              onClick={openDatePicker}
              onFocus={openDatePicker}
              className="min-h-9 max-w-[112px] border-none bg-transparent text-[13px] font-semibold text-cc-ink outline-none"
            />
          </label>
        </div>
      </div>

      <button
        onClick={submit}
        disabled={!draft.trim()}
        className="min-h-[54px] rounded-2xl bg-[#1d1a16] text-base font-bold text-white transition active:scale-[0.97] disabled:opacity-40"
      >
        Add task
      </button>
    </MobileSheet>
  );
}
