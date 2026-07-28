import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Priority } from '../types';

interface AddTaskFormProps {
  onAdd: (text: string, priority: Priority) => void;
}

const PRIORITIES: { value: Priority; label: string; dot: string }[] = [
  { value: 'low', label: 'Low · +10xp', dot: 'bg-cyan-400' },
  { value: 'medium', label: 'Medium · +20xp', dot: 'bg-amber-400' },
  { value: 'high', label: 'High · +35xp', dot: 'bg-pink-500' },
];

export function AddTaskForm({ onAdd }: AddTaskFormProps) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text, priority);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="glass flex flex-col gap-3 rounded-2xl p-3 sm:flex-row sm:items-center sm:p-2 sm:pl-4">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What do you want to get done?"
        className="flex-1 bg-transparent py-2 text-[15px] text-white placeholder-white/35 outline-none"
        maxLength={200}
      />
      <div className="flex items-center gap-2">
        <div className="flex rounded-xl bg-white/5 p-1">
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPriority(p.value)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                priority === p.value ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
              }`}
              title={p.label}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />
              <span className="hidden sm:inline">{p.value}</span>
            </button>
          ))}
        </div>
        <button
          type="submit"
          className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition active:scale-95 hover:shadow-purple-500/40 disabled:opacity-40"
          disabled={!text.trim()}
        >
          Add
        </button>
      </div>
    </form>
  );
}
