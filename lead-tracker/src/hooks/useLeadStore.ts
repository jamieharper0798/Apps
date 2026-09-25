import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, setDoc, writeBatch } from 'firebase/firestore';
import type { Lead } from '../types';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { useLocalStorage } from './useLocalStorage';
import { useAuth } from './useAuth';

export type SyncState = 'local' | 'loading' | 'synced' | 'error';

/** Each lead is its own document, so edits to different leads from two devices never overwrite each other. */
function leadsCollection(uid: string) {
  return collection(db, 'leadTrackers', uid, 'leads');
}

function syncErrorMessage(err: unknown) {
  const code = (err as { code?: string })?.code;
  if (code === 'permission-denied') {
    return "Cloud sync isn't enabled for Lead Tracker yet, so leads are only being saved on this device.";
  }
  return "Couldn't reach the cloud, so leads are only being saved on this device.";
}

/**
 * Lead storage: localStorage while signed out ("guest mode"), Firestore while signed in.
 * On sign-in, any guest leads on this device are moved into the account. If the cloud
 * can't be read (e.g. Firestore rules not set up), it falls back to local storage so
 * nothing the user enters is lost.
 */
export function useLeadStore() {
  const { user, authReady, signIn, signUp, signOutUser } = useAuth();
  const [localLeads, setLocalLeads] = useLocalStorage<Lead[]>('lead-tracker:v1', []);
  const uid = user?.uid ?? null;

  // Cloud state is tagged with the uid it belongs to, so switching accounts shows nothing stale.
  const [cloud, setCloud] = useState<{ uid: string; leads: Lead[] } | null>(null);
  // A read error means the cloud is unusable, so fall back to this device's storage.
  // A write error keeps showing cloud data but warns that the change may not have saved.
  const [readError, setReadError] = useState<{ uid: string; message: string } | null>(null);
  const [writeError, setWriteError] = useState<{ uid: string; message: string } | null>(null);
  const localRef = useRef(localLeads);
  useLayoutEffect(() => {
    localRef.current = localLeads;
  }, [localLeads]);
  const mergedFor = useRef<string | null>(null);
  const [dismissedError, setDismissedError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid || !isFirebaseConfigured) return;

    return onSnapshot(
      leadsCollection(uid),
      (snap) => {
        const leads = snap.docs.map((d) => d.data() as Lead);
        setCloud({ uid, leads });

        // Move this device's guest leads into the account, once per sign-in, after the server has answered.
        if (mergedFor.current === uid || snap.metadata.fromCache) return;
        mergedFor.current = uid;
        const known = new Set(leads.map((l) => l.id));
        const guest = localRef.current.filter((l) => !known.has(l.id));
        if (guest.length === 0) return;
        const batch = writeBatch(db);
        for (const lead of guest) batch.set(doc(leadsCollection(uid), lead.id), lead);
        batch
          .commit()
          .then(() => setLocalLeads([]))
          .catch((err) => {
            console.error('Failed to move guest leads to cloud', err);
            mergedFor.current = null; // retry on the next snapshot
            setWriteError({ uid, message: syncErrorMessage(err) });
          });
      },
      (err) => {
        console.error('Cloud sync error', err);
        setReadError({ uid, message: syncErrorMessage(err) });
      },
    );
  }, [uid, setLocalLeads]);

  const cloudLeads = uid && cloud?.uid === uid ? cloud.leads : null;
  const currentReadError = uid && readError?.uid === uid ? readError.message : null;
  const currentWriteError = uid && writeError?.uid === uid ? writeError.message : null;
  const useCloud = !!uid && isFirebaseConfigured && !currentReadError;

  const putLead = useCallback(
    (lead: Lead) => {
      if (!useCloud || !uid) {
        setLocalLeads((prev) => (prev.some((l) => l.id === lead.id) ? prev.map((l) => (l.id === lead.id ? lead : l)) : [lead, ...prev]));
        return;
      }
      // Optimistic: the snapshot listener also fires immediately for local writes.
      setDoc(doc(leadsCollection(uid), lead.id), lead).catch((err) => {
        console.error('Failed to save lead', err);
        setWriteError({ uid, message: "A change couldn't be saved to the cloud. Check your connection and try again." });
      });
    },
    [useCloud, uid, setLocalLeads],
  );

  const removeLead = useCallback(
    (id: string) => {
      if (!useCloud || !uid) {
        setLocalLeads((prev) => prev.filter((l) => l.id !== id));
        return;
      }
      deleteDoc(doc(leadsCollection(uid), id)).catch((err) => {
        console.error('Failed to delete lead', err);
        setWriteError({ uid, message: "A change couldn't be saved to the cloud. Check your connection and try again." });
      });
    },
    [useCloud, uid, setLocalLeads],
  );

  const error = currentReadError ?? currentWriteError;
  let sync: SyncState = 'local';
  if (!authReady) sync = 'loading';
  else if (uid && error) sync = 'error';
  else if (uid && cloudLeads === null) sync = 'loading';
  else if (uid) sync = 'synced';

  const leads = useCloud ? (cloudLeads ?? []) : localLeads;

  return {
    leads,
    putLead,
    removeLead,
    sync,
    syncError: error !== dismissedError ? error : null,
    dismissSyncError: () => setDismissedError(error),
    user,
    signIn,
    signUp,
    signOut: signOutUser,
  };
}
