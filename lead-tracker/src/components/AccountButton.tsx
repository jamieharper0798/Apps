import { useEffect, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import type { SyncState } from '../hooks/useLeadStore';

interface AccountButtonProps {
  user: User | null;
  sync: SyncState;
  onSignInClick: () => void;
  onSignOut: () => void;
}

const SYNC_LABEL: Record<SyncState, string> = {
  local: 'Saved on this device',
  loading: 'Syncing…',
  synced: 'Synced across devices',
  error: 'Sync unavailable',
};

const SYNC_DOT: Record<SyncState, string> = {
  local: 'bg-white/30',
  loading: 'animate-pulse bg-amber-400',
  synced: 'bg-emerald-400',
  error: 'bg-rose-400',
};

export function AccountButton({ user, sync, onSignInClick, onSignOut }: AccountButtonProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => rootRef.current && !rootRef.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  const pill =
    'flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/75 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white';

  if (!user) {
    return (
      <button onClick={onSignInClick} className={pill} title="Sign in to sync across devices">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9H7Z" />
        </svg>
        Sync
      </button>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button onClick={() => setOpen((v) => !v)} className={pill} title={SYNC_LABEL[sync]} aria-expanded={open}>
        <span className={`h-1.5 w-1.5 rounded-full ${SYNC_DOT[sync]}`} />
        <span className="max-w-[110px] truncate">{user.email}</span>
      </button>
      {open && (
        <div className="animate-fade absolute right-0 top-full z-20 mt-2 w-52 rounded-xl border border-white/10 bg-[#161b24] p-1 shadow-xl">
          <p className="px-2.5 pb-1.5 pt-1.5 text-[11px] text-white/45">{SYNC_LABEL[sync]}</p>
          <button
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
            className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
