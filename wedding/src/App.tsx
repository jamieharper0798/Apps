import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { wedding } from './wedding';
import { RsvpForm } from './components/RsvpForm';

// The couple's page pulls in Firebase sign-in, so guests never download it.
const GuestList = lazy(() => import('./components/GuestList').then((m) => ({ default: m.GuestList })));

const weddingDate = new Date(wedding.date);
const base = import.meta.env.BASE_URL;

// Placeholder lines still marked TODO in wedding.ts stay off the page until they're filled in.
const isFilled = (...text: string[]) => !text.some((t) => t.includes('TODO'));

function formatLongDate(d: Date) {
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
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

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);
  const ms = Math.max(0, target.getTime() - now);
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor(ms / 3_600_000) % 24,
    minutes: Math.floor(ms / 60_000) % 60,
    done: ms === 0,
  };
}

const nav = [
  ['day', 'The day'],
  ['travel', 'Travel'],
  ['stay', 'Stay'],
  ['faq', 'Questions'],
] as const;

export default function App() {
  const hash = useHash();
  if (hash === '#guests')
    return (
      <Suspense fallback={null}>
        <GuestList />
      </Suspense>
    );
  return <Site />;
}

function Site() {
  const guest = invitedGuest();
  const [first, second] = wedding.couple;
  const rsvpBy = new Date(wedding.rsvpBy).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  const time = weddingDate.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(':00', '').replace(' ', '');
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([wedding.venue.name, ...wedding.venue.address].join(', '))}`;
  const countdown = useCountdown(weddingDate);

  // The bar sits clear over the photo, then turns solid once the photo has scrolled away.
  const heroRef = useRef<HTMLElement>(null);
  const [overHero, setOverHero] = useState(true);
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOverHero(e.isIntersecting), { rootMargin: '-72px 0px 0px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const travel = wedding.travel.filter((t) => isFilled(t.body));
  const stay = wedding.stay.filter((s) => isFilled(s.name, s.distance, s.note));

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-20 transition-colors duration-500 ${
          overHero ? 'bg-transparent text-white' : 'border-b border-rule/80 bg-paper/90 text-ink backdrop-blur-md'
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3.5 sm:px-8">
          <a href="#top" className="font-display text-xl italic tracking-tight">
            {first[0]}
            <span className={overHero ? 'text-white/70' : 'text-gold'}>&amp;</span>
            {second[0]}
          </a>
          <div className="flex items-center gap-7 text-[0.72rem] font-medium uppercase tracking-[0.2em]">
            {nav.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="hidden opacity-80 transition hover:opacity-100 md:inline">
                {label}
              </a>
            ))}
            <a
              href="#rsvp"
              className={`rounded-full border px-4 py-2 transition ${
                overHero ? 'border-white/60 hover:bg-white hover:text-ink' : 'border-ink hover:bg-ink hover:text-paper'
              }`}
            >
              RSVP
            </a>
          </div>
        </div>
      </nav>

      <header ref={heroRef} id="top" className="relative isolate flex min-h-[clamp(34rem,94svh,62rem)] items-end overflow-hidden text-white">
        <img
          src={`${base}venue.jpg`}
          srcSet={`${base}venue-small.jpg 900w, ${base}venue.jpg 1620w`}
          sizes="100vw"
          alt={`${wedding.venue.name}, seen across the lawn on a sunny day`}
          className="hero-photo absolute inset-0 -z-10 h-full w-full object-cover object-[50%_40%]"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(16,26,21,0.45)_0%,rgba(16,26,21,0)_22%,rgba(16,26,21,0.1)_45%,rgba(16,26,21,0.78)_100%)]" />
        <div className="hero-text mx-auto w-full max-w-6xl px-4 pb-14 text-center sm:px-8 sm:pb-20">
          <p className="mx-auto max-w-xs text-[0.72rem] font-medium uppercase tracking-[0.32em] text-white/85 sm:max-w-none">
            {guest ? `${guest}, you're invited to the wedding of` : 'Together with their families'}
          </p>
          <h1 className="mt-6 font-display text-[clamp(3.5rem,12vw,9rem)] font-normal leading-[0.9] tracking-[-0.02em]">
            {first}
            <span className="mx-[0.18em] inline-block font-light italic text-gold-light max-sm:my-1 max-sm:block">&amp;</span>
            {second}
          </h1>
          <p className="mt-7 text-sm uppercase tracking-[0.3em] text-white/90">
            {weddingDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            <span className="mx-3 text-gold-light max-sm:hidden">·</span>
            <span className="max-sm:mt-2 max-sm:block">{wedding.venue.name}</span>
          </p>
        </div>
      </header>

      <section aria-label="The essentials" className="border-b border-rule bg-card">
        <dl className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-rule px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8">
          <Essential label="When" value={formatLongDate(weddingDate)} detail={`Ceremony at ${time}`} />
          <Essential label="Where" value={wedding.venue.name} detail={wedding.town} />
          {countdown.done ? (
            <Essential label="Today" value="It's here!" detail="See you soon" />
          ) : (
            <div className="py-7 text-center sm:px-6">
              <dt className="eyebrow">Counting down</dt>
              <dd className="mt-2 flex items-baseline justify-center gap-4 font-display tabular-nums">
                <Unit n={countdown.days} label="days" />
                <Unit n={countdown.hours} label="hours" />
                <Unit n={countdown.minutes} label="mins" />
              </dd>
            </div>
          )}
        </dl>
      </section>

      <main className="px-4 sm:px-8">
        <Section id="day" eyebrow="The day" title="Order of the day">
          <ol className="divide-y divide-rule border-y border-rule">
            {wedding.schedule.map((item) => (
              <li key={item.time} className="grid grid-cols-[5.5rem_1fr] items-baseline gap-4 py-5 sm:grid-cols-[8rem_1fr] sm:py-6">
                <p className="font-display text-xl italic tabular-nums text-gold sm:text-2xl">{item.time}</p>
                <div className="min-w-0">
                  <p className="text-lg font-medium">{item.title}</p>
                  <p className="mt-0.5 text-ink-soft">{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="travel" eyebrow="Getting there" title={wedding.venue.name}>
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <address className="font-display text-xl not-italic leading-snug">
                {wedding.venue.address.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
              <a href={mapUrl} target="_blank" rel="noreferrer" className="link-arrow mt-5">
                Open in Google Maps
              </a>
              <p className="mt-6 text-ink-soft">{wedding.venue.notes}</p>
            </div>
            <dl className="grid content-start gap-6">
              {travel.map((t) => (
                <div key={t.title}>
                  <dt className="eyebrow">{t.title}</dt>
                  <dd className="mt-1.5 text-ink-soft">{t.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Section>

        <Section id="stay" eyebrow="Where to stay" title="Staying over">
          <div className={`grid gap-6 ${stay.length > 1 ? 'md:grid-cols-2' : ''}`}>
            {stay.map((s) => (
              <div key={s.name} className="rounded-sm border border-rule bg-card p-6 sm:p-8">
                <p className="eyebrow">{s.distance}</p>
                <p className="mt-2 font-display text-2xl">{s.name}</p>
                <p className="mt-3 text-ink-soft">{s.note}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="dress" eyebrow="Dress code" title={wedding.dressCode.title}>
          <div className="grid gap-10 md:grid-cols-2">
            <p className="text-ink-soft">{wedding.dressCode.body}</p>
            <div>
              <p className="eyebrow">Gifts</p>
              <p className="mt-2 text-ink-soft">{wedding.gifts}</p>
            </div>
          </div>
        </Section>

        <Section id="faq" eyebrow="Questions" title="Good to know">
          <div className="divide-y divide-rule border-y border-rule">
            {wedding.faq.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg">
                  {f.q}
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-rule text-gold transition group-open:rotate-45 group-open:border-gold">
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-prose text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
          {isFilled(wedding.contact) && (
            <p className="mt-8 text-ink-soft">
              Anything else? Get in touch: <span className="select-all text-ink">{wedding.contact}</span>
            </p>
          )}
        </Section>
      </main>

      <section id="rsvp" className="scroll-mt-16 bg-ink px-4 py-20 text-paper sm:px-8 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="eyebrow text-gold-light">RSVP</p>
            <h2 className="mt-4 font-display text-4xl sm:text-5xl">Will you join us?</h2>
            <p className="mt-4 text-paper/70">Kindly reply by {rsvpBy}.</p>
          </div>
          <div className="mt-12">
            <RsvpForm invitedName={guest} />
          </div>
        </div>
      </section>

      <footer className="bg-ink px-4 pb-16 text-center text-paper/60">
        <div className="mx-auto mb-6 h-px max-w-xs bg-paper/15" />
        <p className="font-display text-4xl italic text-gold-light">
          {first[0]}&thinsp;&amp;&thinsp;{second[0]}
        </p>
        <p className="mt-3 text-xs uppercase tracking-[0.3em]">{formatLongDate(weddingDate)}</p>
      </footer>
    </>
  );
}

function Essential({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="py-7 text-center sm:px-6">
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-2 font-display text-xl">{value}</dd>
      <dd className="mt-1 text-sm text-ink-soft">{detail}</dd>
    </div>
  );
}

function Unit({ n, label }: { n: number; label: string }) {
  return (
    <span className="flex flex-col items-center">
      <span className="text-3xl leading-none">{n}</span>
      <span className="mt-1.5 font-body text-[0.65rem] uppercase tracking-[0.2em] text-ink-soft">{label}</span>
    </span>
  );
}

function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="mx-auto grid max-w-6xl scroll-mt-16 gap-8 border-b border-rule py-16 last:border-b-0 sm:py-24 lg:grid-cols-[18rem_1fr] lg:gap-16">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-3 font-display text-4xl leading-tight sm:text-5xl lg:text-[2.75rem]">{title}</h2>
      </div>
      <div className="min-w-0 lg:pt-8">{children}</div>
    </section>
  );
}
