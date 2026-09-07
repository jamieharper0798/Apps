import type { ListId } from '../types';

export const LIST_ORDER: ListId[] = ['personal', 'work'];

export const LIST_META: Record<ListId, { label: string; icon: string }> = {
  personal: { label: 'Personal', icon: '🏠' },
  work: { label: 'Work', icon: '💼' },
};
