const JAMIE_CLASSES = 'bg-blue-400/15 text-blue-300 focus:bg-white/10 focus:ring-blue-400/40';
const OTHER_CLASSES = 'bg-red-400/15 text-red-300 focus:bg-white/10 focus:ring-red-400/40';
const EMPTY_CLASSES = 'bg-white/5 text-white/70 focus:bg-white/10 focus:ring-purple-400/40';

export function ownerFieldClasses(owner: string): string {
  const key = owner.trim().toLowerCase();
  if (!key) return EMPTY_CLASSES;
  return key === 'jamie' ? JAMIE_CLASSES : OTHER_CLASSES;
}
