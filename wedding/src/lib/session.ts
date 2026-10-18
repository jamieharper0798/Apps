import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { Wedding } from '../wedding';
import { auth, db } from './firebase';

// undefined until Firebase has restored any saved sign-in, then the user or null.
export function useAuthUser() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => onAuthStateChanged(auth, setUser), []);
  return user;
}

type Content = { status: 'loading' } | { status: 'error' } | { status: 'ready'; wedding: Wedding };

export function useWeddingContent() {
  const [content, setContent] = useState<Content>({ status: 'loading' });
  useEffect(() => {
    getDoc(doc(db, 'site', 'content'))
      .then((snap) => setContent(snap.exists() ? { status: 'ready', wedding: snap.data() as Wedding } : { status: 'error' }))
      .catch(() => setContent({ status: 'error' }));
  }, []);
  return content;
}
