// From Firebase Console → Project settings → General → Your apps → Web app → SDK setup and configuration → Config.
// Safe to commit: Firebase secures data via Authentication + Firestore Security Rules, not by hiding this config.
export const firebaseConfig = {
  apiKey: 'REPLACE_ME',
  authDomain: 'REPLACE_ME',
  projectId: 'REPLACE_ME',
  storageBucket: 'REPLACE_ME',
  messagingSenderId: 'REPLACE_ME',
  appId: 'REPLACE_ME',
};

export const isFirebaseConfigured = firebaseConfig.apiKey !== 'REPLACE_ME';
