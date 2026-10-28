import { AnimatePresence, motion } from 'framer-motion';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function UpdateToast() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  return (
    <div className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <AnimatePresence>
        {needRefresh && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 24 }}
            className="panel-glass pointer-events-auto flex items-center gap-3 rounded-full py-2 pl-4 pr-2 text-sm text-ink shadow-xl shadow-black/30"
          >
            <span>A new version is ready</span>
            <button
              onClick={() => updateServiceWorker(true)}
              className="rounded-full border border-accent/60 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-accent transition active:scale-95 hover:bg-accent/10"
            >
              Refresh
            </button>
            <button
              onClick={() => setNeedRefresh(false)}
              className="rounded-full p-1.5 text-ink/40 transition active:scale-90 hover:text-ink"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
