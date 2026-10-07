import { AnimatePresence, motion } from 'framer-motion';

export interface ToastData {
  id: number;
  message: string;
  xp: number;
}

interface CelebrationToastProps {
  toast: ToastData | null;
}

export function CelebrationToast({ toast }: CelebrationToastProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:pt-[max(1.5rem,env(safe-area-inset-top))]">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            className="panel flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-xl shadow-black/30"
          >
            <span>{toast.message}</span>
            <span className="rounded-full border border-[#c6ff4a]/60 px-2 py-0.5 text-xs font-bold text-[#c6ff4a]">
              +{toast.xp} XP
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
