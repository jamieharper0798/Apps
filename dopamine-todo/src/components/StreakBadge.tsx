import { motion } from 'framer-motion';

interface StreakBadgeProps {
  streak: number;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  const active = streak > 0;
  return (
    <motion.div
      key={streak}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 14 }}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${
        active
          ? 'bg-gradient-to-r from-orange-500/20 to-amber-400/20 text-amber-300 ring-1 ring-amber-400/30'
          : 'bg-white/5 text-white/40 ring-1 ring-white/10'
      }`}
      title="Daily streak"
    >
      <span className={active ? 'animate-pulse' : ''}>🔥</span>
      {streak} day{streak === 1 ? '' : 's'}
    </motion.div>
  );
}
