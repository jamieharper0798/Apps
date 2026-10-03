# Wedding site

A one-page wedding website for guests: the date and countdown, the order of the day, venue and travel, where to stay, dress code, gifts, FAQs, and an RSVP form. Replies are saved to Firestore in the same Firebase project as the to-do and lead apps.

Once deployed it lives at `https://<your-github-username>.github.io/Apps/wedding/`.

## Editing the details

All the wording is in [`src/wedding.ts`](src/wedding.ts). Lines marked `TODO` still need your real details (names, date, venue, hotels, contact).

## Sending invites

- The plain link works for everyone.
- A **personal link** like `.../wedding/?to=Aunt%20Mary` greets that guest by name and fills their name in on the RSVP form. The guest list page (below) has a box that makes these for you.

## Seeing replies

Open `.../wedding/#guests` and sign in with your to-do app account. It shows a headcount, every reply (only the newest one per guest if someone answers twice), dietary needs, song requests, a CSV download, and the invite link maker.

### One-time Firestore rules setup

Guests can only **send** replies; nobody but you can read them. To set that up:

1. Open `#guests` and sign in. It will say the account can't see replies yet and show your **account ID**. If your partner wants access too, have them sign in (or create an account in the to-do app) and grab theirs.
2. In the Firebase console for `jh-to-do-tracker`, go to **Firestore Database → Rules**, paste the block from [`firestore.rules.snippet`](firestore.rules.snippet) next to the existing rules, replace `PASTE_ACCOUNT_ID_HERE` with your ID(s), e.g. `['abc123', 'def456']`, and **Publish**.
3. Refresh `#guests`.

Until step 2 is done, the RSVP form will show an error to guests, so do this before sending invites.

## Getting started

```bash
npm install
npm run dev
```

- `npm run build`: type-check and build for production
- `npm run lint`: lint with oxlint
