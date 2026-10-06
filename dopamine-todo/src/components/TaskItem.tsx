import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { ChangeEvent, KeyboardEvent } from 'react';
import type { Priority, Task } from '../types';
import { dueDatePillClasses } from '../lib/dueDate';
import { formatDueDate } from '../lib/formatDueDate';
import { ordinalWord } from '../lib/ordinal';
import { ownerSwatchClasses, ownerAvatarClasses } from '../lib/ownerColor';
import { PriorityPicker } from './PriorityPicker';

interface TaskItemProps {
  task: Task;
  index: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onOwnerChange: (id: string, owner: string) => void;
  onDueDateChange: (id: string, dueDate: string | null) => void;
  onPriorityChange: (id: string, priority: Priority) => void;
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="5" width="18" height="16" rx="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 3v4M16 3v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TaskItem({
  task,
  index,
  onToggle,
  onDelete,
  onEdit,
  onOwnerChange,
  onDueDateChange,
  onPriorityChange,
}: TaskItemProps) {
  const owner = task.owner ?? '';
  const dueDate = task.dueDate ?? null;
  const duePillClasses = dueDatePillClasses(dueDate, task.done);
  const ownerSwatch = ownerSwatchClasses(owner);
  const ownerAvatar = ownerAvatarClasses(owner);
  const initial = owner.trim().charAt(0).toUpperCase();

  const [editingText, setEditingText] = useState(false);
  const [textDraft, setTextDraft] = useState(task.text);
  const textInputRef = useRef<HTMLInputElement>(null);

  const [editingOwner, setEditingOwner] = useState(false);
  const [ownerDraft, setOwnerDraft] = useState(owner);
  const ownerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingText) {
      textInputRef.current?.focus();
      textInputRef.current?.select();
    }
  }, [editingText]);

  useEffect(() => {
    if (editingOwner) {
      ownerInputRef.current?.focus();
      ownerInputRef.current?.select();
    }
  }, [editingOwner]);

  const startEditingText = () => {
    setTextDraft(task.text);
    setEditingText(true);
  };

  const commitText = () => {
    const trimmed = textDraft.trim();
    if (trimmed && trimmed !== task.text) {
      onEdit(task.id, trimmed);
    }
    setEditingText(false);
  };

  const cancelText = () => {
    setTextDraft(task.text);
    setEditingText(false);
  };

  const handleTextKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitText();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelText();
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

  const cancelOwner = () => {
    setOwnerDraft(owner);
    setEditingOwner(false);
  };

  const handleOwnerKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitOwner();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelOwner();
    }
  };

  const handleDueDate = (e: ChangeEvent<HTMLInputElement>) => {
    onDueDateChange(task.id, e.target.value || null);
  };

  const ownerPill = editingOwner ? (
    <input
      ref={ownerInputRef}
      value={ownerDraft}
      onChange={(e) => setOwnerDraft(e.target.value)}
      onBlur={commitOwner}
      onKeyDown={handleOwnerKeyDown}
      maxLength={40}
      className="min-w-0 flex-1 rounded border border-[#c6ff4a]/50 bg-white/5 px-2 py-1 text-xs text-white outline-none"
    />
  ) : (
    <button
      onClick={startEditingOwner}
      className={`flex min-w-0 flex-1 items-center gap-1.5 truncate rounded border px-2 py-1 text-left text-[11px] font-medium uppercase tracking-wide transition hover:border-white/30 ${
        owner ? `border ${ownerSwatch}` : 'border-white/10 text-white/25'
      }`}
    >
      {owner ? (
        <>
          <span
            className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold normal-case ${ownerAvatar}`}
          >
            {initial}
          </span>
          <span className="truncate">{owner}</span>
        </>
      ) : (
        <span className="truncate">+ Owner</span>
      )}
    </button>
  );

  const dueDatePill = (
    <div className="relative shrink-0">
      <div
        className={`pointer-events-none flex items-center gap-1.5 truncate rounded border px-2 py-1 text-[11px] font-medium uppercase tracking-wide ${duePillClasses}`}
      >
        <CalendarIcon />
        <span className="truncate">{dueDate ? formatDueDate(dueDate) : 'No due'}</span>
      </div>
      <input
        type="date"
        value={dueDate ?? ''}
        onChange={handleDueDate}
        aria-label="Due date"
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </div>
  );

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      className="panel panel-hover group relative flex flex-col gap-3 rounded-lg p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <button
          onClick={() => onToggle(task.id)}
          aria-label={task.done ? 'Mark as not done' : 'Mark as done'}
          className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border-2 font-display text-lg font-bold transition-all ${
            task.done
              ? 'border-[#c6ff4a] bg-[#c6ff4a] text-[#0a0a0a]'
              : 'border-white/15 text-white/30 hover:border-white/35 hover:text-white/60'
          }`}
        >
          {task.done && (
            <span className="animate-ring-burst pointer-events-none absolute inset-0 rounded-lg bg-[#c6ff4a]" />
          )}
          {task.done ? (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </motion.svg>
          ) : (
            String(index).padStart(2, '0')
          )}
        </button>

        <div className="flex items-center gap-1.5">
          <PriorityPicker priority={task.priority} onChange={(p) => onPriorityChange(task.id, p)} />
          <button
            onClick={() => onDelete(task.id)}
            aria-label="Delete task"
            className="shrink-0 rounded p-1.5 text-white/25 opacity-0 transition hover:border-red-400/40 hover:text-red-400 group-hover:opacity-100 focus-visible:opacity-100"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-medium uppercase tracking-widest text-white/25">{ordinalWord(index)}</p>
        {editingText ? (
          <input
            ref={textInputRef}
            value={textDraft}
            onChange={(e) => setTextDraft(e.target.value)}
            onBlur={commitText}
            onKeyDown={handleTextKeyDown}
            maxLength={200}
            className="mt-1 w-full min-w-0 rounded border border-[#c6ff4a]/50 bg-white/5 px-2 py-1 text-[15px] font-semibold text-white outline-none"
          />
        ) : (
          <p
            onClick={startEditingText}
            title="Click to rename"
            className={`mt-1 cursor-text rounded px-0.5 text-[15px] font-semibold leading-snug transition-colors hover:bg-white/5 ${
              task.done ? 'text-white/30 line-through' : 'text-white/90'
            }`}
          >
            {task.text}
          </p>
        )}
      </div>

      <div className="mt-auto flex items-center gap-2 pt-1 text-xs">
        {ownerPill}
        {dueDatePill}
      </div>
    </motion.li>
  );
}
