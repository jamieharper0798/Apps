import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import {
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigured } from './firebaseConfig';

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
// Persistent cache so signed-in leads still load (and edits queue up) when the phone is offline.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

// Local testing against `firebase emulators:start` (see README) instead of the real project.
if (import.meta.env.VITE_FIREBASE_EMULATOR) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}

export { isFirebaseConfigured };
