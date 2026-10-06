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
    <div className="relative flex min-w-0 items-center gap-3">
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 font-display text-base font-bold text-white shadow-lg shadow-purple-500/30 ring-1 ring-white/20">
        {level}
      </div>
      <div className="min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
          <span className="truncate text-sm font-semibold text-white/90">{levelTitle(level)}</span>
          <span className="shrink-0 tabular-nums text-[11px] text-white/40">
            {xpIntoLevel}/{xpForNextLevel} XP
          </span>
        </div>
        <div className="relative mt-1.5 h-2 w-40 overflow-hidden rounded-full bg-white/10 sm:w-56">
          <motion.div
            className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400"
            animate={{ width: `${pct * 100}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          >
            <span className="xp-sheen absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
