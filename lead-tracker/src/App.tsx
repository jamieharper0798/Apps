import { useEffect, useMemo, useState } from 'react';
import type { Lead, LeadStatus } from './types';
import { useLeads } from './hooks/useLeads';
import { useLocalStorage } from './hooks/useLocalStorage';
import { STATUSES, isOpen } from './lib/status';
import { addDays, todayKey } from './lib/dates';
import { downloadCsv } from './lib/csv';
import { Stats } from './components/Stats';
import { LeadCard } from './components/LeadCard';
import { Modal } from './components/Modal';
import { LeadForm } from './components/LeadForm';
import { LogContactForm } from './components/LogContactForm';
import { InstallButton } from './components/InstallButton';
import { UpdateToast } from './components/UpdateToast';
import { inputClass } from './components/fields';

type View = 'follow-ups' | 'all';
type Sort = 'recent' | 'follow-up' | 'value' | 'name';

type Dialog = { kind: 'add' } | { kind: 'edit'; id: string } | { kind: 'contact'; id: string } | null;

function Section({ title, tone, leads, render }: { title: string; tone: string; leads: Lead[]; render: (l: Lead) => React.ReactNode }) {
  if (leads.length === 0) return null;
  return (
    <section className="space-y-2.5">
      <h2 className="flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wider text-white/40">
        <span className={`h-1.5 w-1.5 rounded-full ${tone}`} />
        {title}
        <span className="text-white/25">{leads.length}</span>
      </h2>
      {leads.map(render)}
    </section>
  );
}

function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 px-6 py-14 text-center">
      <p className="font-display text-lg font-semibold text-white/85">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-white/45">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

const byFollowUp = (a: Lead, b: Lead) => (a.nextFollowUp ?? '9999').localeCompare(b.nextFollowUp ?? '9999');

function App() {
  const { leads, addLead, editLead, logContact, addNote, snooze, deleteLead } = useLeads();
  const [view, setView] = useLocalStorage<View>('lead-tracker:view', 'follow-ups');
  const [sort, setSort] = useLocalStorage<Sort>('lead-tracker:sort', 'recent');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [query, setQuery] = useState('');
  const [dialog, setDialog] = useState<Dialog>(null);

  const today = todayKey();
  const weekOut = addDays(today, 7);
  const openLeads = useMemo(() => leads.filter((l) => isOpen(l.status)), [leads]);
  const overdue = openLeads.filter((l) => l.nextFollowUp && l.nextFollowUp < today).sort(byFollowUp);
  const dueToday = openLeads.filter((l) => l.nextFollowUp === today);
  const upcoming = openLeads.filter((l) => l.nextFollowUp && l.nextFollowUp > today && l.nextFollowUp <= weekOut).sort(byFollowUp);
  const noReminder = openLeads.filter((l) => !l.nextFollowUp);
  const dueCount = overdue.length + dueToday.length;

  // Show the number of leads due on the installed app's icon, where supported.
  useEffect(() => {
    const nav = navigator as Navigator & { setAppBadge?: (n: number) => Promise<void>; clearAppBadge?: () => Promise<void> };
    (dueCount > 0 ? nav.setAppBadge?.(dueCount) : nav.clearAppBadge?.())?.catch(() => {});
  }, [dueCount]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = leads.filter(
      (l) =>
        (statusFilter === 'all' || l.status === statusFilter) &&
        (!q || [l.name, l.company, l.email, l.phone, l.source, l.notes].some((f) => f.toLowerCase().includes(q))),
    );
    const sorters: Record<Sort, (a: Lead, b: Lead) => number> = {
      recent: (a, b) => b.createdAt.localeCompare(a.createdAt),
      'follow-up': byFollowUp,
      value: (a, b) => (b.value ?? 0) - (a.value ?? 0),
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return list.sort(sorters[sort]);
  }, [leads, query, statusFilter, sort]);

  const dialogLead = dialog && dialog.kind !== 'add' ? leads.find((l) => l.id === dialog.id) : undefined;
  const closeDialog = () => setDialog(null);

  const renderLead = (lead: Lead) => (
    <LeadCard
      key={lead.id}
      lead={lead}
      onLogContact={() => setDialog({ kind: 'contact', id: lead.id })}
      onEdit={() => setDialog({ kind: 'edit', id: lead.id })}
      onDelete={() => deleteLead(lead.id)}
      onSnooze={(key) => snooze(lead.id, key)}
      onAddNote={(text) => addNote(lead.id, text)}
    />
  );

  const addButton = (
    <button
      onClick={() => setDialog({ kind: 'add' })}
      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-[0.98]"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" d="M12 5v14M5 12h14" />
      </svg>
      Add lead
    </button>
  );

  return (
    <div className="mx-auto min-h-full max-w-3xl px-4 pb-32 pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-6">
      <header className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}icons/icon-192.png`} alt="" className="h-10 w-10 rounded-xl" />
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-white">Lead Tracker</h1>
            <p className="text-xs text-white/40">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <InstallButton />
          <div className="hidden sm:block">{addButton}</div>
        </div>
      </header>

      <Stats leads={leads} />

      <nav className="mt-6 flex items-center gap-1 rounded-2xl bg-white/[0.03] p-1 ring-1 ring-white/[0.06]" aria-label="View">
        {(
          [
            { id: 'follow-ups', label: 'Follow-ups', count: dueCount },
            { id: 'all', label: 'All leads', count: leads.length },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            aria-pressed={view === tab.id}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition ${
              view === tab.id ? 'bg-white/10 text-white shadow' : 'text-white/45 hover:text-white/75'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`rounded-full px-1.5 text-[11px] tabular-nums ${
                  tab.id === 'follow-ups' ? 'bg-amber-400/20 text-amber-300' : 'bg-white/10 text-white/60'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>

      <main className="mt-5">
        {leads.length === 0 ? (
          <EmptyState
            title="Track your first lead"
            body="Add anyone you've found who could become a customer. Set a reminder and they'll show up here when it's time to reach back out."
            action={addButton}
          />
        ) : view === 'follow-ups' ? (
          <div className="space-y-7">
            {dueCount === 0 && (
              <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.06] px-4 py-3.5 text-sm text-emerald-200/85">
                🎉 You're all caught up — nobody is waiting on you today.
              </div>
            )}
            <Section title="Overdue" tone="bg-rose-400" leads={overdue} render={renderLead} />
            <Section title="Today" tone="bg-amber-400" leads={dueToday} render={renderLead} />
            <Section title="Coming up this week" tone="bg-sky-400" leads={upcoming} render={renderLead} />
            <Section title="No reminder set" tone="bg-white/30" leads={noReminder} render={renderLead} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, company, notes…"
                className={inputClass}
              />
              <div className="flex gap-2">
                <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={`${inputClass} sm:w-44 [color-scheme:dark]`} aria-label="Sort by">
                  <option value="recent">Newest first</option>
                  <option value="follow-up">Next follow-up</option>
                  <option value="value">Highest value</option>
                  <option value="name">Name A–Z</option>
                </select>
                <button
                  onClick={() => downloadCsv(filtered)}
                  title="Export these leads as CSV"
                  className="shrink-0 rounded-xl px-3 text-sm font-medium text-white/60 ring-1 ring-white/10 transition hover:bg-white/5 hover:text-white"
                >
                  Export
                </button>
              </div>
            </div>
            <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
              {[{ id: 'all' as const, label: 'All', dot: 'bg-white/40' }, ...STATUSES].map((s) => {
                const count = s.id === 'all' ? leads.length : leads.filter((l) => l.status === s.id).length;
                return (
                  <button
                    key={s.id}
                    onClick={() => setStatusFilter(s.id)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition ${
                      statusFilter === s.id ? 'bg-white/10 text-white ring-white/20' : 'text-white/45 ring-white/10 hover:text-white/80'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                    {s.label}
                    <span className="text-white/30">{count}</span>
                  </button>
                );
              })}
            </div>
            {filtered.length === 0 ? (
              <EmptyState title="No matching leads" body="Try a different search or status filter." />
            ) : (
              <div className="space-y-2.5">{filtered.map(renderLead)}</div>
            )}
          </div>
        )}
      </main>

      {/* Thumb-reachable add button on phones */}
      <button
        onClick={() => setDialog({ kind: 'add' })}
        aria-label="Add lead"
        className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-5 z-30 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500 text-emerald-950 shadow-xl shadow-emerald-500/30 transition active:scale-95 sm:hidden"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {dialog?.kind === 'add' && (
        <Modal title="New lead" onClose={closeDialog}>
          <LeadForm
            submitLabel="Add lead"
            onCancel={closeDialog}
            onSubmit={(draft) => {
              addLead(draft);
              closeDialog();
            }}
          />
        </Modal>
      )}
      {dialog?.kind === 'edit' && dialogLead && (
        <Modal title={`Edit ${dialogLead.name}`} onClose={closeDialog}>
          <LeadForm
            initial={dialogLead}
            submitLabel="Save changes"
            onCancel={closeDialog}
            onSubmit={(draft) => {
              editLead(dialogLead.id, draft);
              closeDialog();
            }}
          />
        </Modal>
      )}
      {dialog?.kind === 'contact' && dialogLead && (
        <Modal title={`Reached out to ${dialogLead.name}`} onClose={closeDialog}>
          <LogContactForm
            lead={dialogLead}
            onCancel={closeDialog}
            onSubmit={(log) => {
              logContact(dialogLead.id, log);
              closeDialog();
            }}
          />
        </Modal>
      )}

      <UpdateToast />
    </div>
  );
}

export default App;
