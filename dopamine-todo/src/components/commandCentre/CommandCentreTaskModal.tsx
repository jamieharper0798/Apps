import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Priority, Repeat, Task } from '../../types';
import { LIST_META } from '../../lib/lists';
import { PRIORITY_ORDER, PRIORITY_CODE } from '../../lib/priority';
import { REPEAT_ORDER, REPEAT_CODE } from '../../lib/repeat';
import { dayKey } from '../../lib/gamify';
import { formatCCDue, isOverdue } from '../../lib/commandCentre';

interface CommandCentreTaskModalProps {
  task: Task | null;
  onClose: () => void;
  onEditTitle: (id: string, text: string) => void;
  onEditNotes: (id: string, notes: string) => void;
  onRepeatChange: (id: string, repeat: Repeat) => void;
  onPriorityChange: (id: string, priority: Priority) => void;
  onOwnerChange: (id: string, owner: string) => void;
  onDueDateChange: (id: string, dueDate: string | null) => void;
  onDelete: (id: string) => void;
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="5" width="18" height="16" rx="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 3v4M16 3v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Same editing surface as the classic view's TaskDetailModal, restyled to Command Centre's
    warm-glass/teal look. Kept as a separate component rather than a themed variant of the
    shared modal — CC's --cc-* tokens are scoped to .command-centre, so this carries that class
    on its own root to work wherever in the tree it's rendered. */
export function CommandCentreTaskModal({
  task,
  onClose,
  onEditTitle,
  onEditNotes,
  onRepeatChange,
  onPriorityChange,
  onOwnerChange,
  onDueDateChange,
  onDelete,
}: CommandCentreTaskModalProps) {
  const [titleDraft, setTitleDraft] = useState('');
  const [notesDraft, setNotesDraft] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  const [editingOwner, setEditingOwner] = useState(false);
  const [ownerDraft, setOwnerDraft] = useState('');
  const ownerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!task) return;
    setTitleDraft(task.text);
    setNotesDraft(task.notes ?? '');
    setEditingOwner(false);
  }, [task]);

  useEffect(() => {
    if (editingOwner) {
      ownerInputRef.current?.focus();
      ownerInputRef.current?.select();
    }
  }, [editingOwner]);

  if (!task) return null;

  const today = dayKey();
  const owner = task.owner ?? '';
  const initial = owner.trim().charAt(0).toUpperCase();
  const late = isOverdue(task, today);

  const commitTitle = () => {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== task.text) {
      onEditTitle(task.id, trimmed);
    } else {
      setTitleDraft(task.text);
    }
  };

  const commitNotes = () => {
    if (notesDraft !== (task.notes ?? '')) {
      onEditNotes(task.id, notesDraft);
    }
  };

  const handleClose = () => {
    commitTitle();
    commitNotes();
    onClose();
  };

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitTitle();
      titleRef.current?.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setTitleDraft(task.text);
      titleRef.current?.blur();
    }
  };

  const startEditingOwner = () => {
    setOwnerDraft(owner);
    setEditingOwner(true);
  };

  const commitOwner = () => {
    onOwnerChange(task.id, ownerDraft.trim().slice(0, 40));
    setEditingOwner(false);
  };

  const handleOwnerKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitOwner();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOwnerDraft(owner);
      setEditingOwner(false);
    }
  };

  const handleDueDate = (e: ChangeEvent<HTMLInputElement>) => {
    onDueDateChange(task.id, e.target.value || null);
  };

  const openDatePicker = (e: { currentTarget: HTMLInputElement }) => {
    try {
      e.currentTarget.showPicker?.();
    } catch {
      // showPicker isn't available/allowed here — the input is still focused and usable.
    }
  };

  const handleDelete = () => {
    onDelete(task.id);
    onClose();
  };

  return (
    <AnimatePresence>
      {task && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="command-centre fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-cc backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-[28px] bg-[#faf6ef] p-6 shadow-[0_30px_80px_rgba(30,20,10,0.35)]"
          >
            <div className="flex items-start justify-between gap-3">
              <input
                ref={titleRef}
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={handleTitleKeyDown}
                maxLength={200}
                className="-mx-2 -my-1 min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1 text-xl font-bold tracking-tight text-cc-ink outline-none transition focus:bg-cc-ink/5"
              />
              <button
                onClick={handleClose}
                aria-label="Close"
                className="shrink-0 rounded-lg p-1.5 text-cc-ink-4 transition active:scale-90 hover:bg-cc-ink/10 hover:text-cc-ink"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="flex shrink-0 gap-0.5 rounded-lg bg-cc-ink/[0.06] p-0.5">
                {PRIORITY_ORDER.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onPriorityChange(task.id, p)}
                    className={`rounded-md px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide transition active:scale-90 ${
                      task.priority === p ? 'bg-[#1d1a16] text-white' : 'text-cc-ink-3'
                    }`}
                  >
                    {PRIORITY_CODE[p]}
                  </button>
                ))}
              </div>
              <span className="rounded-md border border-cc-ink/10 px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-cc-ink-3">
                {LIST_META[task.list].label}
              </span>

              {editingOwner ? (
                <input
                  ref={ownerInputRef}
                  value={ownerDraft}
                  onChange={(e) => setOwnerDraft(e.target.value)}
                  onBlur={commitOwner}
                  onKeyDown={handleOwnerKeyDown}
                  maxLength={40}
                  placeholder="Owner"
                  className="w-28 rounded-md border border-cc-teal/50 bg-cc-ink/5 px-2 py-1 text-[11px] text-cc-ink outline-none"
                />
              ) : (
                <button
                  onClick={startEditingOwner}
                  className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition active:scale-[0.97] hover:border-cc-ink/30 ${
                    owner ? 'border-cc-teal/40 text-cc-teal' : 'border-cc-ink/10 text-cc-ink-4'
                  }`}
                >
                  {owner ? (
                    <>
                      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-cc-teal/20 text-[8px] font-bold normal-case text-cc-teal">
                        {initial}
                      </span>
                      {owner}
                    </>
                  ) : (
                    '+ Owner'
                  )}
                </button>
              )}

              <div className="relative">
                <div
                  className="pointer-events-none flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium uppercase tracking-wide transition active:scale-[0.97]"
                  style={{
                    borderColor: late ? 'var(--cc-red-text)' : 'var(--cc-ink-4)',
                    color: late ? 'var(--cc-red-text)' : 'var(--cc-ink-3)',
                    opacity: late ? 1 : 0.7,
                  }}
                >
                  <CalendarIcon />
                  {formatCCDue(task.dueDate, today)}
                </div>
                <input
                  type="date"
                  value={task.dueDate ?? ''}
                  onChange={handleDueDate}
                  onClick={openDatePicker}
                  onFocus={openDatePicker}
                  aria-label="Due date"
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </div>
            </div>

            <label className="mt-5 block text-xs font-medium uppercase tracking-wide text-cc-ink-4">Repeat</label>
            <div className="mt-1.5 flex gap-1 rounded-lg border border-cc-ink/10 p-1">
              {REPEAT_ORDER.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onRepeatChange(task.id, r)}
                  className={`flex-1 rounded-md px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition active:scale-95 ${
                    task.repeat === r ? 'bg-[#1d1a16] text-white' : 'text-cc-ink-3 hover:text-cc-ink'
                  }`}
                >
                  {REPEAT_CODE[r]}
                </button>
              ))}
            </div>

            <label className="mt-5 block text-xs font-medium uppercase tracking-wide text-cc-ink-4">Notes</label>
            <textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              onBlur={commitNotes}
              maxLength={4000}
              rows={8}
              placeholder="Add notes, links, or context for this task…"
              className="mt-1.5 w-full resize-y rounded-lg border border-cc-ink/10 bg-white px-3 py-2.5 text-sm leading-relaxed text-cc-ink placeholder-cc-ink-4 outline-none transition focus:border-cc-teal/50 focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--cc-teal-solid)_12%,transparent)]"
            />

            <div className="mt-5 flex items-center justify-between">
              <button
                onClick={handleDelete}
                className="rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wide text-cc-ink-4 transition active:scale-95 hover:text-cc-red"
              >
                Delete task
              </button>
              <button
                onClick={handleClose}
                className="rounded-xl bg-[#1d1a16] px-5 py-2.5 text-[13px] font-semibold text-white transition active:scale-[0.98]"
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
