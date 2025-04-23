
export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  startTime: string | null;
  endTime: string | null;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  progress: number; // 0-100
  spilledFrom?: string; // Date string if task was carried over
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
}

export interface DailyPlan {
  date: string;
  name?: string;
  tasks: Task[];
  notes: Note[];
  lastUpdated: string;
}
