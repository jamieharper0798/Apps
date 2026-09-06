import { useEffect } from 'react';
import type { Branding } from '../types';

const APP_TAGLINE = 'Dopamine To-Do';
const APP_DESCRIPTION =
  'A modern to-do list that rewards you for getting things done: XP, streaks, and confetti on every task.';

function absoluteIconUrl(path: string) {
  // Cache-bust the default icons: browsers (and installed PWAs) cache icon URLs
  // aggressively, so a content-hash query param is what forces a refetch when
  // the underlying image changes even though the path stays the same.
  return `${window.location.origin}${import.meta.env.BASE_URL}${path}?v=${import.meta.env.VITE_ICON_VERSION}`;
}

/** Keeps the document title, favicon, and PWA manifest in sync with user branding. */
export function useBrandingMeta(branding: Branding) {
  useEffect(() => {
    document.title = `${branding.name} — ${APP_TAGLINE}`;

    let faviconLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!faviconLink) {
      faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      document.head.appendChild(faviconLink);
    }
    faviconLink.href = branding.icon192 ?? absoluteIconUrl('icons/icon-192.png');

    let appleTouchIconLink = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
    if (!appleTouchIconLink) {
      appleTouchIconLink = document.createElement('link');
      appleTouchIconLink.rel = 'apple-touch-icon';
      document.head.appendChild(appleTouchIconLink);
    }
    appleTouchIconLink.href = branding.icon192 ?? absoluteIconUrl('icons/apple-touch-icon.png');

    const hasCustomIcon = branding.icon192 && branding.icon512;
    const icons = hasCustomIcon
      ? [
          { src: branding.icon192!, sizes: '192x192', type: 'image/png' },
          { src: branding.icon512!, sizes: '512x512', type: 'image/png' },
          { src: branding.icon512!, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ]
      : [
          { src: absoluteIconUrl('icons/icon-192.png'), sizes: '192x192', type: 'image/png' },
          { src: absoluteIconUrl('icons/icon-512.png'), sizes: '512x512', type: 'image/png' },
          { src: absoluteIconUrl('icons/icon-maskable-192.png'), sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: absoluteIconUrl('icons/icon-maskable-512.png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ];

    // The manifest is served from a blob: URL below, and Chrome does not reliably
    // resolve relative/root-relative fields (start_url, scope, id) against a
    // blob: base — it silently rejects them as invalid, which blocks install
    // eligibility entirely. Using fully-qualified absolute URLs sidesteps that.
    const rootUrl = `${window.location.origin}${import.meta.env.BASE_URL}`;

    const manifest = {
      id: rootUrl,
      name: `${branding.name} — ${APP_TAGLINE}`,
      short_name: branding.name,
      description: APP_DESCRIPTION,
      theme_color: '#0b0a14',
      background_color: '#0b0a14',
      display: 'standalone',
      orientation: 'portrait',
      start_url: rootUrl,
      scope: rootUrl,
      icons,
    };

    const blobUrl = URL.createObjectURL(
      new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' }),
    );

    let manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }
    manifestLink.href = blobUrl;

    return () => {
      URL.revokeObjectURL(blobUrl);
    };
  }, [branding]);
}
