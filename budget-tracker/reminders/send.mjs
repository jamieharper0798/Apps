// Sends bill-reminder push notifications. Run once a day by .github/workflows/bill-reminders.yml.
//
// This repo is public and so are its Actions logs: log counts only, never bill names, amounts or account ids.
import { cert, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { sendNotification, setVapidDetails } from 'web-push';
import { nextDueDate } from '../src/lib/frequency.ts';
import { VAPID_PUBLIC_KEY } from '../src/lib/pushConfig.ts';

const DAY_MS = 86_400_000;
const DEFAULT_REMIND_DAYS = 2;
const DEFAULT_TIME_ZONE = 'Europe/London';
const MAX_LINES = 5;

const mode = process.env.REMINDER_MODE === 'test' ? 'test' : 'due';
const dryRun = process.env.DRY_RUN === 'true';
const usingEmulator = !!process.env.FIRESTORE_EMULATOR_HOST;

function notSetUp(what) {
  console.log(`::warning::Bill reminders are not set up yet: ${what}. See "Bill reminders" in the README.`);
  process.exit(0);
}

if (!usingEmulator && !process.env.FIREBASE_SERVICE_ACCOUNT) notSetUp('the FIREBASE_SERVICE_ACCOUNT secret is missing');
if (!dryRun && !process.env.VAPID_PRIVATE_KEY) notSetUp('the VAPID_PRIVATE_KEY secret is missing');

if (usingEmulator) {
  initializeApp({ projectId: process.env.GCLOUD_PROJECT || 'demo-ledger' });
} else {
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch {
    console.log('::error::The FIREBASE_SERVICE_ACCOUNT secret is not valid JSON. Paste the whole key file as its value.');
    process.exit(1);
  }
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

if (!dryRun) {
  setVapidDetails(process.env.VAPID_SUBJECT || 'https://github.com', VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
}

/** Midnight UTC on the calendar date it currently is in `timeZone`, matching how the app stores bill dates. */
function localToday(timeZone) {
  if (process.env.REMINDER_TODAY) return new Date(`${process.env.REMINDER_TODAY}T00:00:00Z`);
  const parts = (zone) => new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  let p;
  try {
    p = parts(timeZone || DEFAULT_TIME_ZONE);
  } catch {
    p = parts(DEFAULT_TIME_ZONE);
  }
  const get = (type) => Number(p.find((x) => x.type === type).value);
  return new Date(Date.UTC(get('year'), get('month') - 1, get('day')));
}

/** Unpaid, active bills due today or exactly their "remind me" number of days from now. */
function dueItems(data, today) {
  const items = [];
  for (const bill of data.bills ?? []) {
    if (bill.active === false || !bill.anchorDate) continue;
    const due = nextDueDate(bill.anchorDate, bill.frequency, bill.customIntervalDays ?? null, today);
    const days = Math.round((due.getTime() - today.getTime()) / DAY_MS);
    const remind = Number.isInteger(bill.reminderDaysBefore) && bill.reminderDaysBefore >= 0 ? bill.reminderDaysBefore : DEFAULT_REMIND_DAYS;
    if (days !== 0 && days !== remind) continue;
    if ((bill.noPaymentMonths ?? []).includes(due.getUTCMonth() + 1)) continue;
    const period = due.toISOString().slice(0, 7);
    if ((data.payments ?? []).some((p) => p.billId === bill.id && p.period === period)) continue;
    items.push({ bill, days });
  }
  return items.sort((a, b) => a.days - b.days || b.bill.amount - a.bill.amount);
}

function buildPayload(data, items) {
  const currency = data.settings?.currency ?? '£';
  const money = (n) => `${currency}${Number(n).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const when = (days) => (days === 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`);

  if (items.length === 1) {
    const { bill, days } = items[0];
    const account = (data.accounts ?? []).find((a) => a.id === bill.accountId);
    return { title: `${bill.name} is due ${when(days)}`, body: `${money(bill.amount)}${account ? ` from ${account.name}` : ''}` };
  }

  const lines = items.slice(0, MAX_LINES).map(({ bill, days }) => `${bill.name} · ${money(bill.amount)} · ${when(days)}`);
  if (items.length > MAX_LINES) lines.push(`and ${items.length - MAX_LINES} more`);
  const allToday = items.every((i) => i.days === 0);
  return { title: allToday ? `${items.length} bills due today` : `${items.length} bills coming up`, body: lines.join('\n') };
}

const totals = { accounts: 0, devices: 0, sent: 0, nothingDue: 0, alreadySent: 0, removed: 0, failed: 0 };

const users = await db.collection('users').get();
for (const userDoc of users.docs) {
  const data = userDoc.data();
  const devices = Array.isArray(data.pushDevices) ? data.pushDevices : [];
  if (devices.length === 0) continue;
  totals.accounts += 1;

  const logRef = db.doc(`reminderLog/${userDoc.id}`);
  const sentLog = (await logRef.get()).data() ?? {};
  const logUpdate = {};
  const gone = [];

  for (const device of devices) {
    totals.devices += 1;
    const today = localToday(device.timeZone);
    const todayKey = today.toISOString().slice(0, 10);

    let payload;
    if (mode === 'test') {
      payload = { title: 'Test from Ledgerly', body: 'Bill reminders are working on this device.', tag: 'ledgerly-test' };
    } else {
      if (sentLog[device.id] === todayKey) {
        totals.alreadySent += 1;
        continue;
      }
      const items = dueItems(data, today);
      if (items.length === 0) {
        totals.nothingDue += 1;
        continue;
      }
      payload = buildPayload(data, items);
    }

    if (dryRun) {
      console.log('[dry run]', JSON.stringify(payload));
      totals.sent += 1;
      continue;
    }

    try {
      await sendNotification({ endpoint: device.endpoint, keys: device.keys }, JSON.stringify(payload), { TTL: 12 * 60 * 60 });
      totals.sent += 1;
      if (mode === 'due') logUpdate[device.id] = todayKey;
    } catch (err) {
      if (err?.statusCode === 404 || err?.statusCode === 410) {
        // The browser dropped this subscription (app removed, or permission revoked).
        gone.push(device.id);
        logUpdate[device.id] = FieldValue.delete();
        totals.removed += 1;
      } else {
        totals.failed += 1;
        console.log(`::warning::A push was rejected (status ${err?.statusCode ?? 'unknown'}).`);
      }
    }
  }

  if (Object.keys(logUpdate).length > 0) await logRef.set(logUpdate, { merge: true });
  if (gone.length > 0) {
    await db.runTransaction(async (tx) => {
      const fresh = (await tx.get(userDoc.ref)).data();
      tx.update(userDoc.ref, { pushDevices: (fresh?.pushDevices ?? []).filter((d) => !gone.includes(d.id)) });
    });
  }
}

console.log(
  `Mode: ${mode}${dryRun ? ' (dry run)' : ''}. Accounts with reminders on: ${totals.accounts}. Devices: ${totals.devices}. ` +
    `Sent: ${totals.sent}. Nothing due: ${totals.nothingDue}. Already sent today: ${totals.alreadySent}. ` +
    `Expired devices removed: ${totals.removed}. Failed: ${totals.failed}.`,
);

if (totals.failed > 0 && totals.sent === 0) process.exit(1);
