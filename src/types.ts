export interface ManualLog {
  date: string;
  minutes: number;
  note: string;
}

export type Category = 'Health' | 'Career' | 'Finance' | 'Learning' | 'Wellness';
export type Priority = 'High' | 'Medium' | 'Low';

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
  linkedRecurringNames: string[];
}

export interface Task {
  id: string;
  title: string;
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
