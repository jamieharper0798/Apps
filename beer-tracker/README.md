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

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and build for production
- `npm run lint` — lint with oxlint
- `npm run preview` — preview the production build

## Notes

- Videos and photos are stored in Firebase Storage under `photos/<uid>/…` and `videos/<uid>/…`.
- Storage rules cap photo uploads at 15 MB and video uploads at 100 MB — adjust in `storage.rules`
  (and republish) if that's too small for your group's videos.
