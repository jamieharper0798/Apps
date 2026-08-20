import { useCallback } from 'react';
import type { Branding } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { readImageFile, toIconDataUrls } from '../lib/image';

export const DEFAULT_BRANDING: Branding = {
  name: 'JH To Do List',
  icon192: null,
  icon512: null,
};

const MAX_NAME_LENGTH = 24;

export function useBranding() {
  const [branding, setBranding] = useLocalStorage<Branding>('dopamine-todo:branding', DEFAULT_BRANDING);

  const setName = useCallback(
    (name: string) => {
      const trimmed = name.trim().slice(0, MAX_NAME_LENGTH);
      setBranding((prev) => ({ ...prev, name: trimmed || DEFAULT_BRANDING.name }));
    },
    [setBranding],
  );

  const setIconFromFile = useCallback(
    async (file: File) => {
      const img = await readImageFile(file);
      const { icon192, icon512 } = toIconDataUrls(img);
      setBranding((prev) => ({ ...prev, icon192, icon512 }));
    },
    [setBranding],
  );

  const resetIcon = useCallback(() => {
    setBranding((prev) => ({ ...prev, icon192: null, icon512: null }));
  }, [setBranding]);

  const reset = useCallback(() => {
    setBranding(DEFAULT_BRANDING);
  }, [setBranding]);

  return { branding, setName, setIconFromFile, resetIcon, reset };
}
