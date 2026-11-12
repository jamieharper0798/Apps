import type { DopamineState, Task } from '../../types';
import { XP_BY_PRIORITY, levelTitle, dayKey } from '../../lib/gamify';
import { weeklyCompletionBars, weeklyStreakDots } from '../../lib/mobileCommandCentre';
import type { AccentTokens } from '../../lib/accent';

interface MobileProgressScreenProps {
  tasks: Task[];
  dopamine: DopamineState;
  levelInfo: { level: number; xpIntoLevel: number; xpForNextLevel: number };
  today: string;
  accent: AccentTokens;
}

export function MobileProgressScreen({ tasks, dopamine, levelInfo, today, accent }: MobileProgressScreenProps) {
  const xpPct = levelInfo.xpForNextLevel ? (levelInfo.xpIntoLevel / levelInfo.xpForNextLevel) * 100 : 0;
  const bars = weeklyCompletionBars(tasks, today);
  const maxBar = Math.max(1, ...bars.map((b) => b.count));
  const dots = weeklyStreakDots(tasks, today);
  const xpToday = tasks
    .filter((t) => t.completedAt !== null && dayKey(new Date(t.completedAt as number)) === today)
    .reduce((sum, t) => sum + XP_BY_PRIORITY[t.priority], 0);

  return (
    <div className="flex flex-col gap-4 px-4 pb-32 pt-[max(1.1rem,calc(env(safe-area-inset-top)+0.6rem))]">
      <h1 className="text-[26px] font-bold tracking-tight text-cc-ink">Progress</h1>

      <div className="flex flex-col gap-4 rounded-[26px] p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.3)]" style={{ background: accent.gradient }}>
        <div className="flex items-baseline justify-between">
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold opacity-85">Level {levelInfo.level}</span>
            <span className="text-[22px] font-bold tracking-tight">{levelTitle(levelInfo.level)}</span>
          </div>
          <span className="text-[13px] font-semibold opacity-85">{dopamine.xp} XP total</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/25">
          <div className="h-2 rounded-full bg-white" style={{ width: `${xpPct}%`, transition: 'width .6s cubic-bezier(.2,.9,.25,1)' }} />
        </div>
        <div className="flex items-center justify-between text-[12px] font-semibold opacity-90">
          <span>{levelInfo.xpIntoLevel} / {levelInfo.xpForNextLevel} XP</span>
          <span>{levelInfo.xpForNextLevel - levelInfo.xpIntoLevel} XP to next level</span>
        </div>
        <div className="flex gap-2">
          {(['low', 'medium', 'high'] as const).map((p) => (
            <span key={p} className="flex-1 rounded-xl bg-white/15 px-2 py-2 text-center text-[11px] font-bold capitalize">
              {p} +{XP_BY_PRIORITY[p]}
            </span>
          ))}
        </div>
      </div>

      <div className="cc-glass-card flex flex-col gap-3 rounded-[24px] p-4">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold text-cc-ink">🔥 {dopamine.streak} day{dopamine.streak === 1 ? '' : 's'} streak</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {dots.map((d) => (
            <div key={d.day} className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-semibold text-cc-ink-4">{d.label}</span>
              <span
                aria-hidden="true"
                className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white"
                style={{ background: d.cleared ? accent.solid : 'rgba(29,26,22,.1)', color: d.cleared ? '#fff' : 'transparent' }}
              >
                {d.cleared ? '✓' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="cc-glass-card flex flex-col gap-3 rounded-[24px] p-4">
        <span className="text-[13px] font-bold text-cc-ink">Cleared this week</span>
        <div className="flex items-end justify-between gap-2" style={{ height: 88 }}>
          {bars.map((b) => (
            <div key={b.day} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className="w-full rounded-t-md"
                style={{ height: `${Math.max(6, (b.count / maxBar) * 64)}px`, background: b.day === today ? accent.solid : 'rgba(29,26,22,.18)' }}
              />
              <span className="text-[10px] font-semibold text-cc-ink-4">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="cc-glass-card flex flex-col gap-1 rounded-[22px] p-4">
          <span className="text-[12px] font-medium text-cc-ink-3">All-time cleared</span>
          <span className="text-2xl font-bold tracking-tight text-cc-ink">{dopamine.totalCompleted}</span>
        </div>
        <div className="cc-glass-card flex flex-col gap-1 rounded-[22px] p-4">
          <span className="text-[12px] font-medium text-cc-ink-3">XP today</span>
          <span className="text-2xl font-bold tracking-tight text-cc-ink">{xpToday}</span>
        </div>
      </div>
    </div>
  );
}
