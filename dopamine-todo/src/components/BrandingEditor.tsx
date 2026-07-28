import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Branding } from '../types';

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
            className="glass w-full max-w-sm rounded-3xl p-6"
          >
            <h2 className="font-display text-lg font-bold text-white">Customize</h2>
            <p className="mt-1 text-xs text-white/40">Make it yours — rename the app and set your own icon.</p>

            <div className="mt-5 flex items-center gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10"
                aria-label="Upload icon image"
              >
                {branding.icon512 ? (
                  <img src={branding.icon512} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl">⚡</span>
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                  {uploading ? '...' : 'Change'}
                </span>
              </button>
              <div className="flex flex-1 flex-col gap-1.5">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/15 disabled:opacity-50"
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

            <label className="mt-5 block text-xs font-medium text-white/40">App name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              placeholder="Flow"
              className="mt-1.5 w-full rounded-xl bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none ring-1 ring-white/10 focus:ring-purple-400/50"
            />

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-sm font-medium text-white/50 transition hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white"
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
