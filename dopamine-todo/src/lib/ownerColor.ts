const JAMIE_SWATCH = 'border-blue-400/40 text-blue-300';
const OTHER_SWATCH = 'border-red-400/40 text-red-300';
const JAMIE_AVATAR = 'bg-blue-400/20 text-blue-300';
const OTHER_AVATAR = 'bg-red-400/20 text-red-300';

function isJamie(owner: string): boolean {
  return owner.trim().toLowerCase() === 'jamie';
}

/** Outlined badge border+text color for an owner chip. Empty string for no owner (caller supplies a neutral/ghost style). */
export function ownerSwatchClasses(owner: string): string {
  if (!owner.trim()) return '';
  return isJamie(owner) ? JAMIE_SWATCH : OTHER_SWATCH;
}

/** Small avatar-circle color for an owner's initial. */
export function ownerAvatarClasses(owner: string): string {
  if (!owner.trim()) return 'bg-white/10 text-white/40';
  return isJamie(owner) ? JAMIE_AVATAR : OTHER_AVATAR;
}
