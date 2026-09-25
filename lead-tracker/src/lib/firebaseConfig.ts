// From Firebase Console → Project settings → General → Your apps → Web app → SDK setup and configuration → Config.
// Safe to commit: Firebase secures data via Authentication + Firestore Security Rules, not by hiding this config.
export const firebaseConfig = {
  apiKey: 'AIzaSyDojz61Vl62zY_s5X2WZK_SRkdFLssHq3g',
  authDomain: 'jh-to-do-tracker.firebaseapp.com',
  projectId: 'jh-to-do-tracker',
  storageBucket: 'jh-to-do-tracker.firebasestorage.app',
  messagingSenderId: '393640619732',
  appId: '1:393640619732:web:743c6b1d16507f42b99541',
};

export const isFirebaseConfigured = firebaseConfig.apiKey !== 'REPLACE_ME';
