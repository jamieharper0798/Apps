import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import type { ListId, Priority, Repeat, Task } from '../../types';
import { LIST_META } from '../../lib/lists';
import { PRIORITY_ORDER, PRIORITY_SHORT_LABELS } from '../../lib/priority';
import { REPEAT_ORDER } from '../../lib/repeat';
import { XP_BY_PRIORITY } from '../../lib/gamify';
import { formatCCDue, isOverdue } from '../../lib/commandCentre';
import { tomorrowOf } from '../../lib/mobileCommandCentre';
import { MobileSheet } from './MobileSheet';

const REPEAT_LABEL: Record<Repeat, string> = { none: 'Off', daily: 'Daily', weekly: 'Weekly' };

interface MobileTaskDetailSheetProps {
  task: Task | null;
  today: string;
  onClose: () => void;
  onEditTitle: (id: string, text: string) => void;
  onEditNotes: (id: string, notes: string) => void;
  onPriorityChange: (id: string, priority: Priority) => void;
  onOwnerChange: (id: string, owner: string) => void;
  onDueDateChange: (id: string, dueDate: string | null) => void;
  onRepeatChange: (id: string, repeat: Repeat) => void;
  onListChange: (id: string, list: ListId) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function MobileTaskDetailSheet({
  task,
  today,
  onClose,
  onEditTitle,
  onEditNotes,
  onPriorityChange,
  onOwnerChange,
  onDueDateChange,
  onRepeatChange,
  onListChange,
  onToggle,
  onDelete,
}: MobileTaskDetailSheetProps) {
  const [titleDraft, setTitleDraft] = useState('');
  const [notesDraft, setNotesDraft] = useState('');
  const [ownerDraft, setOwnerDraft] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!task) return;
    setTitleDraft(task.text);
    setNotesDraft(task.notes);
    setOwnerDraft(task.owner);
  }, [task]);

  if (!task) return null;
  const tomorrow = tomorrowOf(today);
  const late = isOverdue(task, today);

  const commitTitle = () => {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== task.text) onEditTitle(task.id, trimmed);
    else setTitleDraft(task.text);
  };

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitTitle();
      titleRef.current?.blur();
    } else if (e.key === 'Escape') {
      setTitleDraft(task.text);
      titleRef.current?.blur();
    }
  };

  const commitNotes = () => {
    if (notesDraft !== task.notes) onEditNotes(task.id, notesDraft);
  };

  const commitOwner = () => {
    onOwnerChange(task.id, ownerDraft.trim().slice(0, 40));
  };

  const handleCustomDate = (e: ChangeEvent<HTMLInputElement>) => {
    onDueDateChange(task.id, e.target.value || null);
  };

  const openDatePicker = (e: { currentTarget: HTMLInputElement }) => {
    try {
      e.currentTarget.showPicker?.();
    } catch {
      // showPicker isn't available/allowed here — the input is still focused and usable.
    }
  };

  const isCustomDate = task.dueDate !== null && task.dueDate !== today && task.dueDate !== tomorrow;

  const tag = task.done ? 'Done' : late ? 'Overdue' : task.dueDate ? `Due ${formatCCDue(task.dueDate, today).toLowerCase()}` : 'No due date';
  const tagStyle = task.done
    ? { background: 'var(--cc-green-bg)', color: 'var(--cc-green-text)' }
    : late
      ? { background: 'var(--cc-red-bg)', color: 'var(--cc-red-text)' }
      : { background: 'rgba(29,26,22,.07)', color: 'var(--cc-ink)' };

  const handleClose = () => {
    commitTitle();
    commitNotes();
    commitOwner();
    onClose();
  };

  return (
    <MobileSheet open onClose={handleClose} ariaLabel={`Task: ${task.text}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={tagStyle}>
            {tag}
          </span>
          {task.repeat !== 'none' && (
            <span className="rounded-full bg-cc-ink/[0.07] px-2.5 py-1 text-xs font-bold text-cc-ink">↻ Repeats {REPEAT_LABEL[task.repeat].toLowerCase()}</span>
          )}
        </div>
        <button
          onClick={handleClose}
          aria-label="Close"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cc-ink/[0.08] text-cc-ink transition active:scale-90"
        >
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      <label htmlFor="mcc-dt-title" className="sr-only">
        Task title
      </label>
      <input
        id="mcc-dt-title"
        ref={titleRef}
        value={titleDraft}
        onChange={(e) => setTitleDraft(e.target.value)}
        onBlur={commitTitle}
        onKeyDown={handleTitleKeyDown}
        maxLength={200}
        className="-mx-3 min-h-12 rounded-2xl bg-transparent px-3 text-[22px] font-bold tracking-tight text-cc-ink outline-none"
      />

      <div className="flex flex-col gap-1.5">
        <span className="pl-1 text-xs font-bold text-cc-ink-2">Priority</span>
        <div className="grid grid-cols-3 gap-1 rounded-2xl bg-cc-ink/[0.07] p-1">
          {PRIORITY_ORDER.map((p) => (
            <button
              key={p}
              onClick={() => onPriorityChange(task.id, p)}
              aria-pressed={task.priority === p}
              className={`flex min-h-11 flex-col items-center justify-center rounded-xl text-[13px] font-bold leading-tight transition active:scale-95 ${
                task.priority === p ? 'bg-[#1d1a16] text-white' : 'text-cc-ink-2'
              }`}
            >
              {PRIORITY_SHORT_LABELS[p]}
              <span className="text-[11px] font-semibold opacity-80">+{XP_BY_PRIORITY[p]} XP</span>
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
            const pressed = task.dueDate === opt.value;
            return (
              <button
                key={opt.label}
                onClick={() => onDueDateChange(task.id, opt.value)}
                aria-pressed={pressed}
                className={`min-h-10 rounded-full border px-3.5 text-sm font-semibold transition active:scale-95 ${
                  pressed ? 'border-[#1d1a16] bg-[#1d1a16] text-white' : 'border-cc-ink/15 bg-white text-cc-ink-2'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
          <label className={`flex min-h-10 items-center gap-1.5 rounded-full border bg-white px-3 text-[13px] font-semibold text-cc-ink ${isCustomDate ? 'border-[#1d1a16]' : 'border-cc-ink/15'}`}>
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
              <rect x="3" y="5" width="18" height="16" rx="3" />
              <path d="M8 3v4M16 3v4M3 10h18" />
            </svg>
            <span className="sr-only">Pick a due date</span>
            <input
              type="date"
              value={task.dueDate ?? ''}
              onChange={handleCustomDate}
              onClick={openDatePicker}
              onFocus={openDatePicker}
              className="min-h-9 max-w-[112px] border-none bg-transparent text-[13px] font-semibold text-cc-ink outline-none"
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="flex flex-col gap-1.5">
          <span className="pl-1 text-xs font-bold text-cc-ink-2">List</span>
          <div className="grid grid-cols-2 gap-1 rounded-full bg-cc-ink/[0.07] p-1">
            {(['personal', 'work'] as ListId[]).map((l) => (
              <button
                key={l}
                onClick={() => onListChange(task.id, l)}
                aria-pressed={task.list === l}
                className={`min-h-10 rounded-full text-[13px] font-semibold transition active:scale-95 ${task.list === l ? 'bg-[#1d1a16] text-white' : 'text-cc-ink-2'}`}
              >
                {LIST_META[l].label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="mcc-dt-owner" className="pl-1 text-xs font-bold text-cc-ink-2">
            Owner
          </label>
          <input
            id="mcc-dt-owner"
            value={ownerDraft}
            onChange={(e) => setOwnerDraft(e.target.value)}
            onBlur={commitOwner}
            placeholder="Owner"
            autoComplete="off"
            className="min-h-[46px] min-w-0 rounded-full border border-cc-ink/[0.14] bg-white px-3.5 text-base text-cc-ink outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="pl-1 text-xs font-bold text-cc-ink-2">Repeat</span>
        <div className="grid grid-cols-3 gap-1 rounded-full bg-cc-ink/[0.07] p-1">
          {REPEAT_ORDER.map((r) => (
            <button
              key={r}
              onClick={() => onRepeatChange(task.id, r)}
              aria-pressed={task.repeat === r}
              className={`min-h-10 rounded-full text-sm font-semibold transition active:scale-95 ${task.repeat === r ? 'bg-[#1d1a16] text-white' : 'text-cc-ink-2'}`}
            >
              {REPEAT_LABEL[r]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="mcc-dt-notes" className="pl-1 text-xs font-bold text-cc-ink-2">
          Notes
        </label>
        <textarea
          id="mcc-dt-notes"
          value={notesDraft}
          onChange={(e) => setNotesDraft(e.target.value)}
          onBlur={commitNotes}
          maxLength={4000}
          rows={4}
          placeholder="Add notes, links, or context for this task…"
          className="resize-none rounded-2xl border border-cc-ink/[0.14] bg-white px-3.5 py-3 text-base leading-relaxed text-cc-ink outline-none"
        />
      </div>

      <button
        onClick={() => onToggle(task.id)}
        className="min-h-[54px] rounded-2xl text-base font-bold text-white transition active:scale-[0.97]"
        style={{ background: task.done ? 'rgba(29,26,22,.85)' : 'var(--cc-teal-solid)' }}
      >
        {task.done ? 'Mark as not done' : `Mark done · +${XP_BY_PRIORITY[task.priority]} XP`}
      </button>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onDueDateChange(task.id, tomorrow)}
          className="min-h-12 rounded-2xl bg-cc-ink/[0.07] text-sm font-semibold text-cc-ink transition active:scale-[0.97]"
        >
          Snooze to tomorrow
        </button>
        <button
          onClick={() => {
            onDelete(task.id);
            onClose();
          }}
          className="min-h-12 rounded-2xl bg-[rgba(154,47,29,.09)] text-sm font-semibold text-[#9a2f1d] transition active:scale-[0.97]"
        >
          Delete
        </button>
      </div>
    </MobileSheet>
  );
}
