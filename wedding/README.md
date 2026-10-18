# Wedding site

A one-page wedding website for guests: the date and countdown, the order of the day, venue and travel, where to stay, dress code, gifts, FAQs, and an RSVP form. It has its own Firebase project, `jamie-and-hannah-2027`, separate from the to-do and lead apps.

Live at **https://jamie-and-hannah-2027.web.app**. Every push to `main` that touches `wedding/` publishes the site and the Firestore security rules through [`.github/workflows/deploy-wedding.yml`](../.github/workflows/deploy-wedding.yml), using the `FIREBASE_SERVICE_ACCOUNT_WEDDING` repository secret (a service account key with Firebase Hosting Admin, Firebase Rules Admin, Cloud Datastore User, API Keys Viewer, Cloud Run Viewer and Service Usage Consumer roles).

## Guest login

The whole site sits behind one shared guest login. Guests type the username **JamieandHannah2027** and the password from their invitation. Behind the scenes that username is the Firebase account `jamieandhannah2027@jamie-and-hannah-2027.web.app` (Authentication → Users), and sign-up is turned off so nobody can make their own account. To change the password, reset it on that user in the Firebase console.

The wedding details aren't in the page code at all: the deploy workflow uploads `src/wedding.ts` to Firestore (`site/content`), which only signed-in users can read, and RSVPs are only accepted from signed-in users. Note that this repository is public, so `src/wedding.ts` itself can be read on GitHub.

## Editing the details

All the wording is in [`src/wedding.ts`](src/wedding.ts). Anything still containing `TODO` is hidden from guests until it's filled in.

## Sending invites

- The plain link works for everyone.
- A **personal link** like `https://jamie-and-hannah-2027.web.app/?to=Mary%20Smith` greets that guest by name and fills in their first and last name on the RSVP form. The guest list page (below) has a box that makes these for you.

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
