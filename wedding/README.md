# Wedding site

A one-page wedding website for guests: the date and countdown, the order of the day, venue and travel, where to stay, dress code, gifts, FAQs, and an RSVP form. It has its own Firebase project, `jamie-and-hannah-2027`, separate from the to-do and lead apps.

Live at **https://jamie-and-hannah-2027.web.app**. Every push to `main` that touches `wedding/` publishes the site and the Firestore security rules through [`.github/workflows/deploy-wedding.yml`](../.github/workflows/deploy-wedding.yml), using the `FIREBASE_SERVICE_ACCOUNT_WEDDING` repository secret (a service account key with Firebase Hosting Admin, Firebase Rules Admin, API Keys Viewer, Cloud Run Viewer and Service Usage Consumer roles).

## Editing the details

All the wording is in [`src/wedding.ts`](src/wedding.ts). Anything still containing `TODO` is hidden from guests until it's filled in.

## Sending invites

- The plain link works for everyone.
- A **personal link** like `https://jamie-and-hannah-2027.web.app/?to=Aunt%20Mary` greets that guest by name and fills their name in on the RSVP form. The guest list page (below) has a box that makes these for you.

## Seeing replies

Open `https://jamie-and-hannah-2027.web.app/#guests` and sign in with a login added under **Authentication → Users** in the Firebase console. It shows a headcount, every reply (only the newest one per guest if someone answers twice), dietary needs, song requests, a CSV download, and the invite link maker.

Guests can only **send** replies. Reading them is limited to the User UIDs listed in `isCouple()` in [`firestore.rules`](firestore.rules); add or remove UIDs there and push to `main`.

## Getting started

```bash
npm install
npm run dev
```

- `npm run build`: type-check and build for production
- `npm run lint`: lint with oxlint
