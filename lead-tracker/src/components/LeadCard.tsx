import { useState, type FormEvent, type ReactNode } from 'react';
import type { ActivityKind, Lead } from '../types';
import { STATUS_META, isOpen } from '../lib/status';
import { addDays, diffDays, followUpLabel, timeAgo, todayKey } from '../lib/dates';
import { formatMoney, initials } from '../lib/format';
import { inputClass } from './fields';

interface LeadCardProps {
  lead: Lead;
  onLogContact: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSnooze: (key: string) => void;
  onAddNote: (text: string) => void;
}

const ACTIVITY_ICON: Record<ActivityKind, string> = {
  created: '✦',
  contacted: '☎',
  note: '✎',
  status: '⇄',
};

function followUpTone(key: string) {
  const diff = diffDays(todayKey(), key);
  if (diff < 0) return 'bg-rose-500/15 text-rose-300 ring-rose-400/30';
  if (diff === 0) return 'bg-amber-500/15 text-amber-300 ring-amber-400/30';
  return 'bg-white/5 text-white/55 ring-white/10';
}

function IconLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <a
      href={href}
      onClick={(e) => e.stopPropagation()}
      aria-label={label}
      title={label}
      className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-white/60 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
    >
      {children}
    </a>
  );
}

export function LeadCard({ lead, onLogContact, onEdit, onDelete, onSnooze, onAddNote }: LeadCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const status = STATUS_META[lead.status];
  const open = isOpen(lead.status);

  const submitNote = (e: FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    onAddNote(note.trim());
    setNote('');
  };

  return (
    <article className="animate-rise rounded-2xl border border-white/[0.07] bg-white/[0.03] transition hover:border-white/15">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget && (e.preventDefault(), setExpanded((v) => !v))}
        className="flex cursor-pointer items-start gap-3 p-4"
      >
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-400/25 to-teal-500/10 font-display text-sm font-semibold text-emerald-200 ring-1 ring-emerald-400/20">
          {initials(lead.name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="truncate font-display text-[15px] font-semibold text-white">{lead.name}</h3>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${status.pill}`}>{status.label}</span>
          </div>
          <p className="mt-0.5 truncate text-sm text-white/45">
            {[lead.company, lead.source && `via ${lead.source}`].filter(Boolean).join(' · ') || 'No company'}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
            {open && lead.nextFollowUp && (
              <span className={`rounded-full px-2 py-0.5 font-medium ring-1 ${followUpTone(lead.nextFollowUp)}`}>
                ⏰ {followUpLabel(lead.nextFollowUp)}
              </span>
            )}
            {open && !lead.nextFollowUp && <span className="rounded-full px-2 py-0.5 text-white/35 ring-1 ring-white/10">No reminder set</span>}
            {lead.value != null && lead.value > 0 && (
              <span className="rounded-full px-2 py-0.5 font-medium text-emerald-300/90 ring-1 ring-emerald-400/20">{formatMoney(lead.value)}</span>
            )}
            <span className="px-1 text-white/30">
              {lead.lastContactedAt ? `Last contact ${timeAgo(lead.lastContactedAt)}` : `Added ${timeAgo(lead.createdAt)}`}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {lead.phone && (
            <IconLink href={`tel:${lead.phone.replace(/[^\d+]/g, '')}`} label={`Call ${lead.name}`}>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
              </svg>
            </IconLink>
          )}
          {lead.email && (
            <IconLink href={`mailto:${lead.email}`} label={`Email ${lead.name}`}>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="m3 7 9 6 9-6" />
              </svg>
            </IconLink>
          )}
        </div>
      </div>

      {open && (
        <div className="flex flex-wrap items-center gap-2 px-4 pb-4">
          <button
            onClick={onLogContact}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-emerald-950 shadow-md shadow-emerald-500/15 transition hover:bg-emerald-400 active:scale-[0.97]"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 5 5L20 7" />
            </svg>
            I reached out
          </button>
          <span className="hidden text-[11px] text-white/30 sm:inline">or snooze</span>
          {[
            { label: '+1 day', days: 1 },
            { label: '+1 week', days: 7 },
          ].map((s) => (
            <button
              key={s.days}
              // Snooze from whichever is later, so an overdue lead lands in the future rather than still overdue.
              onClick={() => {
                const today = todayKey();
                const base = lead.nextFollowUp && lead.nextFollowUp > today ? lead.nextFollowUp : today;
                onSnooze(addDays(base, s.days));
              }}
              className="rounded-xl px-2.5 py-2 text-xs font-medium text-white/55 ring-1 ring-white/10 transition hover:bg-white/5 hover:text-white"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {expanded && (
        <div className="animate-fade space-y-4 border-t border-white/[0.06] px-4 py-4">
          {(lead.email || lead.phone) && (
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              {lead.email && (
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-white/35">Email</dt>
                  <dd className="truncate text-white/80">{lead.email}</dd>
                </div>
              )}
              {lead.phone && (
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-white/35">Phone</dt>
                  <dd className="text-white/80">{lead.phone}</dd>
                </div>
              )}
            </dl>
          )}

          {lead.notes && <p className="whitespace-pre-wrap rounded-xl bg-white/[0.03] p-3 text-sm text-white/70">{lead.notes}</p>}

          <form onSubmit={submitNote} className="flex gap-2">
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note…" className={inputClass} />
            <button
              type="submit"
              disabled={!note.trim()}
              className="shrink-0 rounded-xl bg-white/10 px-3.5 text-sm font-medium text-white transition hover:bg-white/15 disabled:opacity-30"
            >
              Add
            </button>
          </form>

          <ol className="space-y-2.5">
            {lead.activity.map((a) => (
              <li key={a.id} className="flex gap-2.5 text-sm">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/5 text-[10px] text-white/50">
                  {ACTIVITY_ICON[a.kind]}
                </span>
                <div className="min-w-0">
                  <p className="whitespace-pre-wrap text-white/75">{a.text}</p>
                  <p className="text-[11px] text-white/30">
                    {new Date(a.at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="flex items-center justify-end gap-2">
            {confirmDelete ? (
              <>
                <span className="text-xs text-white/50">Delete this lead?</span>
                <button onClick={() => setConfirmDelete(false)} className="rounded-lg px-3 py-1.5 text-xs text-white/60 hover:bg-white/5">
                  Keep
                </button>
                <button onClick={onDelete} className="rounded-lg bg-rose-500/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500">
                  Delete
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setConfirmDelete(true)} className="rounded-lg px-3 py-1.5 text-xs text-rose-300/70 hover:bg-rose-500/10 hover:text-rose-300">
                  Delete
                </button>
                <button onClick={onEdit} className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 ring-1 ring-white/10 hover:bg-white/10">
                  Edit details
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
