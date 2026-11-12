export interface AccentSwatch {
  name: string;
  hex: string;
}

/** Same 6 presets the desktop BrandingEditor offers, now named so the mobile Settings sheet
    can show "Accent colour · {name}" and a readable aria-label per swatch. */
export const ACCENT_SWATCHES: AccentSwatch[] = [
  { name: 'Lime', hex: '#c6ff4a' },
  { name: 'Sky', hex: '#4cc9f0' },
  { name: 'Amber', hex: '#ffb703' },
  { name: 'Pink', hex: '#ff4fa3' },
  { name: 'Blue', hex: '#5b8cff' },
  { name: 'Coral', hex: '#ff6b5b' },
];

export const DEFAULT_ACCENT_HEX = ACCENT_SWATCHES[0].hex;

export function accentName(hex: string): string {
  return ACCENT_SWATCHES.find((a) => a.hex.toLowerCase() === hex.toLowerCase())?.name ?? 'Custom';
}

export interface AccentTokens {
  solid: string;
  gradient: string;
  orb: string;
  glow: string;
}

/** Derives the gradient/orb/glow treatments the mobile Command Centre needs from a single
    accent hex, using color-mix instead of hand-picked OKLCH triples per swatch — the app
    already relies on color-mix elsewhere (see index.css), so this stays consistent with that
    and works for any custom hex the user picks, not just the 6 presets. */
export function accentTokens(hex: string): AccentTokens {
  return {
    solid: hex,
    gradient: `linear-gradient(160deg, color-mix(in srgb, ${hex} 78%, white), color-mix(in srgb, ${hex} 72%, black))`,
    orb: `radial-gradient(circle at 35% 28%, color-mix(in srgb, ${hex} 45%, white) 0%, ${hex} 55%, color-mix(in srgb, ${hex} 65%, black) 100%)`,
    glow: `color-mix(in srgb, ${hex} 55%, transparent)`,
  };
}
