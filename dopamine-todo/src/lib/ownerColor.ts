const JAMIE_SWATCH = 'bg-blue-400/15 text-blue-300';
const OTHER_SWATCH = 'bg-red-400/15 text-red-300';
const JAMIE_AVATAR = 'bg-blue-400/30 text-blue-200';
const OTHER_AVATAR = 'bg-red-400/30 text-red-200';

function isJamie(owner: string): boolean {
  return owner.trim().toLowerCase() === 'jamie';
}

/** Pill background + text color for an owner chip. Empty string for no owner (caller supplies a neutral/ghost style). */
export function ownerSwatchClasses(owner: string): string {
  if (!owner.trim()) return '';
  return isJamie(owner) ? JAMIE_SWATCH : OTHER_SWATCH;
}

/** Small avatar-circle color for an owner's initial. */
export function ownerAvatarClasses(owner: string): string {
  if (!owner.trim()) return 'bg-white/10 text-white/40';
  return isJamie(owner) ? JAMIE_AVATAR : OTHER_AVATAR;
}
