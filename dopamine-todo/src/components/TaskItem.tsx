import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { ChangeEvent, KeyboardEvent } from 'react';
import type { Priority, Task } from '../types';
import { dueDatePillClasses } from '../lib/dueDate';
import { formatDueDate } from '../lib/formatDueDate';
import { ownerSwatchClasses, ownerAvatarClasses } from '../lib/ownerColor';
import { PRIORITY_STYLES } from '../lib/priority';
import { OWNER_COL, DUE_COL } from '../lib/taskColumns';
import { PriorityPicker } from './PriorityPicker';

interface TaskItemProps {
  task: Task;
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

  const ownerPill = (widthClass: string) =>
    editingOwner ? (
      <input
        ref={ownerInputRef}
        value={ownerDraft}
        onChange={(e) => setOwnerDraft(e.target.value)}
        onBlur={commitOwner}
        onKeyDown={handleOwnerKeyDown}
        maxLength={40}
        className={`${widthClass} rounded-lg bg-white/5 px-2 py-1 text-xs text-white outline-none ring-1 ring-purple-400/50`}
      />
    ) : (
      <button
        onClick={startEditingOwner}
        className={`flex ${widthClass} items-center gap-1.5 truncate rounded-lg px-2 py-1 text-left text-xs font-medium transition hover:bg-white/10 ${
          owner ? ownerSwatch : 'text-white/25'
        }`}
      >
        {owner ? (
          <>
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${ownerAvatar}`}
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

  const dueDatePill = (widthClass: string) => (
    <div className={`relative ${widthClass} shrink-0`}>
      <div
        className={`pointer-events-none flex items-center gap-1.5 truncate rounded-lg px-2 py-1 text-xs font-medium ${duePillClasses}`}
      >
        <CalendarIcon />
        <span className="truncate">{dueDate ? formatDueDate(dueDate) : 'Due date'}</span>
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
      className="glass glass-hover group relative flex flex-col gap-2 rounded-xl py-3 pl-4 pr-3 sm:pr-4"
    >
      <span className={`absolute inset-y-2 left-0 w-1 rounded-full ${PRIORITY_STYLES[task.priority]}`} />

      <div className="flex items-center gap-3">
        <button
          onClick={() => onToggle(task.id)}
          aria-label={task.done ? 'Mark as not done' : 'Mark as done'}
          className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
            task.done
              ? 'border-transparent bg-gradient-to-br from-purple-500 to-pink-500'
              : 'border-white/25 hover:border-purple-400'
          }`}
        >
          {task.done && (
            <span className="animate-ring-burst pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
          )}
          {task.done && (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </motion.svg>
          )}
        </button>

        <PriorityPicker priority={task.priority} onChange={(p) => onPriorityChange(task.id, p)} />

        {editingText ? (
          <input
            ref={textInputRef}
            value={textDraft}
            onChange={(e) => setTextDraft(e.target.value)}
            onBlur={commitText}
            onKeyDown={handleTextKeyDown}
            maxLength={200}
            className="min-w-0 flex-1 rounded-lg bg-white/5 px-2 py-1 text-[15px] text-white outline-none ring-1 ring-purple-400/50"
          />
        ) : (
          <span
            onClick={startEditingText}
            title="Click to rename"
            className={`flex-1 min-w-0 cursor-text truncate rounded-lg px-2 py-1 text-left text-[15px] transition-colors hover:bg-white/5 ${
              task.done ? 'text-white/35 line-through' : 'text-white/90'
            }`}
          >
            {task.text}
          </span>
        )}

        <div className="hidden shrink-0 sm:block">{ownerPill(OWNER_COL)}</div>
        <div className="hidden sm:block">{dueDatePill(DUE_COL)}</div>

        <button
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
          className="shrink-0 rounded-lg p-1.5 text-white/25 opacity-0 transition hover:bg-white/10 hover:text-red-400 group-hover:opacity-100 focus-visible:opacity-100"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-2 pl-9 sm:hidden">
        {ownerPill('flex-1')}
        {dueDatePill('w-[132px]')}
      </div>
    </motion.li>
  );
}
