import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

export function InstallButton() {
  const { canInstall, iosHint, promptInstall } = useInstallPrompt();
  const [showIosHint, setShowIosHint] = useState(false);

  if (!canInstall && !iosHint) return null;

  return (
    <div className="relative">
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => (canInstall ? promptInstall() : setShowIosHint((v) => !v))}
        className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-purple-500/25 transition active:scale-95"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v13m0 0-4-4m4 4 4-4M5 19h14" />
        </svg>
        Install App
      </motion.button>

      <AnimatePresence>
        {showIosHint && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="glass absolute right-0 top-full z-10 mt-2 w-56 rounded-xl p-3 text-left text-xs text-white/70"
          >
            Tap the Share icon <span className="text-white">⬆️</span> then{' '}
            <span className="font-semibold text-white">Add to Home Screen</span> to install Flow.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
