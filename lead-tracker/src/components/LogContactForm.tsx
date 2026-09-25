import { useState, type FormEvent } from 'react';
import type { Lead, LeadStatus } from '../types';
import type { ContactLog } from '../hooks/useLeads';
import { addDays, todayKey } from '../lib/dates';
import { isOpen } from '../lib/status';
import { Field, TextArea } from './fields';
import { StatusPicker } from './StatusPicker';
import { FollowUpPicker } from './FollowUpPicker';

interface LogContactFormProps {
  lead: Lead;
  onSubmit: (log: ContactLog) => void;
  onCancel: () => void;
}

export function LogContactForm({ lead, onSubmit, onCancel }: LogContactFormProps) {
  const [note, setNote] = useState('');
  // Reaching out to a brand-new lead naturally moves it to "Contacted".
  const [status, setStatus] = useState<LeadStatus>(lead.status === 'new' ? 'contacted' : lead.status);
  const [nextFollowUp, setNextFollowUp] = useState<string | null>(addDays(todayKey(), 3));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ note, status, nextFollowUp });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="How did it go?">
        <TextArea autoFocus value={note} onChange={(e) => setNote(e.target.value)} placeholder="Left a voicemail, sent pricing, booked a demo…" />
      </Field>
      <Field label="Status">
        <StatusPicker value={status} onChange={setStatus} />
      </Field>
      {isOpen(status) && (
        <Field label="Next reach-out">
          <FollowUpPicker value={nextFollowUp} onChange={setNextFollowUp} />
        </Field>
      )}
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="rounded-xl px-4 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white">
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-[0.98]"
        >
          Log contact
        </button>
      </div>
    </form>
  );
}
