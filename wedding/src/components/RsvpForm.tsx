import { useState, type FormEvent, type ReactNode } from 'react';
import { submitRsvp } from '../lib/rsvp';

const inputClass =
  'w-full rounded-none border-0 border-b border-rule bg-transparent px-0 py-2.5 text-ink placeholder:text-ink-soft/50 focus:border-ink focus:outline-none';

export function RsvpForm({ invitedName }: { invitedName: string }) {
  const [name, setName] = useState(invitedName);
  const [email, setEmail] = useState('');
  const [attending, setAttending] = useState<boolean | null>(null);
  const [partySize, setPartySize] = useState(1);
  const [guestNames, setGuestNames] = useState('');
  const [dietary, setDietary] = useState('');
  const [song, setSong] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (attending === null) return;
    setStatus('sending');
    try {
      await submitRsvp({
        name: name.trim(),
        email: email.trim(),
        attending,
        partySize: attending ? partySize : 0,
        guestNames: attending ? guestNames.trim() : '',
        dietary: attending ? dietary.trim() : '',
        song: attending ? song.trim() : '',
        message: message.trim(),
      });
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className="rounded-sm bg-card text-ink px-6 py-12 text-center shadow-[0_40px_80px_-40px_rgba(0,0,0,0.6)]">
        <p className="font-display text-3xl italic">{attending ? 'See you there!' : "We'll miss you"}</p>
        <p className="mx-auto mt-3 max-w-sm text-ink-soft">
          {attending
            ? `Thank you, ${name.split(' ')[0]}. Your reply is saved and we can't wait to celebrate with you.`
            : `Thank you for letting us know, ${name.split(' ')[0]}. You'll be with us in spirit.`}
        </p>
        <button type="button" onClick={() => setStatus('idle')} className="mt-6 text-sm font-medium text-gold underline underline-offset-4 hover:text-ink">
          Change my answer
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-8 rounded-sm bg-card text-ink p-6 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.6)] sm:p-12"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="rsvp-name" label="Your name">
          <input id="rsvp-name" required maxLength={120} autoComplete="name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field id="rsvp-email" label="Email" hint="So we can send updates">
          <input id="rsvp-email" type="email" maxLength={200} autoComplete="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
      </div>

      <fieldset>
        <legend className="mb-3 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-ink-soft">Will you be there?</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <Choice checked={attending === true} onChange={() => setAttending(true)} label="Joyfully accepts" />
          <Choice checked={attending === false} onChange={() => setAttending(false)} label="Regretfully declines" />
        </div>
      </fieldset>

      {attending && (
        <>
          <div className="grid gap-6 sm:grid-cols-[10rem_1fr]">
            <Field id="rsvp-party" label="How many of you?">
              <select id="rsvp-party" className={inputClass} value={partySize} onChange={(e) => setPartySize(Number(e.target.value))}>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'person' : 'people'}
                  </option>
                ))}
              </select>
            </Field>
            {partySize > 1 && (
              <Field id="rsvp-guests" label="Who's coming with you?">
                <input id="rsvp-guests" maxLength={300} className={inputClass} placeholder="Their names" value={guestNames} onChange={(e) => setGuestNames(e.target.value)} />
              </Field>
            )}
          </div>
          <Field id="rsvp-diet" label="Dietary needs or allergies">
            <input id="rsvp-diet" maxLength={300} className={inputClass} placeholder="For example: vegetarian, no nuts" value={dietary} onChange={(e) => setDietary(e.target.value)} />
          </Field>
          <Field id="rsvp-song" label="A song that will get you dancing">
            <input id="rsvp-song" maxLength={200} className={inputClass} value={song} onChange={(e) => setSong(e.target.value)} />
          </Field>
        </>
      )}

      <Field id="rsvp-message" label="A note for us" hint="Optional">
        <textarea id="rsvp-message" rows={3} maxLength={1000} className={inputClass} value={message} onChange={(e) => setMessage(e.target.value)} />
      </Field>

      {status === 'error' && (
        <p className="text-sm text-[#9b3b3b]">Your reply didn't send. Check your internet connection and try again.</p>
      )}

      <button
        type="submit"
        disabled={attending === null || status === 'sending'}
        className="w-full rounded-full bg-ink px-8 py-4 sm:w-auto sm:justify-self-start text-sm font-medium uppercase tracking-[0.16em] text-paper transition hover:bg-ink/85 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {status === 'sending' ? 'Sending…' : 'Send my reply'}
      </button>
    </form>
  );
}

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="grid min-w-0 gap-1.5">
      <label htmlFor={id} className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-ink-soft">
        {label}
        {hint && <span className="ml-2 font-normal normal-case tracking-normal text-ink-soft/70">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function Choice({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-sm border px-4 py-3.5 transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold ${
        checked ? 'border-ink bg-ink text-paper' : 'border-rule bg-card hover:border-gold'
      }`}
    >
      <input type="radio" name="attending" className="sr-only" checked={checked} onChange={onChange} />
      <span className={`h-3 w-3 rotate-45 border ${checked ? 'border-gold bg-gold' : 'border-gold'}`} />
      <span className="font-display text-lg italic">{label}</span>
    </label>
  );
}
