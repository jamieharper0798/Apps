export type LeadStatus = 'new' | 'contacted' | 'follow-up' | 'qualified' | 'won' | 'lost';

export type ActivityKind = 'created' | 'contacted' | 'note' | 'status';

export interface Activity {
  id: string;
  /** ISO timestamp */
  at: string;
  kind: ActivityKind;
  text: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  /** Estimated deal value, in whole currency units. */
  value: number | null;
  status: LeadStatus;
  /** Local date key (YYYY-MM-DD) of the next planned reach-out, or null for none. */
  nextFollowUp: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
  lastContactedAt: string | null;
  activity: Activity[];
}

export type LeadDraft = Pick<
  Lead,
  'name' | 'company' | 'email' | 'phone' | 'source' | 'value' | 'status' | 'nextFollowUp' | 'notes'
>;
