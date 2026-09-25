import type { Lead } from '../types';
import { STATUS_META } from './status';

function cell(value: string | number | null) {
  const s = value == null ? '' : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function leadsToCsv(leads: Lead[]) {
  const header = ['Name', 'Company', 'Email', 'Phone', 'Source', 'Status', 'Value', 'Next follow-up', 'Last contacted', 'Added', 'Notes'];
  const rows = leads.map((l) => [
    l.name,
    l.company,
    l.email,
    l.phone,
    l.source,
    STATUS_META[l.status].label,
    l.value,
    l.nextFollowUp,
    l.lastContactedAt?.slice(0, 10) ?? null,
    l.createdAt.slice(0, 10),
    l.notes,
  ]);
  return [header, ...rows].map((r) => r.map(cell).join(',')).join('\n');
}

export function downloadCsv(leads: Lead[]) {
  const blob = new Blob([leadsToCsv(leads)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
