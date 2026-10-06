export function absoluteIconUrl(path: string) {
  // Cache-bust the default icons: browsers (and installed PWAs) cache icon URLs
  // aggressively, so a content-hash query param is what forces a refetch when
  // the underlying image changes even though the path stays the same.
  return `${window.location.origin}${import.meta.env.BASE_URL}${path}?v=${import.meta.env.VITE_ICON_VERSION}`;
}

/** The app's default icons (used whenever the user hasn't uploaded a custom one). */
export const DEFAULT_ICON_192 = absoluteIconUrl('icons/icon-192.png');
export const DEFAULT_ICON_512 = absoluteIconUrl('icons/icon-512.png');
