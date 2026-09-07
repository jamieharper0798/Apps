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
    if (!user || !cloud.ready || cloud.exists) return;
    cloud.setValue(localState);
    // Seed once per sign-in, when the cloud doc doesn't exist yet — not on every localState change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, cloud.ready, cloud.exists]);

  if (user) {
    return [cloud.value, cloud.setValue, { syncing: !cloud.ready }] as const;
  }
  return [localState, setLocalState, { syncing: false }] as const;
}
