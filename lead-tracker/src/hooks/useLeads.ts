import { useCallback } from 'react';
import type { Activity, ActivityKind, Lead, LeadDraft, LeadStatus } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { STATUS_META, isOpen } from '../lib/status';

function uid() {
  return crypto.randomUUID();
}

function activity(kind: ActivityKind, text: string): Activity {
  return { id: uid(), at: new Date().toISOString(), kind, text };
}

export interface ContactLog {
  note: string;
  nextFollowUp: string | null;
  status: LeadStatus;
}

export function useLeads() {
  const [leads, setLeads] = useLocalStorage<Lead[]>('lead-tracker:v1', []);

  const update = useCallback(
    (id: string, fn: (lead: Lead) => Lead) =>
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...fn(l), updatedAt: new Date().toISOString() } : l))),
    [setLeads],
  );

  const addLead = useCallback(
    (draft: LeadDraft) => {
      const now = new Date().toISOString();
      const lead: Lead = {
        ...draft,
        id: uid(),
        createdAt: now,
        updatedAt: now,
        lastContactedAt: null,
        activity: [activity('created', draft.source ? `Lead added (source: ${draft.source})` : 'Lead added')],
      };
      setLeads((prev) => [lead, ...prev]);
    },
    [setLeads],
  );

  const editLead = useCallback(
    (id: string, draft: LeadDraft) =>
      update(id, (l) => ({
        ...l,
        ...draft,
        nextFollowUp: isOpen(draft.status) ? draft.nextFollowUp : null,
        activity:
          draft.status !== l.status
            ? [activity('status', `Status changed to ${STATUS_META[draft.status].label}`), ...l.activity]
            : l.activity,
      })),
    [update],
  );

  const logContact = useCallback(
    (id: string, { note, nextFollowUp, status }: ContactLog) =>
      update(id, (l) => {
        const entries = [activity('contacted', note.trim() || 'Reached out')];
        if (status !== l.status) entries.unshift(activity('status', `Status changed to ${STATUS_META[status].label}`));
        return {
          ...l,
          status,
          nextFollowUp: isOpen(status) ? nextFollowUp : null,
          lastContactedAt: new Date().toISOString(),
          activity: [...entries, ...l.activity],
        };
      }),
    [update],
  );

  const addNote = useCallback(
    (id: string, text: string) => update(id, (l) => ({ ...l, activity: [activity('note', text), ...l.activity] })),
    [update],
  );

  const snooze = useCallback(
    (id: string, nextFollowUp: string) => update(id, (l) => ({ ...l, nextFollowUp })),
    [update],
  );

  const deleteLead = useCallback((id: string) => setLeads((prev) => prev.filter((l) => l.id !== id)), [setLeads]);

  return { leads, addLead, editLead, logContact, addNote, snooze, deleteLead };
}
