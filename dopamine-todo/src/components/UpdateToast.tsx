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
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="panel pointer-events-auto flex items-center gap-3 rounded-full py-2 pl-4 pr-2 text-sm text-white shadow-xl shadow-black/30"
          >
            <span>A new version is ready</span>
            <button
              onClick={() => updateServiceWorker(true)}
              className="rounded-full border border-[#c6ff4a]/60 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#c6ff4a] transition hover:bg-[#c6ff4a]/10"
            >
              Refresh
            </button>
            <button
              onClick={() => setNeedRefresh(false)}
              className="rounded-full p-1.5 text-white/40 hover:text-white"
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
