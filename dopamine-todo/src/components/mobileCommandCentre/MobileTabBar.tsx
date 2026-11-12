import type { ReactNode } from 'react';
import type { AccentTokens } from '../../lib/accent';

export type MobileTab = 'today' | 'tasks' | 'calendar' | 'progress';

interface MobileTabBarProps {
  tab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  overdueCount: number;
  accent: AccentTokens;
  onAddTask: () => void;
}

const TABS: { value: MobileTab; label: string; icon: ReactNode }[] = [
  {
    value: 'today',
    label: 'Today',
    icon: (
      <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" />
    ),
  },
  {
    value: 'tasks',
    label: 'Tasks',
    icon: (
      <>
        <path d="m9 11 3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </>
    ),
  },
  {
    value: 'calendar',
    label: 'Calendar',
    icon: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </>
    ),
  },
  {
    value: 'progress',
    label: 'Progress',
    icon: <path d="M18 20V10M12 20V4M6 20v-6" />,
  },
];

export function MobileTabBar({ tab, onTabChange, overdueCount, accent, onAddTask }: MobileTabBarProps) {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-4 z-30 flex items-center gap-2"
      style={{ bottom: 'max(14px, env(safe-area-inset-bottom))' }}
    >
      <div
        className="grid flex-1 grid-cols-4 gap-0.5 rounded-full p-[5px]"
        style={{
          background: 'rgba(36,30,24,.82)',
          backdropFilter: 'blur(28px) saturate(160%)',
          WebkitBackdropFilter: 'blur(28px) saturate(160%)',
          border: '1px solid rgba(255,255,255,.22)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,.18), 0 14px 40px rgba(40,25,10,.35)',
        }}
      >
        {TABS.map((t) => {
          const active = t.value === tab;
          return (
            <button
              key={t.value}
              onClick={() => onTabChange(t.value)}
              aria-current={active}
              className="relative flex h-[52px] flex-col items-center justify-center gap-0.5 rounded-full transition active:scale-[0.94]"
              style={{ background: active ? '#fff' : 'transparent', color: active ? '#1d1a16' : 'rgba(255,255,255,.75)' }}
            >
              <svg
                aria-hidden="true"
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill={t.value === 'today' ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {t.icon}
              </svg>
              <span className="text-[10px] font-bold">{t.label}</span>
              {t.value === 'tasks' && overdueCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute left-[calc(50%+7px)] top-[5px] flex h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 px-1 text-[10px] font-extrabold text-white"
                  style={{ background: '#d2452f', borderColor: active ? '#fff' : '#2a241e' }}
                >
                  {overdueCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <button
        onClick={onAddTask}
        aria-label="Add task"
        className="flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-full border text-white transition active:scale-90"
        style={{
          borderColor: 'rgba(255,255,255,.45)',
          background: accent.orb,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,.4), 0 0 22px ${accent.glow}, 0 14px 30px rgba(40,25,10,.3)`,
        }}
      >
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </nav>
  );
}
