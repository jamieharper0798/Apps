import type { LeadStatus } from '../types';

export const STATUSES: { id: LeadStatus; label: string; pill: string; dot: string }[] = [
  { id: 'new', label: 'New', pill: 'bg-sky-500/15 text-sky-300 ring-sky-400/30', dot: 'bg-sky-400' },
  { id: 'contacted', label: 'Contacted', pill: 'bg-violet-500/15 text-violet-300 ring-violet-400/30', dot: 'bg-violet-400' },
  { id: 'follow-up', label: 'Follow-up', pill: 'bg-amber-500/15 text-amber-300 ring-amber-400/30', dot: 'bg-amber-400' },
  { id: 'qualified', label: 'Qualified', pill: 'bg-teal-500/15 text-teal-300 ring-teal-400/30', dot: 'bg-teal-400' },
  { id: 'won', label: 'Won', pill: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30', dot: 'bg-emerald-400' },
  { id: 'lost', label: 'Lost', pill: 'bg-slate-500/15 text-slate-400 ring-slate-400/25', dot: 'bg-slate-500' },
];

export const STATUS_META = Object.fromEntries(STATUSES.map((s) => [s.id, s])) as Record<
  LeadStatus,
  (typeof STATUSES)[number]
>;

/** Won/lost leads are closed: they no longer need follow-ups. */
export function isOpen(status: LeadStatus) {
  return status !== 'won' && status !== 'lost';
}
