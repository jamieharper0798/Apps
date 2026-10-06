import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Priority } from '../types';
import { PRIORITY_CODE } from '../lib/priority';

interface AddTaskFormProps {
  onAdd: (text: string, priority: Priority) => void;
  listLabel: string;
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

export function AddTaskForm({ onAdd, listLabel }: AddTaskFormProps) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text, priority);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="panel flex flex-col gap-3 rounded-lg p-3 ring-1 ring-transparent transition focus-within:ring-[#c6ff4a]/40 sm:flex-row sm:items-center sm:p-2 sm:pl-4">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="shrink-0 text-[#c6ff4a]">&gt;</span>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`add a ${listLabel.toLowerCase()} task_`}
          className="min-w-0 flex-1 bg-transparent py-2 text-[15px] text-white placeholder-white/30 outline-none"
          maxLength={200}
        />
      </div>
      <div className="flex items-center gap-2">
        <div className="flex gap-1 rounded border border-white/10 p-1">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={`rounded px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${
                priority === p ? 'bg-white/10 text-white' : 'text-white/35 hover:text-white/70'
              }`}
              title={PRIORITY_CODE[p]}
            >
              {PRIORITY_CODE[p]}
            </button>
          ))}
        </div>
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded border border-[#c6ff4a]/60 px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-[#c6ff4a] transition active:scale-95 hover:bg-[#c6ff4a]/10 disabled:opacity-30"
          disabled={!text.trim()}
        >
          Add
          <span aria-hidden>↵</span>
        </button>
      </div>
    </form>
  );
}
