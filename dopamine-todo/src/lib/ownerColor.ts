interface OwnerStyle {
  bg: string;
  text: string;
  ring: string;
}

const OWNER_PALETTE: OwnerStyle[] = [
  { bg: 'bg-rose-400/15', text: 'text-rose-300', ring: 'focus:ring-rose-400/40' },
  { bg: 'bg-orange-400/15', text: 'text-orange-300', ring: 'focus:ring-orange-400/40' },
  { bg: 'bg-amber-400/15', text: 'text-amber-300', ring: 'focus:ring-amber-400/40' },
  { bg: 'bg-lime-400/15', text: 'text-lime-300', ring: 'focus:ring-lime-400/40' },
  { bg: 'bg-emerald-400/15', text: 'text-emerald-300', ring: 'focus:ring-emerald-400/40' },
  { bg: 'bg-teal-400/15', text: 'text-teal-300', ring: 'focus:ring-teal-400/40' },
  { bg: 'bg-sky-400/15', text: 'text-sky-300', ring: 'focus:ring-sky-400/40' },
  { bg: 'bg-indigo-400/15', text: 'text-indigo-300', ring: 'focus:ring-indigo-400/40' },
  { bg: 'bg-fuchsia-400/15', text: 'text-fuchsia-300', ring: 'focus:ring-fuchsia-400/40' },
  { bg: 'bg-pink-400/15', text: 'text-pink-300', ring: 'focus:ring-pink-400/40' },
];

/** Deterministically maps an owner name to the same palette color every time, so the same person always reads as the same color across tasks. */
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function ownerFieldClasses(owner: string): string {
  const key = owner.trim().toLowerCase();
  if (!key) return 'bg-white/5 text-white/70 focus:bg-white/10 focus:ring-purple-400/40';

  const style = OWNER_PALETTE[hashString(key) % OWNER_PALETTE.length];
  return `${style.bg} ${style.text} focus:bg-white/10 ${style.ring}`;
}
