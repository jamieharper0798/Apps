# Lead Tracker

A simple sales app for keeping track of new leads and making sure you reach back out to them on time.

## Features

- **Follow-ups view**: leads you need to contact, grouped into Overdue, Today, Coming up this week, and No reminder set
- **Add a lead** with name, company, email, phone, where you found them, estimated value, status, notes, and a reminder date (quick picks: tomorrow / 3 days / 1 week / 2 weeks / 1 month, or any date)
- **"I reached out"** logs the contact with a note, updates the status, and sets the next reminder in one step
- **Snooze** a reminder by a day or a week
- One-tap **call** and **email** buttons
- Per-lead **activity history** (contacts, notes, status changes) and quick notes
- **All leads** view with search, status filters (New → Contacted → Follow-up → Qualified → Won / Lost), and sorting
- Stats: leads due, open leads, pipeline value, deals won
- **Export to CSV**
- **Sync across devices** by signing in (optional)
- Installable PWA that works offline, with a badge on the app icon showing how many leads are due (where the OS supports it)

## Cross-device sync

Signed out, leads are saved in the browser's `localStorage` on that device. Tap **Sync** to sign in with the same account as the to-do app (same Firebase project), and leads are stored in Firestore under `leadTrackers/{uid}/leads/{leadId}`. They update live on every signed-in device and still load offline, thanks to Firestore's persistent cache. Each lead is its own document, so editing different leads on two devices at once never overwrites the other.

The first time you sign in on a device, any leads already on it are moved into your account. After that, signing out shows an empty guest list; your leads stay in the account.

If Firestore refuses access (for example, the rules below haven't been added), the app shows a banner and keeps saving on the device, so nothing you enter is lost.

### One-time Firestore rules setup

In the Firebase console (**Firestore Database → Rules**) for `jh-to-do-tracker`, add this block **next to the existing to-do rule** (inside `match /databases/{database}/documents { … }`), then publish:

```
match /leadTrackers/{userId}/{document=**} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

### Testing against the Firebase emulators

```bash
npx firebase-tools emulators:start --only auth,firestore --project jh-to-do-tracker
VITE_FIREBASE_EMULATOR=1 npm run dev
```

The emulators need a `firebase.json` and rules file. Setting `VITE_FIREBASE_EMULATOR` points the app at the emulators on `127.0.0.1:9099` (auth) and `:8080` (Firestore) instead of the real project.

## Getting started

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev`: start the dev server
- `npm run build`: type-check and build for production
- `npm run lint`: lint with oxlint
- `npm run preview`: preview the production build

## Deployment

`.github/workflows/deploy-pages.yml` builds this app together with `dopamine-todo` and publishes it to the same GitHub Pages site under `/<repo>/leads/`.

## Icons

`public/icons/` is generated from `scripts/icon.svg` with `node scripts/gen-icons.mjs` (install sharp first: `npm install --no-save sharp`).
