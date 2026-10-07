import { motion } from 'framer-motion';
import type { ListId } from '../types';
import { LIST_ORDER, LIST_META } from '../lib/lists';

interface ListToggleProps {
  active: ListId;
  counts: Record<ListId, number>;
  onChange: (list: ListId) => void;
}

export function ListToggle({ active, counts, onChange }: ListToggleProps) {
  return (
    <div className="flex items-center gap-6 border-b border-white/10">
      {LIST_ORDER.map((list) => {
        const meta = LIST_META[list];
        const isActive = list === active;
        return (
          <button
            key={list}
            onClick={() => onChange(list)}
            className="relative flex items-center gap-1.5 pb-2.5 text-sm font-semibold uppercase tracking-wide transition"
          >
            <span className={isActive ? 'text-white' : 'text-white/35 hover:text-white/60'}>
              {meta.label} <span className="tabular-nums text-white/30">· {counts[list] ?? 0}</span>
            </span>
            {isActive && (
              <motion.div
                layoutId="list-toggle-underline"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#c6ff4a] shadow-[0_0_10px_-1px_#c6ff4a]"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
