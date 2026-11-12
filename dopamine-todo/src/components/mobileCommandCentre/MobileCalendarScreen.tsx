import type { Task } from '../../types';
import { dayKey } from '../../lib/gamify';
import { formatCCDue, isOverdue } from '../../lib/commandCentre';
import type { AccentTokens } from '../../lib/accent';

interface MobileCalendarScreenProps {
  listTasks: Task[];
  today: string;
  selectedDay: string;
  onSelectDay: (day: string) => void;
  accent: AccentTokens;
  onToggle: (id: string) => void;
  onOpen: (id: string) => void;
  onAddForDay: (day: string) => void;
}

function currentWeek(today: string): string[] {
  const [y, m, d] = today.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const sunday = new Date(date);
  sunday.setDate(date.getDate() - date.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(sunday);
    day.setDate(sunday.getDate() + i);
    return dayKey(day);
  });
}

export function MobileCalendarScreen({ listTasks, today, selectedDay, onSelectDay, accent, onToggle, onOpen, onAddForDay }: MobileCalendarScreenProps) {
  const week = currentWeek(today);
  const daysWithTasks = new Set(listTasks.filter((t) => t.dueDate).map((t) => t.dueDate as string));
  const dayTasks = listTasks
    .filter((t) => t.dueDate === selectedDay)
    .sort((a, b) => Number(a.done) - Number(b.done));

  return (
    <div className="flex flex-col gap-5 px-4 pb-32 pt-[max(1.1rem,calc(env(safe-area-inset-top)+0.6rem))]">
      <h1 className="text-[26px] font-bold tracking-tight text-cc-ink">Calendar</h1>

      <div className="grid grid-cols-7 gap-1.5">
        {week.map((day) => {
          const date = new Date(day + 'T00:00:00');
          const isToday = day === today;
          const isSelected = day === selectedDay;
          return (
            <button
              key={day}
              onClick={() => onSelectDay(day)}
              className="flex flex-col items-center gap-1.5 rounded-2xl py-2.5 transition active:scale-95"
              style={{
                background: isSelected ? '#1d1a16' : 'rgba(255,255,255,.5)',
                border: isToday && !isSelected ? '1.5px solid #1d1a16' : '1.5px solid transparent',
              }}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: isSelected ? 'rgba(255,255,255,.65)' : 'var(--cc-ink-4)' }}>
                {date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2)}
              </span>
              <span className="text-[15px] font-bold" style={{ color: isSelected ? '#fff' : 'var(--cc-ink)' }}>
                {date.getDate()}
              </span>
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: daysWithTasks.has(day) ? (isSelected ? '#fff' : accent.solid) : 'transparent' }}
              />
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        <span className="pl-1 text-[13px] font-bold text-cc-ink">
          {new Date(selectedDay + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
        {dayTasks.length === 0 ? (
          <button
            onClick={() => onAddForDay(selectedDay)}
            className="cc-glass-card flex flex-col items-center gap-2 rounded-[22px] py-9 text-center transition active:scale-[0.98]"
          >
            <span className="text-2xl">🗓️</span>
            <span className="text-[13px] font-semibold text-cc-ink">Nothing due this day</span>
            <span
              className="mt-1 rounded-full px-4 py-2 text-[13px] font-semibold text-white"
              style={{ background: accent.solid }}
            >
              Add a task
            </span>
          </button>
        ) : (
          dayTasks.map((task) => {
            const late = isOverdue(task, today);
            return (
              <div
                key={task.id}
                className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border px-3.5 py-3"
                style={{ borderColor: late ? 'rgba(253,227,221,.9)' : 'rgba(255,255,255,.65)', background: late ? 'rgba(253,227,221,.85)' : 'rgba(255,255,255,.7)' }}
              >
                <button
                  onClick={() => onToggle(task.id)}
                  aria-label={task.done ? 'Mark as not done' : 'Mark as done'}
                  className="flex h-6 w-6 items-center justify-center rounded-full border-[1.5px] text-xs font-extrabold text-white transition active:scale-[0.88]"
                  style={{ background: task.done ? accent.solid : 'rgba(255,255,255,.85)', borderColor: task.done ? accent.solid : 'rgba(29,26,22,.25)' }}
                >
                  {task.done && '✓'}
                </button>
                <button onClick={() => onOpen(task.id)} className={`flex min-w-0 flex-col text-left ${task.done ? 'opacity-50' : ''}`}>
                  <span className={`truncate text-[15px] font-semibold text-cc-ink ${task.done ? 'line-through' : ''}`}>{task.text}</span>
                </button>
                <span
                  className="whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-semibold"
                  style={{ background: late ? '#fff' : 'rgba(255,255,255,.9)', color: late ? 'var(--cc-red-text)' : 'var(--cc-ink)' }}
                >
                  {formatCCDue(task.dueDate, today)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
