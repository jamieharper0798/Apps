import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';

export const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-emerald-400/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-emerald-400/20';

export function Field({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-white/50">{label}</span>
      {children}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ''}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={`${inputClass} resize-none ${props.className ?? ''}`} />;
}
