export type Priority = 'low' | 'medium' | 'high';

export type ListId = 'personal' | 'work';

export type Repeat = 'none' | 'daily' | 'weekly';

export interface Task {
  id: string;
  text: string;
  done: boolean;
  priority: Priority;
  owner: string;
  list: ListId;
  /** ISO date string 'YYYY-MM-DD', or null if no due date is set. */
  dueDate: string | null;
  notes: string;
  repeat: Repeat;
  createdAt: number;
  completedAt: number | null;
}

export interface DopamineState {
  xp: number;
  level: number;
  streak: number;
  lastCompletedDay: string | null;
  totalCompleted: number;
}

export interface AppState {
  tasks: Task[];
  dopamine: DopamineState;
}

export interface Branding {
  name: string;
  icon192: string | null;
  icon512: string | null;
  /** Hex color for the app's accent (replaces the default lime). Null = default. */
  accentColor: string | null;
}
