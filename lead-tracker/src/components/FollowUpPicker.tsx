import { QUICK_FOLLOW_UPS, addDays, todayKey } from '../lib/dates';
import { inputClass } from './fields';

interface FollowUpPickerProps {
  value: string | null;
  onChange: (key: string | null) => void;
}

export function FollowUpPicker({ value, onChange }: FollowUpPickerProps) {
  const today = todayKey();
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {QUICK_FOLLOW_UPS.map((q) => {
          const key = addDays(today, q.days);
          return (
            <button
              key={q.days}
              type="button"
              onClick={() => onChange(key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition ${
                value === key ? 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/40' : 'text-white/45 ring-white/10 hover:text-white/80'
              }`}
            >
              {q.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition ${
            value === null ? 'bg-white/10 text-white/80 ring-white/20' : 'text-white/45 ring-white/10 hover:text-white/80'
          }`}
        >
          No reminder
        </button>
      </div>
      <input
        type="date"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className={`${inputClass} [color-scheme:dark]`}
        aria-label="Follow-up date"
      />
    </div>
  );
}
