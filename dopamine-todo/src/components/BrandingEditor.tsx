import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Branding } from '../types';
import { DEFAULT_ICON_512 } from '../lib/icons';

interface BrandingEditorProps {
  open: boolean;
  branding: Branding;
  onClose: () => void;
  onSaveName: (name: string) => void;
  onUploadIcon: (file: File) => Promise<void>;
  onResetIcon: () => void;
}

export function BrandingEditor({
  open,
  branding,
  onClose,
  onSaveName,
  onUploadIcon,
  onResetIcon,
}: BrandingEditorProps) {
  const [name, setName] = useState(branding.name);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
            <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">Customize</h2>
            <p className="mt-1 text-xs text-white/40">Make it yours — rename the app and set your own icon.</p>

            <div className="mt-5 flex items-center gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-[#c6ff4a]/40 bg-white/5"
                aria-label="Upload icon image"
              >
                <img src={branding.icon512 ?? DEFAULT_ICON_512} alt="" className="h-full w-full object-cover" />
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                  {uploading ? '...' : 'Change'}
                </span>
              </button>
              <div className="flex flex-1 flex-col gap-1.5">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-white/30 disabled:opacity-50"
                >
                  {uploading ? 'Uploading…' : 'Upload image'}
                </button>
                {branding.icon512 && (
                  <button
                    onClick={onResetIcon}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-white/40 transition hover:text-red-400"
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
            {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

            <label className="mt-5 block text-xs font-medium uppercase tracking-wide text-white/40">App name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              placeholder="JH To Do List"
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none transition focus:border-[#c6ff4a]/50 focus:shadow-[0_0_0_3px_#c6ff4a1a]"
            />

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm font-medium uppercase tracking-wide text-white/50 transition hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="rounded-lg border border-[#c6ff4a]/60 px-4 py-2 text-sm font-bold uppercase tracking-wide text-[#c6ff4a] transition hover:shadow-[0_0_16px_-6px_#c6ff4a] hover:bg-[#c6ff4a]/10"
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
