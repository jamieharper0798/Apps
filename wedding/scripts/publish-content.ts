// Uploads src/wedding.ts to Firestore (site/content) so the page can load it after guests sign in.
// Run by .github/workflows/deploy-wedding.yml with a service account in GOOGLE_APPLICATION_CREDENTIALS:
//   node --experimental-strip-types scripts/publish-content.ts
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { wedding } from '../src/wedding.ts';

initializeApp({ credential: applicationDefault(), projectId: 'jamie-and-hannah-2027' });
await getFirestore().doc('site/content').set(JSON.parse(JSON.stringify(wedding)));
console.log('Published wedding content to site/content');
