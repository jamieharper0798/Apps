import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { levelTitle } from '../../lib/gamify';

interface CommandCentreLevelUpOverlayProps {
  level: number | null;
  onClose: () => void;
}

/** Same celebration as the classic view's LevelUpOverlay, restyled to Command Centre's
    warm-glass/teal look and carrying its own .command-centre class so CC's --cc-* tokens
    resolve correctly wherever in the tree it's rendered. */
export function CommandCentreLevelUpOverlay({ level, onClose }: CommandCentreLevelUpOverlayProps) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {level !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="command-centre fixed inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/60 p-4 font-cc backdrop-blur-sm"
        >
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { scale: 0.6, opacity: 0, y: 20 }}
            animate={reduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { scale: 0.8, opacity: 0 }}
            transition={reduceMotion ? { duration: 0.2 } : { type: 'spring', stiffness: 260, damping: 18 }}
            className="mx-4 flex flex-col items-center gap-3 rounded-[28px] bg-[#faf6ef] px-10 py-10 text-center shadow-[0_30px_80px_rgba(30,20,10,0.35)]"
          >
            <motion.div
              animate={reduceMotion ? undefined : { rotate: [0, -8, 8, -6, 6, 0] }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-6xl"
            >
              🎉
            </motion.div>
            <p className="text-sm font-bold uppercase tracking-widest text-cc-teal">Level Up</p>
            <h2 className="text-4xl font-bold tracking-tight text-cc-ink">Level {level}</h2>
            <p className="font-medium uppercase tracking-wide text-cc-ink-3">{levelTitle(level)}</p>
            <button
              onClick={onClose}
              className="mt-3 rounded-xl bg-[#1d1a16] px-5 py-2.5 text-[13px] font-semibold text-white transition active:scale-[0.98]"
            >
              Keep going
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
