import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Branding } from '../types';
import { DEFAULT_ICON_512 } from '../lib/icons';

const ACCENT_PRESETS = ['#c6ff4a', '#4cc9f0', '#ffb703', '#ff4fa3', '#5b8cff', '#ff6b5b'];

interface BrandingEditorProps {
  open: boolean;
  branding: Branding;
  onClose: () => void;
  onSaveName: (name: string) => void;
  onUploadIcon: (file: File) => Promise<void>;
  onResetIcon: () => void;
  onAccentColorChange: (color: string | null) => void;
}

export function BrandingEditor({
  open,
  branding,
  onClose,
  onSaveName,
  onUploadIcon,
  onResetIcon,
  onAccentColorChange,
}: BrandingEditorProps) {
  const [name, setName] = useState(branding.name);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const accentColor = branding.accentColor ?? '#c6ff4a';

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    setError(null);
    setUploading(true);
    try {
      await onUploadIcon(file);
    } catch {
      setError('Could not load that image — try a different file.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    onSaveName(name);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="panel w-full max-w-sm rounded-2xl p-6"
          >
            <h2 className="font-display text-xl font-bold tracking-tight text-ink">Customize</h2>
            <p className="mt-1 text-xs text-ink/40">Make it yours — rename the app and set your own icon.</p>

            <div className="mt-5 flex items-center gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-accent/40 bg-ink/5"
                aria-label="Upload icon image"
              >
                <img src={branding.icon512 ?? DEFAULT_ICON_512} alt="" className="h-full w-full object-cover" />
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-[10px] font-semibold text-ink opacity-0 transition group-hover:opacity-100">
                  {uploading ? '...' : 'Change'}
                </span>
              </button>
              <div className="flex flex-1 flex-col gap-1.5">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="rounded-lg border border-ink/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink transition hover:border-ink/30 disabled:opacity-50"
                >
                  {uploading ? 'Uploading…' : 'Upload image'}
                </button>
                {branding.icon512 && (
                  <button
                    onClick={onResetIcon}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-ink/40 transition hover:text-danger"
                  >
                    Remove image
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />
            </div>
            {error && <p className="mt-2 text-xs text-danger">{error}</p>}

            <label className="mt-5 block text-xs font-medium uppercase tracking-wide text-ink/40">Accent color</label>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {ACCENT_PRESETS.map((color) => (
                <button
                  key={color}
                  onClick={() => onAccentColorChange(color)}
                  aria-label={`Use ${color} as the accent color`}
                  className="h-7 w-7 shrink-0 rounded-full transition active:scale-95 hover:scale-110"
                  style={{
                    backgroundColor: color,
                    boxShadow: accentColor.toLowerCase() === color ? `0 0 0 2px var(--panel), 0 0 0 4px ${color}` : 'none',
                  }}
                />
              ))}
              <button
                onClick={() => colorInputRef.current?.click()}
                aria-label="Choose a custom accent color"
                title="Custom color"
                className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-dashed border-ink/25 text-ink/40 transition active:scale-95 hover:border-ink/40 hover:text-ink/70"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                </svg>
                <input
                  ref={colorInputRef}
                  type="color"
                  value={accentColor}
                  onChange={(e) => onAccentColorChange(e.target.value)}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </button>
            </div>

            <label className="mt-5 block text-xs font-medium uppercase tracking-wide text-ink/40">App name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              placeholder="JH To Do List"
              className="mt-1.5 w-full rounded-lg border border-ink/10 bg-ink/5 px-3 py-2 text-sm text-ink placeholder-ink/30 outline-none transition focus:border-accent/50 focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_10%,transparent)]"
            />

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium uppercase tracking-wide text-ink/50 transition hover:text-ink"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="rounded-lg border border-accent/60 px-4 py-2 text-sm font-bold uppercase tracking-wide text-accent transition active:scale-95 hover:shadow-[0_0_16px_-6px_var(--accent)] hover:bg-accent/10"
              >
                Save
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
