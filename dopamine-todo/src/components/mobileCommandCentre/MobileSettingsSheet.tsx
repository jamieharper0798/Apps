import { useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { User } from 'firebase/auth';
import type { Branding } from '../../types';
import { ACCENT_SWATCHES, accentName, DEFAULT_ACCENT_HEX, accentTokens } from '../../lib/accent';
import { DEFAULT_ICON_192 } from '../../lib/icons';
import { isFirebaseConfigured } from '../../lib/firebase';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import { MobileSheet } from './MobileSheet';

interface MobileSettingsSheetProps {
  open: boolean;
  onClose: () => void;
  branding: Branding;
  onSaveName: (name: string) => void;
  onUploadIcon: (file: File) => Promise<void>;
  onResetIcon: () => void;
  onAccentColorChange: (color: string | null) => void;
  user: User | null;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
  onSignOut: () => void;
  syncing: boolean;
  syncError: boolean;
  soundOn: boolean;
  onToggleSound: () => void;
}

export function MobileSettingsSheet({
  open,
  onClose,
  branding,
  onSaveName,
  onUploadIcon,
  onResetIcon,
  onAccentColorChange,
  user,
  onSignIn,
  onSignUp,
  onSignOut,
  syncing,
  syncError,
  soundOn,
  onToggleSound,
}: MobileSettingsSheetProps) {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authOpen, setAuthOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const accentColor = branding.accentColor ?? DEFAULT_ACCENT_HEX;
  const accent = accentTokens(accentColor);
  const avatarInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'J';

  const syncLong = !user ? 'On this phone only' : syncError ? 'Sync error' : syncing ? 'Syncing…' : `Synced as ${user.email}`;
  const syncDot = !user ? 'rgba(29,26,22,.3)' : syncError ? 'var(--cc-red-dot)' : syncing ? '#c9a227' : 'var(--cc-green-dot)';

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      await onUploadIcon(file);
    } finally {
      setUploading(false);
    }
  };

  const submitAuth = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      if (authMode === 'signin') await onSignIn(email, pw);
      else await onSignUp(email, pw);
      setEmail('');
      setPw('');
      setAuthOpen(false);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  const { canInstall, iosHint, promptInstall } = useInstallPrompt();

  return (
    <MobileSheet open={open} onClose={onClose} ariaLabel="Settings" tall>
      <div className="flex items-center justify-between px-1">
        <h2 className="m-0 text-[22px] font-bold tracking-tight text-cc-ink">Settings</h2>
        <button onClick={onClose} className="min-h-10 rounded-full bg-[#1d1a16] px-4 text-sm font-semibold text-white transition active:scale-95">
          Done
        </button>
      </div>

      {isFirebaseConfigured && (
        <section className="flex flex-col gap-1.5">
          <h3 className="m-0 pl-2 text-xs font-bold uppercase tracking-wide text-cc-ink-2">Account &amp; sync</h3>
          <div className="flex flex-col gap-3 rounded-[20px] bg-white p-3.5">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1d1a16] text-[17px] font-bold text-white">
                {avatarInitial}
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[16px] font-bold text-cc-ink">{user?.email ? 'Signed in' : 'Jamie'}</span>
                <span className="flex items-center gap-1.5 truncate text-[13px] text-cc-ink-2">
                  <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: syncDot }} />
                  {syncLong}
                </span>
              </div>
            </div>

            {user ? (
              <button onClick={onSignOut} className="min-h-[46px] rounded-2xl bg-cc-ink/[0.07] text-sm font-semibold text-cc-ink transition active:scale-95">
                Sign out
              </button>
            ) : authOpen ? (
              <form onSubmit={submitAuth} className="flex flex-col gap-2.5">
                <span className="text-[15px] font-bold text-cc-ink">{authMode === 'signin' ? 'Sign in' : 'Create account'}</span>
                <div className="flex flex-col gap-1">
                  <label htmlFor="mcc-email" className="text-xs font-bold text-cc-ink-2">
                    Email
                  </label>
                  <input
                    id="mcc-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                    className="min-h-[46px] rounded-xl border border-cc-ink/[0.18] bg-white px-3.5 text-base text-cc-ink outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="mcc-pw" className="text-xs font-bold text-cc-ink-2">
                    Password
                  </label>
                  <input
                    id="mcc-pw"
                    type="password"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'}
                    minLength={6}
                    required
                    className="min-h-[46px] rounded-xl border border-cc-ink/[0.18] bg-white px-3.5 text-base text-cc-ink outline-none"
                  />
                </div>
                {authError && <p className="m-0 text-xs text-[#9a2f1d]">{authError}</p>}
                <button type="submit" className="min-h-[48px] rounded-2xl bg-[#1d1a16] text-[15px] font-bold text-white transition active:scale-[0.98]">
                  {authMode === 'signin' ? 'Sign in' : 'Create account'}
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode((m) => (m === 'signin' ? 'signup' : 'signin'))}
                  className="min-h-10 bg-transparent text-[13px] font-semibold text-cc-ink-2"
                >
                  {authMode === 'signin' ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
                </button>
              </form>
            ) : (
              <>
                <p className="m-0 text-sm text-cc-ink-2">Sign in to sync your to-do list across devices. Without an account, tasks are saved on this phone only.</p>
                <button onClick={() => setAuthOpen(true)} className="min-h-[48px] rounded-2xl bg-[#1d1a16] text-[15px] font-bold text-white transition active:scale-[0.98]">
                  Sign in
                </button>
              </>
            )}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-1.5">
        <h3 className="m-0 pl-2 text-xs font-bold uppercase tracking-wide text-cc-ink-2">App name, icon &amp; colour</h3>
        <div className="flex flex-col gap-3.5 rounded-[20px] bg-white p-3.5">
          <div className="flex flex-col gap-1">
            <label htmlFor="mcc-appname" className="text-xs font-bold text-cc-ink-2">
              App name
            </label>
            <input
              id="mcc-appname"
              defaultValue={branding.name}
              onBlur={(e) => onSaveName(e.target.value)}
              maxLength={30}
              placeholder="JH To Do List"
              className="min-h-[46px] rounded-xl border border-cc-ink/[0.18] bg-white px-3.5 text-base text-cc-ink outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
            {branding.icon192 ? (
              <img src={branding.icon192} alt="App icon" className="h-14 w-14 shrink-0 rounded-2xl object-cover shadow-[0_4px_12px_rgba(0,0,0,.15)]" />
            ) : (
              <span role="img" aria-label="Default app icon" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#1d1a16]">
                <img src={DEFAULT_ICON_192} alt="" className="h-9 w-9 rounded-full object-cover" />
              </span>
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="text-[13px] text-cc-ink-2">Shown on your home screen.</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="min-h-10 rounded-full bg-[#1d1a16] px-3.5 text-[13px] font-semibold text-white transition active:scale-95 disabled:opacity-50"
                >
                  {uploading ? 'Uploading…' : 'Change icon'}
                </button>
                {branding.icon192 && (
                  <button onClick={onResetIcon} className="min-h-10 rounded-full bg-cc-ink/[0.07] px-3.5 text-[13px] font-semibold text-cc-ink transition active:scale-95">
                    Reset
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" aria-label="Upload icon image" />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-cc-ink-2">Accent colour · {accentName(accentColor)}</span>
            <div className="flex flex-wrap gap-2">
              {ACCENT_SWATCHES.map(({ name, hex }) => {
                const pressed = accentColor.toLowerCase() === hex.toLowerCase();
                return (
                  <button
                    key={hex}
                    onClick={() => onAccentColorChange(hex)}
                    aria-label={`Use ${name}`}
                    aria-pressed={pressed}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 bg-white transition active:scale-95"
                    style={{ borderColor: pressed ? hex : 'rgba(29,26,22,.12)' }}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-extrabold text-white" style={{ background: hex }}>
                      {pressed ? '✓' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-1.5">
        <h3 className="m-0 pl-2 text-xs font-bold uppercase tracking-wide text-cc-ink-2">Preferences</h3>
        <div className="flex flex-col overflow-hidden rounded-[20px] bg-white">
          <button
            onClick={onToggleSound}
            role="switch"
            aria-checked={soundOn}
            className="flex min-h-14 items-center justify-between gap-3 px-3.5 text-left"
          >
            <span className="flex flex-col gap-0.5">
              <span className="text-[15px] font-semibold text-cc-ink">Sound effects</span>
              <span className="text-xs text-cc-ink-2">Chime on complete, fanfare on level up</span>
            </span>
            <span aria-hidden="true" className="relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors" style={{ background: soundOn ? accent.solid : 'rgba(29,26,22,.18)' }}>
              <span
                className="absolute top-0.5 h-[27px] w-[27px] rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,.2)] transition-all"
                style={{ left: soundOn ? '22px' : '2px' }}
              />
            </span>
          </button>
          <div className="mx-3.5 h-px bg-cc-ink/[0.08]" />
          <div className="flex min-h-14 items-center justify-between gap-3 px-3.5">
            <span className="flex flex-col gap-0.5">
              <span className="text-[15px] font-semibold text-cc-ink">Celebrations</span>
              <span className="text-xs text-cc-ink-2">Confetti and a pep-talk toast on every task</span>
            </span>
            <span className="text-[13px] text-cc-ink-2">On</span>
          </div>
          <div className="mx-3.5 h-px bg-cc-ink/[0.08]" />
          <div className="flex min-h-14 items-center justify-between gap-3 px-3.5 text-[15px] font-semibold text-cc-ink">
            <span>Daily goal</span>
            <span className="text-[13px] text-cc-ink-2">5 tasks</span>
          </div>
        </div>
      </section>

      {(canInstall || iosHint) && (
        <section className="flex flex-col gap-1.5">
          <h3 className="m-0 pl-2 text-xs font-bold uppercase tracking-wide text-cc-ink-2">Install</h3>
          <div className="flex flex-col gap-2 rounded-[20px] bg-white p-3.5">
            <span className="text-[15px] font-bold text-cc-ink">Add {branding.name} to your home screen</span>
            {canInstall ? (
              <button onClick={promptInstall} className="min-h-[46px] rounded-2xl bg-[#1d1a16] text-sm font-semibold text-white transition active:scale-95">
                Install app
              </button>
            ) : (
              <ol className="m-0 flex flex-col gap-1 pl-5 text-sm text-cc-ink-2">
                <li>
                  In Safari, tap <strong className="text-cc-ink">Share</strong>.
                </li>
                <li>
                  Choose <strong className="text-cc-ink">Add to Home Screen</strong>.
                </li>
                <li>Open it from the icon for the full-screen app.</li>
              </ol>
            )}
          </div>
        </section>
      )}
    </MobileSheet>
  );
}
