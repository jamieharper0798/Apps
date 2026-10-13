import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { User } from 'firebase/auth';

interface AccountButtonProps {
  user: User | null;
  syncing: boolean;
  syncError: boolean;
  onSignInClick: () => void;
  onSignOut: () => void;
}

export function AccountButton({ user, syncing, syncError, onSignInClick, onSignOut }: AccountButtonProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (!user) {
    return (
      <button
        onClick={onSignInClick}
        className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-ink/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink/70 transition hover:border-ink/30 hover:text-ink"
        title="Sign in to sync across devices"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"
          />
        </svg>
        Sign in
      </button>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition hover:border-ink/30 ${
          syncError ? 'border-red-400/50 text-red-300' : 'border-ink/15 text-ink/70 hover:text-ink'
        }`}
        title={syncError ? 'Sync error — your changes may not be saved. Click for details.' : user.email ?? 'Account'}
      >
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
            syncError ? 'bg-red-400' : syncing ? 'animate-pulse bg-amber-400' : 'bg-accent'
          }`}
        />
        <span className="max-w-[90px] truncate normal-case sm:max-w-[110px]">
          {syncError ? 'Sync error' : user.email}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 24 }}
            className="panel absolute right-0 top-full z-20 mt-1.5 w-44 rounded-xl p-1"
          >
            <p className="px-2.5 pb-1.5 pt-1 text-[11px] normal-case text-ink/40">
              {syncError ? (
                <span className="text-red-300">
                  Can't reach your synced data right now. Changes made in this state won't be saved — check your
                  connection and reload.
                </span>
              ) : syncing ? (
                'Syncing…'
              ) : (
                `Synced as ${user.email}`
              )}
            </p>
            <button
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
              className="w-full rounded-md px-2.5 py-1.5 text-left text-xs font-medium uppercase tracking-wide text-ink/70 transition hover:bg-ink/10 hover:text-ink"
            >
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
