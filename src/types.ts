export interface ManualLog {
  date: string;
  minutes: number;
  note: string;
}

export type Category = 'Health' | 'Career' | 'Finance' | 'Learning' | 'Wellness';
export type Priority = 'High' | 'Medium' | 'Low';

// A TaskSeries summary as returned by /api/tasks/series and embedded in goals
export interface TaskSeriesSummary {
  id:        string;
  name:      string;
  tags:      string[];
  firstSeen: string;  // YYYY-MM-DD
  lastSeen:  string;  // YYYY-MM-DD
  taskCount: number;
}

export interface Goal {
  id: string;
  title: string;
  category: Category;
  priority: Priority;
  start: string;
  end: string;
  icon: string;
  streak: number;
  archived: boolean;
  taskTotal: number;
  taskDone: number;
  manualLogs: ManualLog[];
  // New: series linked via GoalSeries join table
  linkedSeriesIds: string[];
  linkedSeries: TaskSeriesSummary[];
  // Legacy
  linkedRecurringNames: string[];
}

export interface Task {
  id: string;
  title: string;   // mapped from DB `name` in AppContext
  goalId: string;
  due: string;
  tags: string[];
  done: boolean;
  source: string;
  isRecurring: boolean;
  repeatFlag: string;
  points: number;
  minVersion: string;
  completedMin: boolean;
}
