import { motion } from 'framer-motion';
import type { ListId } from '../types';
import { LIST_ORDER, LIST_META } from '../lib/lists';

interface ListToggleProps {
  active: ListId;
  onChange: (list: ListId) => void;
}

export function ListToggle({ active, onChange }: ListToggleProps) {
  return (
    <div className="glass relative flex gap-1 rounded-2xl p-1">
      {LIST_ORDER.map((list) => {
        const meta = LIST_META[list];
        const isActive = list === active;
        return (
          <button
            key={list}
            onClick={() => onChange(list)}
            className="relative flex flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition"
          >
            {isActive && (
              <motion.div
                layoutId="list-toggle-active"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500"
              />
            )}
            <span className={`relative z-10 ${isActive ? 'text-white' : 'text-white/40'}`}>{meta.icon}</span>
            <span className={`relative z-10 ${isActive ? 'text-white' : 'text-white/40'}`}>{meta.label}</span>
          </button>
        );
      })}
    </div>
  );
}
