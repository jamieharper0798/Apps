import type { LeadStatus } from '../types';
import { STATUSES } from '../lib/status';

interface StatusPickerProps {
  value: LeadStatus;
  onChange: (status: LeadStatus) => void;
}

export function StatusPicker({ value, onChange }: StatusPickerProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {STATUSES.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onChange(s.id)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition ${
            value === s.id ? s.pill : 'text-white/45 ring-white/10 hover:text-white/80'
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
