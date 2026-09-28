import type { Channel, Lead } from '../types';

export const CHANNELS: { id: Channel; label: string }[] = [
  { id: 'email', label: 'Email' },
  { id: 'linkedin', label: 'LinkedIn' },
];

export const CHANNEL_LABEL: Record<Channel, string> = { email: 'Email', linkedin: 'LinkedIn' };

/** Accepts "linkedin.com/in/jane" or a bare URL and returns something a link can open. */
export function linkedinHref(value: string) {
  const v = value.trim();
  if (!v) return '';
  return /^https?:\/\//i.test(v) ? v : `https://${v.replace(/^\/+/, '')}`;
}

/** Leads saved before job title / channel existed get sensible defaults. */
export function normalizeLead(lead: Lead): Lead {
  const guessed: Channel = !lead.email && /linkedin/i.test(lead.source ?? '') ? 'linkedin' : 'email';
  return {
    ...lead,
    jobTitle: lead.jobTitle ?? '',
    linkedin: lead.linkedin ?? '',
    channel: lead.channel ?? guessed,
  };
}
