import { useEffect, useState } from 'react';
import type { PushDevice } from '../types';
import { currentDeviceId, pushSupport, subscribeDevice, unsubscribeDevice } from '../lib/push';

interface Props {
  devices: PushDevice[];
  onSave: (device: PushDevice) => void;
  onRemove: (id: string) => void;
}

/** Turns bill-reminder notifications on or off for the device it's shown on. */
export function PushReminders({ devices, onSave, onRemove }: Props) {
  const support = pushSupport();
  // undefined while the browser is still being asked whether this device is subscribed.
  const [thisDevice, setThisDevice] = useState<string | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    currentDeviceId().then(
      (id) => live && setThisDevice(id),
      () => live && setThisDevice(null),
    );
    return () => {
      live = false;
    };
  }, []);

  const isOn = !!thisDevice && devices.some((d) => d.id === thisDevice);
  const others = devices.length - (isOn ? 1 : 0);
  const blocked = support === 'ok' && Notification.permission === 'denied';

  const turnOn = async () => {
    setBusy(true);
    setError('');
    try {
      const device = await subscribeDevice();
      onSave(device);
      setThisDevice(device.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not turn reminders on.');
    } finally {
      setBusy(false);
    }
  };

  const turnOff = async () => {
    setBusy(true);
    setError('');
    try {
      const id = (await unsubscribeDevice()) ?? thisDevice;
      if (id) onRemove(id);
      setThisDevice(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not turn reminders off.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13px] leading-snug text-muted">
        One notification each morning when something is coming up: a couple of days before a bill is due, and again on the day. Bills you've marked paid
        are skipped.
      </p>

      {support === 'needs-install' && (
        <p className="rounded-xl bg-surface-2 p-3 text-[13px] leading-snug text-muted-2">
          On iPhone and iPad, reminders only work from the Home Screen app. In Safari, tap Share, then Add to Home Screen, and open Ledgerly from there.
        </p>
      )}
      {support === 'unsupported' && <p className="rounded-xl bg-surface-2 p-3 text-[13px] leading-snug text-muted-2">This browser doesn't support notifications.</p>}
      {blocked && (
        <p className="rounded-xl bg-warn-bg p-3 text-[13px] leading-snug text-warn-fg">
          Notifications are blocked for Ledgerly. Allow them in your device settings, then come back here.
        </p>
      )}

      {support === 'ok' && !blocked && (
        <div className="flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-ink">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${isOn ? 'bg-[var(--color-ok-fg)]' : 'bg-track'}`} />
            <span className="truncate">{thisDevice === undefined ? 'Checking…' : isOn ? 'On for this device' : 'Off for this device'}</span>
          </span>
          <button
            onClick={isOn ? turnOff : turnOn}
            disabled={busy || thisDevice === undefined}
            className={`min-h-11 shrink-0 rounded-xl px-4 text-sm font-semibold disabled:opacity-50 ${isOn ? 'bg-surface-2 text-ink' : 'bg-accent text-ink'}`}
          >
            {busy ? 'Working…' : isOn ? 'Turn off' : 'Turn on reminders'}
          </button>
        </div>
      )}

      {others > 0 && (
        <p className="text-xs text-muted">
          Also on for {others} other device{others === 1 ? '' : 's'} signed in to this account.
        </p>
      )}
      {error && !blocked && (
        <p className="text-xs text-alert" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
