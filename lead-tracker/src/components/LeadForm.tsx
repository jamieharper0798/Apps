import { useState, type FormEvent } from 'react';
import type { LeadDraft } from '../types';
import { addDays, todayKey } from '../lib/dates';
import { isOpen } from '../lib/status';
import { Field, TextArea, TextInput } from './fields';
import { StatusPicker } from './StatusPicker';
import { FollowUpPicker } from './FollowUpPicker';

interface LeadFormProps {
  initial?: LeadDraft;
  submitLabel: string;
  onSubmit: (draft: LeadDraft) => void;
  onCancel: () => void;
}

function emptyDraft(): LeadDraft {
  return {
    name: '',
    company: '',
    email: '',
    phone: '',
    source: '',
    value: null,
    status: 'new',
    nextFollowUp: addDays(todayKey(), 1),
    notes: '',
  };
}

export function LeadForm({ initial, submitLabel, onSubmit, onCancel }: LeadFormProps) {
  const [draft, setDraft] = useState<LeadDraft>(initial ?? emptyDraft);
  const set = <K extends keyof LeadDraft>(key: K, value: LeadDraft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    onSubmit({
      ...draft,
      name: draft.name.trim(),
      company: draft.company.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      source: draft.source.trim(),
      notes: draft.notes.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name *">
          <TextInput autoFocus required value={draft.name} onChange={(e) => set('name', e.target.value)} placeholder="Jane Smith" />
        </Field>
        <Field label="Company">
          <TextInput value={draft.company} onChange={(e) => set('company', e.target.value)} placeholder="Acme Ltd" />
        </Field>
        <Field label="Email">
          <TextInput type="email" inputMode="email" value={draft.email} onChange={(e) => set('email', e.target.value)} placeholder="jane@acme.com" />
        </Field>
        <Field label="Phone">
          <TextInput type="tel" inputMode="tel" value={draft.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+44 7700 900123" />
        </Field>
        <Field label="Where you found them">
          <TextInput value={draft.source} onChange={(e) => set('source', e.target.value)} placeholder="LinkedIn, referral, event…" list="lead-sources" />
          <datalist id="lead-sources">
            {['LinkedIn', 'Referral', 'Event', 'Website', 'Cold call', 'Email', 'Social media'].map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </Field>
        <Field label="Estimated value">
          <TextInput
            type="number"
            inputMode="numeric"
            min={0}
            value={draft.value ?? ''}
            onChange={(e) => set('value', e.target.value === '' ? null : Math.max(0, Number(e.target.value)))}
            placeholder="0"
          />
        </Field>
      </div>

      <Field label="Status">
        <StatusPicker value={draft.status} onChange={(s) => set('status', s)} />
      </Field>

      {isOpen(draft.status) && (
        <Field label="Remind me to reach out">
          <FollowUpPicker value={draft.nextFollowUp} onChange={(k) => set('nextFollowUp', k)} />
        </Field>
      )}

      <Field label="Notes">
        <TextArea value={draft.notes} onChange={(e) => set('notes', e.target.value)} placeholder="What do they need? What did you talk about?" />
      </Field>

      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="rounded-xl px-4 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white">
          Cancel
        </button>
        <button
          type="submit"
          disabled={!draft.name.trim()}
          className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-40"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
