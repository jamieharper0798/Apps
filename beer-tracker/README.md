# Beer Tracker

A login-gated group app for tracking who's drinking how many beers. Every submission needs a photo,
the group total and a per-person leaderboard update live, and every 100th beer (group-wide) requires
a video as well as a photo.

## Features

- Email/password login and signup (Firebase Authentication)
- Submit a beer with a required photo upload
- Live group total counter
- Live leaderboard ranked by each person's count
- Recent activity feed with thumbnails
- Every 100th submission (tracked globally, atomically) requires a video before it will save

## How the "every 100th" rule works

A shared counter document is incremented inside a Firestore transaction each time someone submits.
If the number the transaction claims is a multiple of 100, the transaction is aborted unless a video
was already attached — the UI then prompts the user to attach a video and resubmit (their photo stays
picked, no need to redo that part). Doing this inside a transaction keeps it correct even if two
people submit at the exact same moment.

## Setup

This app needs a free [Firebase](https://firebase.google.com/) project for login, the shared
database, and file storage (GitHub Pages, where these apps are deployed, only serves static files).

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com/).
2. **Authentication** → Sign-in method → enable **Email/Password**.
3. **Firestore Database** → create a database (production mode is fine), then paste the contents of
   [`firestore.rules`](./firestore.rules) into the Rules tab and publish.
4. **Storage** → get started, then paste the contents of [`storage.rules`](./storage.rules) into the
   Rules tab and publish.
5. **Project settings** → General → "Your apps" → add a Web app, and copy the config values into a
   `.env` file in this folder (copy `.env.example` to `.env` first):

   ```bash
   cp .env.example .env
   # then fill in the VITE_FIREBASE_* values from the Firebase console
   ```

6. Install dependencies and run:

   ```bash
   npm install
   npm run dev
   ```

Anyone who signs up through the app becomes part of the same shared group — the group total and
leaderboard are shared across all users of the same Firebase project.

## Deployment (GitHub Pages)

`.github/workflows/deploy-pages.yml` builds this app alongside the other apps in this repo and
publishes it to `https://<owner>.github.io/<repo>/beer-tracker/` (with a landing page at the site
root linking to each app — see `pages/index.html`).

Since Firebase config is baked into the build, add these as **repository secrets** (Settings →
Secrets and variables → Actions → New repository secret), using the same values as your `.env`:

- `BEER_TRACKER_FIREBASE_API_KEY`
- `BEER_TRACKER_FIREBASE_AUTH_DOMAIN`
- `BEER_TRACKER_FIREBASE_PROJECT_ID`
- `BEER_TRACKER_FIREBASE_STORAGE_BUCKET`
- `BEER_TRACKER_FIREBASE_MESSAGING_SENDER_ID`
- `BEER_TRACKER_FIREBASE_APP_ID`

Then in the Firebase console under **Authentication → Settings → Authorized domains**, add
`<owner>.github.io` — otherwise login will fail on the deployed site with an unauthorized-domain
error (Firebase only allows sign-in from domains you've explicitly listed).

One-time repo setup (same as the other apps): **Settings → Pages → Build and deployment → Source**
must be set to "GitHub Actions", and the repo must be public unless you're on a paid GitHub plan.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and build for production
- `npm run lint` — lint with oxlint
- `npm run preview` — preview the production build

## Notes

- Videos and photos are stored in Firebase Storage under `photos/<uid>/…` and `videos/<uid>/…`.
- Storage rules cap photo uploads at 15 MB and video uploads at 100 MB — adjust in `storage.rules`
  (and republish) if that's too small for your group's videos.
