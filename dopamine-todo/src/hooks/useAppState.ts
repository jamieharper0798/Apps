import { useEffect } from 'react';
import type { AppState } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { useCloudState } from './useCloudState';
import { useAuth } from './useAuth';

/**
 * Same [state, setState] shape as useLocalStorage, but backed by Firestore
 * while signed in, and by localStorage otherwise ("guest mode"). On first
 * sign-in, seeds the cloud with whatever guest data already existed locally
 * so nothing is lost.
 */
export function useAppState(initial: AppState) {
  const { user } = useAuth();
  const [localState, setLocalState] = useLocalStorage<AppState>('dopamine-todo:v1', initial);
  const cloud = useCloudState<AppState>(user?.uid ?? null, 'todoApps', initial);

  useEffect(() => {
    // A failed read must never be treated as "no cloud doc yet" — that would overwrite real
    // cloud data with empty/local state. Only seed when we've confirmed, error-free, that
    // nothing exists for this account.
    if (!user || !cloud.ready || cloud.exists || cloud.errored) return;
    // Belt-and-braces against any race that could make `cloud.exists` read false for a brief
    // moment on an account that actually has real cloud data (e.g. during an auth-state
    // transition): seeding empty local state is never useful anyway, since there's nothing to
    // preserve, so skipping it here removes the only path by which this effect could ever write
    // over a real document with nothing.
    const hasLocalData = localState.tasks.length > 0 || localState.dopamine.totalCompleted > 0;
    if (!hasLocalData) return;
    cloud.setValue(localState);
    // Seed once per sign-in, when the cloud doc doesn't exist yet — not on every localState change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, cloud.ready, cloud.exists, cloud.errored]);

  if (user) {
    return [cloud.value, cloud.setValue, { syncing: !cloud.ready, syncError: cloud.errored }] as const;
  }
  return [localState, setLocalState, { syncing: false, syncError: false }] as const;
}
