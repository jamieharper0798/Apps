import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Priority } from '../types';
import { PRIORITY_ORDER, PRIORITY_CODE, PRIORITY_BADGE_CLASSES } from '../lib/priority';

interface PriorityPickerProps {
  priority: Priority;
  onChange: (priority: Priority) => void;
}

export function PriorityPicker({ priority, onChange }: PriorityPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handlePick = (next: Priority) => {
    if (next !== priority) onChange(next);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Priority: ${PRIORITY_CODE[priority]}. Click to change.`}
        title={`Priority: ${PRIORITY_CODE[priority]}`}
        className={`rounded-md border px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider transition active:scale-90 hover:border-ink/40 ${PRIORITY_BADGE_CLASSES[priority]}`}
      >
        {PRIORITY_CODE[priority]}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 24 }}
            style={{ transformOrigin: 'top right' }}
            className="panel absolute right-0 top-full z-20 mt-1.5 flex gap-1 rounded-xl p-1"
          >
            {PRIORITY_ORDER.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handlePick(p)}
                className={`rounded-md border px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition active:scale-90 ${
                  p === priority
                    ? PRIORITY_BADGE_CLASSES[p]
                    : 'border-transparent text-ink/40 hover:border-ink/15 hover:text-ink/70'
                }`}
              >
                {PRIORITY_CODE[p]}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
