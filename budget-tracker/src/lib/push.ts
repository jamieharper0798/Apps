import type { PushDevice } from '../types';
import { VAPID_PUBLIC_KEY } from './pushConfig';

export type PushSupport = 'ok' | 'needs-install' | 'unsupported';

export function pushSupport(): PushSupport {
  if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) return 'ok';
  // iPhone and iPad only offer push to apps opened from the Home Screen.
  const isApple = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes('Mac') && navigator.maxTouchPoints > 1);
  return isApple ? 'needs-install' : 'unsupported';
}

function keyBytes(base64Url: string): Uint8Array<ArrayBuffer> {
  const base64 = (base64Url + '='.repeat((4 - (base64Url.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

async function deviceId(endpoint: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(endpoint));
  return Array.from(new Uint8Array(digest).slice(0, 12), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** The dev server has no service worker, so `ready` would never settle there. */
function registration(): Promise<ServiceWorkerRegistration> {
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('The app is still installing. Close it, reopen it and try again.')), 5000)),
  ]);
}

/** The id of this device's push subscription, or null when it has none. */
export async function currentDeviceId(): Promise<string | null> {
  if (pushSupport() !== 'ok' || Notification.permission !== 'granted') return null;
  const sub = await (await registration()).pushManager.getSubscription();
  return sub ? deviceId(sub.endpoint) : null;
}

/** Must run from a tap: browsers only show the permission prompt in response to one. */
export async function subscribeDevice(): Promise<PushDevice> {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Notifications are blocked for Ledgerly. Allow them in your device settings, then try again.');

  const reg = await registration();
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(VAPID_PUBLIC_KEY) }));
  const { endpoint, keys } = sub.toJSON();
  if (!endpoint || !keys?.p256dh || !keys?.auth) throw new Error("This browser didn't return a usable push subscription.");

  await reg.showNotification('Bill reminders are on', {
    body: "You'll get a reminder here before each bill is due, and on the day.",
    icon: 'icons/icon-192.png',
    tag: 'ledgerly-setup',
  });

  return {
    id: await deviceId(endpoint),
    endpoint,
    keys: { p256dh: keys.p256dh, auth: keys.auth },
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/London',
    createdAt: Date.now(),
  };
}

/** Returns the id of the subscription that was removed, if there was one. */
export async function unsubscribeDevice(): Promise<string | null> {
  const sub = await (await registration()).pushManager.getSubscription();
  if (!sub) return null;
  const id = await deviceId(sub.endpoint);
  await sub.unsubscribe();
  return id;
}
