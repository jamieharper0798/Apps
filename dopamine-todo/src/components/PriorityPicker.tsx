import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Priority } from '../types';
import { PRIORITY_ORDER, PRIORITY_STYLES, PRIORITY_SHORT_LABELS } from '../lib/priority';

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
        aria-label={`Priority: ${PRIORITY_SHORT_LABELS[priority]}. Click to change.`}
        title={`Priority: ${PRIORITY_SHORT_LABELS[priority]}`}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition hover:bg-white/10"
      >
        <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_STYLES[priority]}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 24 }}
            className="glass absolute left-1/2 top-full z-20 mt-1.5 flex -translate-x-1/2 gap-1 rounded-xl p-1"
          >
            {PRIORITY_ORDER.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handlePick(p)}
                className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium whitespace-nowrap transition ${
                  p === priority ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_STYLES[p]}`} />
                {PRIORITY_SHORT_LABELS[p]}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
