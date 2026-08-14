export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  text: string;
  done: boolean;
  priority: Priority;
  owner: string;
  /** ISO date string 'YYYY-MM-DD', or null if no due date is set. */
  dueDate: string | null;
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
}
