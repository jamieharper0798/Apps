import { useState } from 'react';
import type { ListId, Task } from '../../types';
import type { Filter } from '../TaskList';
import { LIST_ORDER, LIST_META } from '../../lib/lists';
import { filterTasksForCommandCentre } from '../../lib/commandCentre';
import { groupTasksByDueBucket, mobileFilterChips, searchTasks } from '../../lib/mobileCommandCentre';
import type { AccentTokens } from '../../lib/accent';
import { MobileTaskGroupList } from './MobileTaskGroupList';

interface MobileTasksScreenProps {
  listTasks: Task[];
  listCounts: Record<ListId, number>;
  today: string;
  activeList: ListId;
  onActiveListChange: (list: ListId) => void;
  filter: Filter;
  onFilterChange: (f: Filter) => void;
  taskView: 'list' | 'grid';
  onTaskViewChange: (v: 'list' | 'grid') => void;
  accent: AccentTokens;
  onToggle: (id: string) => void;
  onSnooze: (id: string) => void;
  onOpen: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
  onClearCompleted: () => void;
}

export function MobileTasksScreen({
  listTasks,
  listCounts,
  today,
  activeList,
  onActiveListChange,
  filter,
  onFilterChange,
  taskView,
  onTaskViewChange,
  accent,
  onToggle,
  onSnooze,
  onOpen,
  onReorder,
  onClearCompleted,
}: MobileTasksScreenProps) {
  const [query, setQuery] = useState('');

  const searchedAll = searchTasks(listTasks, query);
  const chips = mobileFilterChips(searchedAll, today);
  const filtered = filterTasksForCommandCentre(searchedAll, filter, today);
  const groups = groupTasksByDueBucket(filtered, today);

  return (
    <div className="flex flex-col gap-4 px-4 pb-32 pt-[max(1.1rem,calc(env(safe-area-inset-top)+0.6rem))]">
      <div className="flex items-center justify-between">
        <h1 className="text-[26px] font-bold tracking-tight text-cc-ink">Tasks</h1>
        <div className="flex shrink-0 gap-0.5 rounded-full bg-cc-ink/10 p-1">
          <button
            onClick={() => onTaskViewChange('list')}
            aria-label="List view"
            aria-pressed={taskView === 'list'}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition active:scale-90 ${taskView === 'list' ? 'bg-white text-cc-ink' : 'text-cc-ink-3'}`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>
          </button>
          <button
            onClick={() => onTaskViewChange('grid')}
            aria-label="Grid view"
            aria-pressed={taskView === 'grid'}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition active:scale-90 ${taskView === 'grid' ? 'bg-white text-cc-ink' : 'text-cc-ink-3'}`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-3.5 py-2.5">
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-cc-ink-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="m20 20-3-3" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, notes, owner"
          className="min-w-0 flex-1 bg-transparent text-[14px] text-cc-ink outline-none placeholder-cc-ink-4"
        />
      </div>

      <div className="flex gap-1 rounded-full bg-white/45 p-1">
        {LIST_ORDER.map((list) => (
          <button
            key={list}
            onClick={() => onActiveListChange(list)}
            className={`flex-1 whitespace-nowrap rounded-full py-2 text-[13px] font-semibold transition active:scale-95 ${
              list === activeList ? 'bg-[#1d1a16] text-white' : 'text-cc-ink-3'
            }`}
          >
            {LIST_META[list].label} {listCounts[list] ?? 0}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {chips.map((chip) => (
          <button
            key={chip.value}
            onClick={() => onFilterChange(chip.value)}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold text-cc-ink transition active:scale-95 ${
              filter === chip.value ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,.08)]' : 'bg-white/40'
            }`}
          >
            {chip.label} · {chip.count}
          </button>
        ))}
      </div>

      <p className="px-1 text-[11px] text-cc-ink-4">Swipe a row to complete or snooze. Drag ⋮⋮ to reorder within a group.</p>

      {groups.length === 0 ? (
        <div className="cc-glass-card rounded-[22px] py-10 text-center text-[14px] text-cc-ink-3">Nothing here.</div>
      ) : (
        groups.map((group) => (
          <MobileTaskGroupList
            key={group.key}
            group={group}
            today={today}
            taskView={taskView}
            accent={accent}
            onToggle={onToggle}
            onSnooze={onSnooze}
            onOpen={onOpen}
            onReorder={onReorder}
            onClearCompleted={group.key === 'completed' ? onClearCompleted : undefined}
          />
        ))
      )}
    </div>
  );
}
