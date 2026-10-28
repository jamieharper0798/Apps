import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Repeat, Task } from '../types';
import { dueDatePillClasses } from '../lib/dueDate';
import { formatDueDate } from '../lib/formatDueDate';
import { ownerSwatchClasses, ownerAvatarClasses } from '../lib/ownerColor';
import { PRIORITY_BADGE_CLASSES, PRIORITY_CODE } from '../lib/priority';
import { LIST_META } from '../lib/lists';
import { REPEAT_ORDER, REPEAT_CODE } from '../lib/repeat';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onEditTitle: (id: string, text: string) => void;
  onEditNotes: (id: string, notes: string) => void;
  onRepeatChange: (id: string, repeat: Repeat) => void;
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="5" width="18" height="16" rx="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 3v4M16 3v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TaskDetailModal({ task, onClose, onEditTitle, onEditNotes, onRepeatChange }: TaskDetailModalProps) {
  const [titleDraft, setTitleDraft] = useState('');
  const [notesDraft, setNotesDraft] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!task) return;
    setTitleDraft(task.text);
    setNotesDraft(task.notes ?? '');
  }, [task]);

  if (!task) return null;

  const owner = task.owner ?? '';
  const ownerSwatch = ownerSwatchClasses(owner);
  const ownerAvatar = ownerAvatarClasses(owner);
  const initial = owner.trim().charAt(0).toUpperCase();
  const duePillClasses = dueDatePillClasses(task.dueDate, task.done);

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

  return (
    <AnimatePresence>
      {task && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="panel w-full max-w-lg rounded-2xl p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <input
                ref={titleRef}
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={handleTitleKeyDown}
                maxLength={200}
                className="-mx-2 -my-1 min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1 text-xl font-bold text-ink outline-none transition focus:bg-ink/5"
              />
              <button
                onClick={handleClose}
                aria-label="Close"
                className="shrink-0 rounded-lg p-1.5 text-ink/40 transition hover:bg-ink/10 hover:text-ink"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className={`rounded-md border px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider ${PRIORITY_BADGE_CLASSES[task.priority]}`}>
                {PRIORITY_CODE[task.priority]}
              </span>
              <span className="rounded-md border border-ink/10 px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-ink/40">
                {LIST_META[task.list].label}
              </span>
              {owner && (
                <span className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium ${ownerSwatch}`}>
                  <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold ${ownerAvatar}`}>
                    {initial}
                  </span>
                  {owner}
                </span>
              )}
              {task.dueDate && (
                <span className={`flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[11px] font-medium uppercase tracking-wide ${duePillClasses}`}>
                  <CalendarIcon />
                  {formatDueDate(task.dueDate)}
                </span>
              )}
            </div>

            <label className="mt-5 block text-xs font-medium uppercase tracking-wide text-ink/40">Repeat</label>
            <div className="mt-1.5 flex gap-1 rounded-lg border border-ink/10 p-1">
              {REPEAT_ORDER.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onRepeatChange(task.id, r)}
                  className={`flex-1 rounded-md px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition active:scale-95 ${
                    task.repeat === r ? 'bg-ink/10 text-ink' : 'text-ink/35 hover:text-ink/70'
                  }`}
                >
                  {REPEAT_CODE[r]}
                </button>
              ))}
            </div>

            <label className="mt-5 block text-xs font-medium uppercase tracking-wide text-ink/40">Notes</label>
            <textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              onBlur={commitNotes}
              maxLength={4000}
              rows={8}
              placeholder="Add notes, links, or context for this task…"
              className="mt-1.5 w-full resize-y rounded-lg border border-ink/10 bg-ink/5 px-3 py-2.5 text-sm leading-relaxed text-ink placeholder-ink/30 outline-none transition focus:border-accent/50 focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_10%,transparent)]"
            />

            <div className="mt-5 flex justify-end">
              <button
                onClick={handleClose}
                className="rounded-lg border border-accent/60 px-4 py-2 text-sm font-bold uppercase tracking-wide text-accent transition active:scale-[0.98] hover:bg-accent/10 hover:shadow-[0_0_16px_-6px_var(--accent)]"
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
