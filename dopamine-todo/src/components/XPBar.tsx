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
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-[#c6ff4a] font-display text-xl font-bold text-[#c6ff4a] shadow-[0_0_22px_-6px_#c6ff4a]">
        {level}
      </div>
      <div className="min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
          <span className="truncate text-sm font-semibold uppercase tracking-wide text-white/90">{levelTitle(level)}</span>
          <span className="shrink-0 tabular-nums text-[11px] text-white/40">
            {xpIntoLevel}/{xpForNextLevel} XP
          </span>
        </div>
        <div className="relative mt-1.5 h-1.5 w-40 overflow-hidden rounded-full bg-white/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] sm:w-56">
          <motion.div
            className="relative h-full overflow-hidden rounded-full bg-[#c6ff4a] shadow-[0_0_10px_-1px_#c6ff4a]"
            animate={{ width: `${pct * 100}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          >
            <span className="xp-sheen absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-black/20 to-transparent" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
