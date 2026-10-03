import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { fetchRsvps, latestPerGuest, type Rsvp } from '../lib/rsvp';

// Private page at #guests for the couple: every reply, totals, a CSV export and personal invite links.
export function GuestList() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Just for us</p>
          <h1 className="mt-2 font-display text-4xl">Guest replies</h1>
        </div>
        <div className="flex items-center gap-5 text-sm">
          <a href="#" className="text-ink-soft hover:text-ink">
            Back to the site
          </a>
          {user && (
            <button type="button" onClick={() => signOut(auth)} className="text-ink-soft hover:text-ink">
              Sign out
            </button>
          )}
        </div>
      </header>
      {user === undefined ? null : user ? <Replies user={user} /> : <SignIn />}
    </div>
  );
}

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setError('Incorrect email or password.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid max-w-sm gap-4">
      <p className="text-ink-soft">Sign in with the same account you use for your to-do app.</p>
      <input id="gl-email" type="email" required placeholder="Email" autoComplete="email" className="rounded-lg border border-rule bg-card px-3.5 py-2.5" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input id="gl-password" type="password" required placeholder="Password" autoComplete="current-password" className="rounded-lg border border-rule bg-card px-3.5 py-2.5" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="text-sm text-[#9b3b3b]">{error}</p>}
      <button type="submit" className="justify-self-start rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-paper hover:bg-ink/85">
        Sign in
      </button>
    </form>
  );
}

function Replies({ user }: { user: User }) {
  const [rsvps, setRsvps] = useState<Rsvp[] | null>(null);
  const [denied, setDenied] = useState(false);

  const load = useCallback(async () => {
    try {
      setRsvps(latestPerGuest(await fetchRsvps()));
      setDenied(false);
    } catch (err) {
      if ((err as { code?: string }).code === 'permission-denied') setDenied(true);
      else throw err;
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (denied) {
    return (
      <div className="max-w-xl rounded-2xl border border-gold-soft bg-card p-6">
        <p className="font-medium">This account can't see the replies yet.</p>
        <p className="mt-2 text-ink-soft">
          Add this account ID to the <code>weddingRsvps</code> rule in the Firebase console (see the README), publish the rules, then refresh this page.
        </p>
        <p className="mt-4 select-all break-all rounded-lg bg-paper px-3 py-2 font-mono text-sm">{user.uid}</p>
      </div>
    );
  }
  if (!rsvps) return <p className="text-ink-soft">Loading replies…</p>;

  const yes = rsvps.filter((r) => r.attending);
  const no = rsvps.filter((r) => !r.attending);
  const headcount = yes.reduce((sum, r) => sum + r.partySize, 0);
  const dietary = yes.filter((r) => r.dietary);

  return (
    <div className="grid gap-12">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-rule bg-rule sm:grid-cols-4">
        <Stat label="People coming" value={headcount} />
        <Stat label="Replies: yes" value={yes.length} />
        <Stat label="Replies: no" value={no.length} />
        <Stat label="Dietary notes" value={dietary.length} />
      </dl>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl">All replies</h2>
          <div className="flex gap-4 text-sm font-medium">
            <button type="button" onClick={load} className="text-ink-soft hover:text-ink">
              Refresh
            </button>
            <button type="button" onClick={() => downloadCsv(rsvps)} disabled={!rsvps.length} className="text-gold hover:text-ink disabled:opacity-40">
              Download CSV
            </button>
          </div>
        </div>
        {rsvps.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-rule p-8 text-center text-ink-soft">
            No replies yet. Send out some invite links below and they'll appear here.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-rule bg-card">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead className="border-b border-rule text-xs uppercase tracking-[0.12em] text-ink-soft">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Reply</th>
                  <th className="px-4 py-3 font-medium">Party</th>
                  <th className="px-4 py-3 font-medium">Dietary</th>
                  <th className="px-4 py-3 font-medium">Song</th>
                  <th className="px-4 py-3 font-medium">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule align-top">
                {rsvps.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{r.name}</p>
                      {r.email && <p className="text-ink-soft">{r.email}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${r.attending ? 'bg-ink text-paper' : 'bg-rule text-ink-soft'}`}>
                        {r.attending ? 'Coming' : 'Not coming'}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {r.attending ? r.partySize : '–'}
                      {r.guestNames && <p className="text-ink-soft">{r.guestNames}</p>}
                    </td>
                    <td className="px-4 py-3">{r.dietary || '–'}</td>
                    <td className="px-4 py-3">{r.song || '–'}</td>
                    <td className="max-w-xs px-4 py-3 text-ink-soft">{r.message || '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <InviteLinkMaker />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card px-5 py-4">
      <dt className="text-xs uppercase tracking-[0.12em] text-ink-soft">{label}</dt>
      <dd className="mt-1 font-display text-3xl tabular-nums">{value}</dd>
    </div>
  );
}

function InviteLinkMaker() {
  const [name, setName] = useState('');
  const [copied, setCopied] = useState(false);
  const base = `${window.location.origin}${window.location.pathname}`;
  const link = name.trim() ? `${base}?to=${encodeURIComponent(name.trim())}` : base;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the link is selectable text, so it can still be copied by hand.
    }
  };

  return (
    <section className="max-w-2xl">
      <h2 className="font-display text-2xl">Make an invite link</h2>
      <p className="mt-2 text-ink-soft">The site greets the guest by name and fills it in on their RSVP. Leave it blank for a general link.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <input
          id="invite-name"
          placeholder="Guest name, for example Aunt Mary"
          className="min-w-0 flex-1 rounded-lg border border-rule bg-card px-3.5 py-2.5"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="button" onClick={copy} className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-paper hover:bg-ink/85">
          {copied ? 'Copied' : 'Copy link'}
        </button>
      </div>
      <p className="mt-3 select-all break-all text-sm text-ink-soft">{link}</p>
    </section>
  );
}

function downloadCsv(rsvps: Rsvp[]) {
  const cols = ['name', 'email', 'attending', 'partySize', 'guestNames', 'dietary', 'song', 'message', 'createdAt'] as const;
  const cell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = rsvps.map((r) =>
    cols.map((c) => cell(c === 'attending' ? (r.attending ? 'yes' : 'no') : c === 'createdAt' ? r.createdAt?.toISOString() : r[c])).join(','),
  );
  const blob = new Blob([[cols.join(','), ...rows].join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'wedding-rsvps.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}
