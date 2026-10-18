import { useState, type FormEvent } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

// Guests share one login. The username they type maps to a Firebase email/password account,
// e.g. JamieandHannah2027 → jamieandhannah2027@jamie-and-hannah-2027.web.app. Anyone typing a full email signs in as themselves.
const LOGIN_DOMAIN = 'jamie-and-hannah-2027.web.app';

function toEmail(username: string) {
  const u = username.trim().toLowerCase();
  return u.includes('@') ? u : `${u}@${LOGIN_DOMAIN}`;
}

// Personal invite links (?to=Mary Smith) greet the guest by first name on the way in.
function invitedFirstName() {
  return new URLSearchParams(window.location.search).get('to')?.trim().split(/\s+/)[0]?.slice(0, 40) ?? '';
}

export function SignInGate() {
  const guest = invitedFirstName();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'signing-in' | 'wrong' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('signing-in');
    try {
      await signInWithEmailAndPassword(auth, toEmail(username), password);
    } catch (err) {
      const code = (err as { code?: string }).code ?? '';
      setStatus(code === 'auth/network-request-failed' ? 'error' : 'wrong');
    }
  };

  const inputClass =
    'w-full rounded-none border-0 border-b border-white/40 bg-transparent px-0 py-2.5 text-white placeholder:text-white/40 focus:border-white focus:outline-none';

  return (
    <main className="relative isolate flex min-h-svh items-center justify-center overflow-hidden px-4 py-16 text-white">
      <img
        src={`${import.meta.env.BASE_URL}venue.jpg`}
        srcSet={`${import.meta.env.BASE_URL}venue-small.jpg 900w, ${import.meta.env.BASE_URL}venue.jpg 1620w`}
        sizes="100vw"
        alt=""
        className="hero-photo absolute inset-0 -z-10 h-full w-full object-cover object-[50%_40%]"
      />
      <div className="absolute inset-0 -z-10 bg-[rgba(16,26,21,0.5)]" />

      <div className="w-full max-w-sm text-center">
        <p className="intro-invited font-display text-[clamp(2rem,8vw,2.75rem)] italic leading-tight text-gold-light">
          {guest ? `${guest}, you're invited` : "You're invited"}
        </p>
        <p className="intro-step-1 mt-4 text-[0.72rem] font-medium uppercase tracking-[0.32em] text-white/80">to the wedding of</p>
        <h1 className="intro-step-2 mt-5 font-display text-[clamp(3rem,13vw,4.5rem)] font-normal leading-[0.95] tracking-[-0.02em]">
          Jamie
          <span className="block font-light italic text-gold-light">&amp;</span>
          Hannah
        </h1>
        <form
          onSubmit={handleSubmit}
          className="intro-step-3 mt-10 grid gap-6 rounded-sm border border-white/15 bg-[rgba(12,20,16,0.6)] p-6 text-left shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)] backdrop-blur-md sm:p-8"
        >
          <p className="text-center text-white/80">Sign in with the username and password from your invitation.</p>
          <div className="grid gap-1.5">
            <label htmlFor="gate-username" className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-white/70">
              Username
            </label>
            <input
              id="gate-username"
              required
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              className={inputClass}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="gate-password" className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-white/70">
              Password
            </label>
            <input
              id="gate-password"
              type="password"
              required
              autoComplete="current-password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {status === 'wrong' && <p className="text-sm text-[#f3c7c0]">That username or password isn't right. Check your invitation and try again.</p>}
          {status === 'error' && <p className="text-sm text-[#f3c7c0]">Couldn't connect. Check your internet connection and try again.</p>}

          <button
            type="submit"
            disabled={status === 'signing-in'}
            className="mt-2 w-full rounded-full bg-white px-8 py-4 text-sm font-medium uppercase tracking-[0.16em] text-ink transition hover:bg-gold-light disabled:opacity-50"
          >
            {status === 'signing-in' ? 'Signing in…' : 'Enter'}
          </button>
        </form>
      </div>
    </main>
  );
}
