# JH To Do List — Dopamine To-Do

A modern, intuitive to-do list built to make finishing tasks feel rewarding: XP and levels, daily streaks, confetti bursts, satisfying sound effects, and smooth micro-animations on every action.

## Features

- Add tasks with a priority (low / medium / high) that determines XP earned
- Animated checkboxes, strikethrough, and list transitions
- Confetti burst + hype toast on every completed task
- XP bar with levels and level titles, plus a full-screen level-up celebration
- Daily streak tracking (🔥) that resets if you miss a day
- Circular progress ring showing today's completion rate
- Filter by All / Active / Done, clear completed tasks
- Mutable sound effects (synthesized, no audio files) with a mute toggle
- Persisted to `localStorage` — no backend required
- Responsive, dark, glassmorphic UI
- Installable PWA: manifest, offline-capable service worker, an in-app "Install App" button, and an update toast when a new version is deployed
- Editable branding: click the app name in the header to rename the app and upload your own icon image — updates the header, browser tab title/favicon, and the PWA install icon, and persists across reloads

## Getting started

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and build for production
- `npm run lint` — lint with oxlint
- `npm run preview` — preview the production build

## Deployment (GitHub Pages)

`.github/workflows/deploy-pages.yml` builds this app and deploys it to GitHub Pages on every push. It sets `VITE_BASE_PATH` from the repository name so asset paths resolve correctly under `https://<owner>.github.io/<repo>/`.

One-time setup in the repo's Settings:
1. **Settings → General → Danger Zone** — the repo must be public (GitHub Pages on private repos needs a paid plan).
2. **Settings → Pages → Build and deployment → Source** — set to "GitHub Actions".

After that, every push to `dopamine-todo/**` redeploys automatically.

To build for a different base path locally: `VITE_BASE_PATH=/your-path/ npm run build`.

### Icons

App icons are generated from `scripts/icon.svg` / `scripts/icon-maskable.svg` via `node scripts/gen-icons.mjs` (requires `sharp`, installed on demand: `npm install -D sharp`). Output lands in `public/icons/`.
