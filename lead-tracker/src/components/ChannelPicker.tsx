import type { Channel } from '../types';
import { CHANNELS } from '../lib/channel';
import { ChannelIcon } from './ChannelIcon';

interface ChannelPickerProps {
  value: Channel;
  onChange: (channel: Channel) => void;
}

export function ChannelPicker({ value, onChange }: ChannelPickerProps) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-xl bg-white/[0.03] p-1 ring-1 ring-white/10" role="radiogroup">
      {CHANNELS.map((c) => (
        <button
          key={c.id}
          type="button"
          role="radio"
          aria-checked={value === c.id}
          onClick={() => onChange(c.id)}
          className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition ${
            value === c.id ? 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/40' : 'text-white/50 hover:text-white/80'
          }`}
        >
          <ChannelIcon channel={c.id} className="h-4 w-4" />
          {c.label}
        </button>
      ))}
    </div>
  );
}
