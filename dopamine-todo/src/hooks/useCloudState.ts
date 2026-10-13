import { useEffect, useRef, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';

export interface CloudState<T> {
  value: T;
  setValue: (updater: T | ((prev: T) => T)) => void;
  /** True once the first snapshot has been received (or immediately, if uid is null). */
  ready: boolean;
  /** True if a document already exists in Firestore for this uid. */
  exists: boolean;
  /** True if the live listener's most recent attempt failed — `exists` is unreliable while this is true. */
  errored: boolean;
}

/** Firestore-document-backed state, mirroring useLocalStorage's shape so callers can swap between the two. */
export function useCloudState<T extends object>(uid: string | null, collection: string, initial: T): CloudState<T> {
  const [value, setValueState] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  const [exists, setExists] = useState(false);
  const [errored, setErrored] = useState(false);
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    if (!uid || !isFirebaseConfigured) {
      setReady(false);
      setExists(false);
      setErrored(false);
      return;
    }

    setReady(false);
    setErrored(false);
    const ref = doc(db, collection, uid);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setValueState(snap.data() as T);
          setExists(true);
        } else {
          setExists(false);
        }
        setErrored(false);
        setReady(true);
      },
      (err) => {
        // A failed read tells us nothing about whether a document exists — leaving `exists`
        // at its default `false` here would make a transient error look identical to "new
        // account, no doc yet" and let the first-sign-in seed effect overwrite real cloud
        // data with empty local state. `errored` lets callers tell the two apart.
        console.error('Cloud sync error', err);
        setErrored(true);
        setReady(true);
      },
    );
    return unsubscribe;
  }, [uid, collection]);

  const setValue = (updater: T | ((prev: T) => T)) => {
    if (!uid || !isFirebaseConfigured) return;
    const next = typeof updater === 'function' ? (updater as (prev: T) => T)(valueRef.current) : updater;
    valueRef.current = next;
    setValueState(next);
    setExists(true);
    setDoc(doc(db, collection, uid), next).catch((err) => {
      console.error('Failed to sync to cloud', err);
    });
  };

  return { value, setValue, ready, exists, errored };
}
