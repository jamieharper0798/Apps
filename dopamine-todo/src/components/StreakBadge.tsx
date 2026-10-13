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
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold ${
        active ? 'border-accent/50 bg-accent/[0.05] text-accent shadow-[0_0_18px_-8px_var(--accent)]' : 'border-ink/10 text-ink/40'
      }`}
      title="Daily streak"
    >
      <span className={active ? 'animate-pulse' : ''}>🔥</span>
      <span className="font-mono tabular-nums">
        {streak} day{streak === 1 ? '' : 's'}
      </span>
    </motion.div>
  );
}
