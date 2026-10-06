import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

interface InstallButtonProps {
  appName: string;
}

export function InstallButton({ appName }: InstallButtonProps) {
  const { canInstall, iosHint, promptInstall } = useInstallPrompt();
  const [showIosHint, setShowIosHint] = useState(false);

  if (!canInstall && !iosHint) return null;

  return (
    <div className="relative shrink-0">
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => (canInstall ? promptInstall() : setShowIosHint((v) => !v))}
        className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded border border-[#c6ff4a]/60 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#c6ff4a] transition active:scale-95 hover:bg-[#c6ff4a]/10"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v13m0 0-4-4m4 4 4-4M5 19h14" />
        </svg>
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden">Install</span>
      </motion.button>

      <AnimatePresence>
        {showIosHint && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="panel absolute right-0 top-full z-10 mt-2 w-56 rounded-lg p-3 text-left text-xs normal-case text-white/70"
          >
            Tap the Share icon <span className="text-white">⬆️</span> then{' '}
            <span className="font-semibold text-white">Add to Home Screen</span> to install {appName}.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
