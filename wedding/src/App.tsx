import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { wedding } from './wedding';
import { RsvpForm } from './components/RsvpForm';

// The couple's page pulls in Firebase sign-in, so guests never download it.
const GuestList = lazy(() => import('./components/GuestList').then((m) => ({ default: m.GuestList })));

const weddingDate = new Date(wedding.date);

function formatLongDate(d: Date) {
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function daysUntil(d: Date) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(d);
  end.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

// Personal invite links look like ...?to=Aunt%20Mary and greet that guest by name.
function invitedGuest() {
  return new URLSearchParams(window.location.search).get('to')?.trim().slice(0, 80) ?? '';
}

function useHash() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

const nav = [
  ['day', 'The day'],
  ['travel', 'Travel'],
  ['stay', 'Stay'],
  ['faq', 'Questions'],
  ['rsvp', 'RSVP'],
] as const;

export default function App() {
  const hash = useHash();
  if (hash === '#guests')
    return (
      <Suspense fallback={null}>
        <GuestList />
      </Suspense>
    );

  const guest = invitedGuest();
  const days = daysUntil(weddingDate);
  const [first, second] = wedding.couple;
  const rsvpBy = new Date(wedding.rsvpBy).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([wedding.venue.name, ...wedding.venue.address].join(', '))}`;

  return (
    <div className="px-4">
      <nav className="sticky top-0 z-10 -mx-4 border-b border-rule/70 bg-paper/90 px-4 backdrop-blur">
        <ul className="mx-auto flex max-w-3xl gap-x-5 sm:justify-center gap-y-1 overflow-x-auto py-3 text-[0.8rem] font-medium uppercase tracking-[0.14em] text-ink-soft sm:gap-x-8">
          {nav.map(([id, label]) => (
            <li key={id} className="shrink-0">
              <a href={`#${id}`} className={id === 'rsvp' ? 'text-gold hover:text-ink' : 'hover:text-ink'}>
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <figure className="-mx-4 m-0">
        <img
          src={`${import.meta.env.BASE_URL}venue.jpg`}
          srcSet={`${import.meta.env.BASE_URL}venue-small.jpg 900w, ${import.meta.env.BASE_URL}venue.jpg 1620w`}
          sizes="100vw"
          alt={`${wedding.venue.name}, seen across the lawn on a sunny day`}
          className="block h-[clamp(16rem,55vw,34rem)] w-full object-cover object-[center_45%]"
        />
      </figure>

      <header className="mx-auto max-w-3xl pb-16 pt-14 text-center sm:pt-20">
        <p className="eyebrow">{guest ? `Dear ${guest}, you're invited` : "You're invited to the wedding of"}</p>
        <h1 className="mt-8 font-display text-[clamp(3.25rem,13vw,7rem)] font-normal leading-[0.95] tracking-tight">
          {first}
          <span className="my-2 block font-display text-[0.55em] italic text-gold sm:my-0 sm:inline sm:px-5">&amp;</span>
          {second}
        </h1>
        <div className="mx-auto mt-10 flex max-w-md items-center gap-4 text-ink-soft">
          <span className="h-px flex-1 bg-rule" />
          <p className="text-sm uppercase tracking-[0.18em]">{wedding.town}</p>
          <span className="h-px flex-1 bg-rule" />
        </div>
        <p className="mt-6 font-display text-2xl italic sm:text-3xl">{formatLongDate(weddingDate)}</p>
        {days > 0 && (
          <p className="mt-3 text-sm text-ink-soft">
            <span className="font-semibold tabular-nums text-ink">{days}</span> {days === 1 ? 'day' : 'days'} to go
          </p>
        )}
        {days === 0 && <p className="mt-3 text-sm font-semibold text-ink">It's today!</p>}
        <a
          href="#rsvp"
          className="mt-10 inline-block rounded-full bg-ink px-8 py-3.5 text-sm font-medium uppercase tracking-[0.16em] text-paper transition hover:bg-ink/85"
        >
          RSVP by {rsvpBy}
        </a>
      </header>

      <main className="mx-auto max-w-3xl">
        <Section id="day" eyebrow="The day" title="What's happening when">
          <ol className="relative border-l border-rule pl-6 sm:pl-8">
            {wedding.schedule.map((item) => (
              <li key={item.time} className="relative pb-7 last:pb-0">
                <span className="absolute -left-[1.85rem] top-1.5 h-2.5 w-2.5 rotate-45 border border-gold bg-paper sm:-left-[2.35rem]" />
                <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-6">
                  <p className="w-24 shrink-0 font-display text-lg italic tabular-nums text-gold">{item.time}</p>
                  <div className="min-w-0">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-ink-soft">{item.detail}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="travel" eyebrow="Travel" title={wedding.venue.name}>
          <div className="grid gap-8 sm:grid-cols-[1fr_1.4fr]">
            <div>
              <address className="not-italic leading-relaxed">
                {wedding.venue.address.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
              <a href={mapUrl} target="_blank" rel="noreferrer" className="mt-4 inline-block border-b border-gold pb-0.5 text-sm font-medium text-ink hover:text-gold">
                Open in Google Maps
              </a>
              <p className="mt-5 text-ink-soft">{wedding.venue.notes}</p>
            </div>
            <dl className="grid gap-5">
              {wedding.travel.map((t) => (
                <div key={t.title}>
                  <dt className="font-medium">{t.title}</dt>
                  <dd className="text-ink-soft">{t.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Section>

        <Section id="stay" eyebrow="Where to stay" title="Places nearby">
          <div className="grid gap-8 sm:grid-cols-2">
            {wedding.stay.map((s) => (
              <div key={s.name}>
                <p className="font-display text-xl">{s.name}</p>
                <p className="mt-1 text-sm uppercase tracking-[0.12em] text-gold">{s.distance}</p>
                <p className="mt-2 text-ink-soft">{s.note}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="dress" eyebrow="Dress code" title={wedding.dressCode.title}>
          <p className="max-w-prose text-ink-soft">{wedding.dressCode.body}</p>
          <h3 className="eyebrow mt-10">Gifts</h3>
          <p className="mt-3 max-w-prose text-ink-soft">{wedding.gifts}</p>
        </Section>

        <Section id="faq" eyebrow="Questions" title="Good to know">
          <div className="divide-y divide-rule border-y border-rule">
            {wedding.faq.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                  {f.q}
                  <span className="font-display text-xl text-gold transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 max-w-prose text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-6 text-ink-soft">
            Anything else? Get in touch: <span className="select-all text-ink">{wedding.contact}</span>
          </p>
        </Section>

        <Section id="rsvp" eyebrow="RSVP" title={`Please reply by ${rsvpBy}`}>
          <RsvpForm invitedName={guest} />
        </Section>
      </main>

      <footer className="mx-auto max-w-3xl py-16 text-center">
        <p className="font-display text-3xl italic text-gold">
          {first[0]} &amp; {second[0]}
        </p>
        <p className="mt-2 text-sm text-ink-soft">{formatLongDate(weddingDate)}</p>
      </footer>
    </div>
  );
}

function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-16 border-t border-rule py-14 sm:py-20">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mb-8 mt-3 font-display text-3xl sm:text-4xl">{title}</h2>
      {children}
    </section>
  );
}
