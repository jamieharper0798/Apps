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
- Installable PWA that works offline, with a badge on the app icon showing how many leads are due (where the OS supports it)

Data is saved in the browser's `localStorage` on each device, with no account needed. Use Export to back it up.

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
