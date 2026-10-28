import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { levelTitle } from '../lib/gamify';

interface LevelUpOverlayProps {
  level: number | null;
  onClose: () => void;
}

export function LevelUpOverlay({ level, onClose }: LevelUpOverlayProps) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {level !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { scale: 0.6, opacity: 0, y: 20 }}
            animate={reduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { scale: 0.8, opacity: 0 }}
            transition={reduceMotion ? { duration: 0.2 } : { type: 'spring', stiffness: 260, damping: 18 }}
            className="panel mx-4 flex flex-col items-center gap-3 rounded-2xl px-10 py-10 text-center"
          >
            <motion.div
              animate={reduceMotion ? undefined : { rotate: [0, -8, 8, -6, 6, 0] }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-6xl"
            >
              🎉
            </motion.div>
            <p className="font-display text-sm uppercase tracking-widest text-accent">Level Up</p>
            <h2 className="shimmer-text font-display text-4xl font-bold tracking-tight">Level {level}</h2>
            <p className="uppercase tracking-wide text-ink/60">{levelTitle(level)}</p>
            <button
              onClick={onClose}
              className="mt-3 rounded-lg border border-accent/60 px-5 py-2 text-sm font-bold uppercase tracking-wide text-accent transition active:scale-95 hover:shadow-[0_0_20px_-6px_var(--accent)] hover:bg-accent/10"
            >
              Keep going
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
