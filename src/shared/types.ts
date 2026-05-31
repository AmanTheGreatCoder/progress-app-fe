

export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}

interface TaskSeriesSummary {
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
  category: string;
  priority: string;
  start: string;
  end: string;
  startDate?: string;
  deadline?: string;
  icon: string;
  streak: number;
  archived: boolean;
  taskTotal: number;
  taskDone: number;
  manualLogs: any[];
  // New: series linked via GoalSeries join table
  linkedSeriesIds: string[];
  linkedSeries: TaskSeriesSummary[];
  // Legacy or Individual Task IDs
  linkedTaskIds?: string[] | string;
  linkedRecurringNames: string[];
  // Backend-computed progress fields
  done?: number;
  total?: number;
  pct?: number;
}
type TaskStatus = 'Overdue' | 'Today' | 'Upcoming' | 'Recurring' | 'Completed';

export interface Task {
  id: string;
  name: string;
  minVersion?: string;
  goalId?: string;
  tags: string[];
  dueDateStr?: string;
  due?: string;
  date: string;
  status?: TaskStatus;
  isRecurring: boolean;
  frequency?: string;
  streak?: number;
  completed: boolean;
  done?: boolean;
  points?: number;
}
