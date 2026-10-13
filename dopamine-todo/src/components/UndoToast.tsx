import { AnimatePresence, motion } from 'framer-motion';

export interface UndoData {
  id: number;
  message: string;
}

interface UndoToastProps {
  undo: UndoData | null;
  onUndo: () => void;
}

export function UndoToast({ undo, onUndo }: UndoToastProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <AnimatePresence>
        {undo && (
          <motion.div
            key={undo.id}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 24 }}
            className="panel pointer-events-auto flex items-center gap-3 rounded-full py-2 pl-4 pr-2 text-sm text-ink shadow-xl shadow-black/30"
          >
            <span>{undo.message}</span>
            <button
              onClick={onUndo}
              className="rounded-full border border-accent/60 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-accent transition hover:bg-accent/10"
            >
              Undo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
