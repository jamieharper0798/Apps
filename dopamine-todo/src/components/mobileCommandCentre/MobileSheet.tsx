import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface MobileSheetProps {
  open: boolean;
  onClose: () => void;
  ariaLabel: string;
  children: ReactNode;
  /** Settings needs the full height for its longer content; task sheets size to their content. */
  tall?: boolean;
}

/** Shared chrome for the New task / Task detail / Settings sheets: inset 8px, radius 44,
    closes on scrim tap, Esc, or a Cancel/×/Done button inside `children`. */
export function MobileSheet({ open, onClose, ariaLabel, children, tall }: MobileSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="command-centre fixed inset-0 z-40 font-cc">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label="Close"
            tabIndex={-1}
            className="absolute inset-0 h-full w-full cursor-pointer border-none bg-[rgba(29,26,22,.38)] backdrop-blur-[3px]"
          />
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            className="absolute inset-x-2 bottom-2 flex flex-col gap-3.5 overflow-y-auto rounded-[44px] border border-white/80 px-4.5 pb-6 pt-2.5"
            style={{
              top: tall ? 'max(58px, env(safe-area-inset-top))' : 'auto',
              maxHeight: tall ? undefined : 'calc(100% - 64px)',
              background: 'rgba(250,247,242,.97)',
              backdropFilter: 'blur(30px) saturate(160%)',
              WebkitBackdropFilter: 'blur(30px) saturate(160%)',
              boxShadow: '0 -10px 50px rgba(30,20,10,.3)',
            }}
          >
            <div aria-hidden="true" className="h-[5px] w-9 shrink-0 self-center rounded-full bg-[#c7bfb3]" />
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
