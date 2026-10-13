const JAMIE_SWATCH = 'border-info/40 text-info';
const OTHER_SWATCH = 'border-danger/40 text-danger';
const JAMIE_AVATAR = 'bg-info/20 text-info';
const OTHER_AVATAR = 'bg-danger/20 text-danger';

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
  if (!owner.trim()) return 'bg-ink/10 text-ink/40';
  return isJamie(owner) ? JAMIE_AVATAR : OTHER_AVATAR;
}
