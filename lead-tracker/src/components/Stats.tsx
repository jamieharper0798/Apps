import type { Lead } from '../types';
import { isOpen } from '../lib/status';
import { todayKey } from '../lib/dates';
import { formatMoney } from '../lib/format';

export function Stats({ leads }: { leads: Lead[] }) {
  const today = todayKey();
  const open = leads.filter((l) => isOpen(l.status));
  const due = open.filter((l) => l.nextFollowUp && l.nextFollowUp <= today).length;
  const pipeline = open.reduce((sum, l) => sum + (l.value ?? 0), 0);
  const won = leads.filter((l) => l.status === 'won').length;

  const tiles = [
    { label: 'Due to reach out', value: String(due), accent: due > 0 ? 'text-amber-300' : 'text-white' },
    { label: 'Open leads', value: String(open.length), accent: 'text-white' },
    { label: 'Pipeline value', value: formatMoney(pipeline), accent: 'text-emerald-300' },
    { label: 'Won', value: String(won), accent: 'text-white' },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {tiles.map((t) => (
        <div key={t.label} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
          <p className={`font-display text-2xl font-semibold tabular-nums ${t.accent}`}>{t.value}</p>
          <p className="mt-0.5 text-xs text-white/40">{t.label}</p>
        </div>
      ))}
    </div>
  );
}
