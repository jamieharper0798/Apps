import { motion } from 'framer-motion';
import { levelTitle } from '../lib/gamify';

interface XPBarProps {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
}

export function XPBar({ level, xpIntoLevel, xpForNextLevel }: XPBarProps) {
  const pct = Math.max(0, Math.min(1, xpIntoLevel / xpForNextLevel));

  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 font-display text-sm font-bold text-white shadow-lg shadow-purple-500/30">
        {level}
      </div>
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-sm font-semibold text-white/90">{levelTitle(level)}</span>
          <span className="text-[11px] text-white/40">
            {xpIntoLevel}/{xpForNextLevel} XP
          </span>
        </div>
        <div className="mt-1 h-2 w-40 overflow-hidden rounded-full bg-white/10 sm:w-56">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400"
            animate={{ width: `${pct * 100}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
      </div>
    </div>
  );
}
