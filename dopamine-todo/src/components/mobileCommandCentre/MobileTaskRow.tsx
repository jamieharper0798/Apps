import { useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import type { Task } from '../../types';
import { formatCCDue, isOverdue } from '../../lib/commandCentre';
import { PRIORITY_CODE } from '../../lib/priority';
import type { AccentTokens } from '../../lib/accent';

const SWIPE_THRESHOLD = 90;
const TAP_SLOP = 8;

interface MobileTaskRowProps {
  task: Task;
  today: string;
  accent: AccentTokens;
  dragOffsetY: number;
  isDragging: boolean;
  registerRef: (id: string, el: HTMLDivElement | null) => void;
  onToggle: (id: string) => void;
  onSnooze: (id: string) => void;
  onOpen: (id: string) => void;
  onGripPointerDown: (id: string, e: ReactPointerEvent<HTMLButtonElement>) => void;
  onGripPointerMove: (id: string, e: ReactPointerEvent<HTMLButtonElement>) => void;
  onGripPointerUp: (id: string, e: ReactPointerEvent<HTMLButtonElement>) => void;
  onGripKeyDown: (id: string, e: KeyboardEvent<HTMLButtonElement>) => void;
}

const PRIORITY_STRIPE: Record<Task['priority'], string> = {
  high: 'var(--cc-teal-solid)',
  medium: '#1d1a16',
  low: 'rgba(29,26,22,.25)',
};

export function MobileTaskRow({
  task,
  today,
  accent,
  dragOffsetY,
  isDragging,
  registerRef,
  onToggle,
  onSnooze,
  onOpen,
  onGripPointerDown,
  onGripPointerMove,
  onGripPointerUp,
  onGripKeyDown,
}: MobileTaskRowProps) {
  const [swipeX, setSwipeX] = useState(0);
  const swiping = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const moved = useRef(false);

  const late = isOverdue(task, today);
  const metaBits: string[] = [PRIORITY_CODE[task.priority]];
  if (task.notes) metaBits.push(task.notes.split('\n')[0]);
  if (task.repeat !== 'none') metaBits.push(`↻ ${task.repeat === 'daily' ? 'Daily' : 'Weekly'}`);
  if (task.owner) metaBits.push(`@${task.owner}`);

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    swiping.current = true;
    moved.current = false;
    startX.current = e.clientX;
    startY.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!swiping.current) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
    if (Math.abs(dx) > TAP_SLOP || Math.abs(dy) > TAP_SLOP) moved.current = true;
    // Once it reads as more vertical than horizontal, let the page scroll instead of swiping.
    if (Math.abs(dy) > Math.abs(dx) + 6) return;
    setSwipeX(dx);
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!swiping.current) return;
    swiping.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (!moved.current) {
      onOpen(task.id);
    } else if (swipeX > SWIPE_THRESHOLD) {
      onToggle(task.id);
    } else if (swipeX < -SWIPE_THRESHOLD) {
      onSnooze(task.id);
    }
    setSwipeX(0);
  };

  const showGreen = swipeX > 12;
  const showAmber = swipeX < -12;

  return (
    <div
      ref={(el) => registerRef(task.id, el)}
      className="relative overflow-hidden rounded-2xl"
      style={{ transform: `translateY(${dragOffsetY}px)`, transition: isDragging ? 'none' : 'transform .18s ease', zIndex: isDragging ? 10 : 'auto' }}
    >
      {(showGreen || showAmber) && (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center rounded-2xl px-5 text-[13px] font-bold text-white"
          style={{
            background: showGreen
              ? task.done
                ? 'linear-gradient(90deg, #1b5e48, #23775c)'
                : 'linear-gradient(90deg, #23775c, #1b5e48)'
              : 'linear-gradient(90deg, #6f540c, #8a6a12)',
            justifyContent: showGreen ? 'flex-start' : 'flex-end',
          }}
        >
          {showGreen ? (task.done ? 'Undo' : 'Done') : 'Snooze'}
        </div>
      )}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: 'pan-y', transform: `translateX(${swipeX}px)`, transition: swiping.current ? 'none' : 'transform .2s cubic-bezier(.2,.9,.25,1)' }}
        className={`grid grid-cols-[4px_28px_minmax(0,1fr)_auto_auto] items-center gap-3 rounded-2xl border px-3 py-3 ${
          late ? 'border-[rgba(253,227,221,.9)] bg-[rgba(253,227,221,.85)]' : 'border-white/60 bg-white/70'
        }`}
      >
        <span aria-hidden="true" className="h-9 self-center rounded-full" style={{ background: PRIORITY_STRIPE[task.priority] }} />
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onToggle(task.id)}
          aria-label={task.done ? 'Mark as not done' : 'Mark as done'}
          className="flex h-7 w-7 items-center justify-center rounded-full border-[1.5px] text-xs font-extrabold text-white transition active:scale-[0.88]"
          style={{
            background: task.done ? accent.solid : 'rgba(255,255,255,.85)',
            borderColor: task.done ? accent.solid : 'rgba(29,26,22,.25)',
          }}
        >
          {task.done && '✓'}
        </button>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className={`truncate text-[15px] font-semibold text-cc-ink ${task.done ? 'line-through opacity-50' : ''}`}>{task.text}</span>
          <span className={`truncate text-[11px] text-cc-ink-4 ${task.done ? 'opacity-50' : ''}`}>{metaBits.join(' · ')}</span>
        </div>
        <span
          className="whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-semibold"
          style={{ background: late ? '#fff' : 'rgba(255,255,255,.9)', color: late ? 'var(--cc-red-text)' : 'var(--cc-ink)' }}
        >
          {formatCCDue(task.dueDate, today)}
        </span>
        <button
          onPointerDown={(e) => {
            e.stopPropagation();
            onGripPointerDown(task.id, e);
          }}
          onPointerMove={(e) => onGripPointerMove(task.id, e)}
          onPointerUp={(e) => onGripPointerUp(task.id, e)}
          onPointerCancel={(e) => onGripPointerUp(task.id, e)}
          onKeyDown={(e) => onGripKeyDown(task.id, e)}
          aria-label={`Reorder ${task.text}`}
          tabIndex={0}
          style={{ touchAction: 'none' }}
          className="flex h-7 w-5 items-center justify-center text-cc-ink-4 transition active:scale-90 focus:outline-2 focus:outline-offset-1 focus:outline-cc-teal"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <circle cx="9" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" />
            <circle cx="15" cy="6" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="15" cy="18" r="1.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
