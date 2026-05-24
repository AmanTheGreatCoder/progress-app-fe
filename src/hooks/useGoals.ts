import { useState, useCallback, useEffect } from 'react';
import api from '../services/api';

export interface GoalLog {
  date: string;
  effortMinutes: number;
  notes: string;
}

export interface Goal {
  id: string;
  title: string;
  startDate: string;     // YYYY-MM-DD
  deadline: string;      // YYYY-MM-DD
  category: string;      // Health, Career, Learning, etc.
  targetFrequency: number; // e.g. 5 times per week
  targetCount: number;     // total sessions to achieve (0 = derive from frequency)
  priority: string;      // High, Medium, Low
  archived: boolean;
  linkedTaskIds: string[];
  linkedTaskNames: string[];
  manualLogs: (string | GoalLog)[];  // string is for legacy
  createdAt: string;
  done?: number;
  total?: number;
  pct?: number;
  logs?: GoalLog[];
}

export const daysUntil = (dateStr: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
};

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);

  const fetchGoals = useCallback(async () => {
    try {
      const res = await api.get('/goals');
      // Backend now returns linkedTaskIds as string array and logs instead of manualLogs
      // For compatibility with UI, we map logs to manualLogs
      setGoals(res.data.map((g: any) => ({ ...g, linkedTaskNames: g.linkedTaskNames || [], linkedRecurringNames: g.linkedRecurringNames || [], targetCount: g.targetCount ?? 0, manualLogs: g.logs || [] })));
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const addGoal = useCallback(async (input: Pick<Goal, 'title' | 'startDate' | 'deadline' | 'category' | 'targetFrequency' | 'priority' | 'linkedTaskIds'>) => {
    try {
      await api.post('/goals', input);
      fetchGoals();
    } catch (err) { console.error(err); }
  }, [fetchGoals]);

  const updateGoal = useCallback(async (id: string, updates: Partial<Goal>) => {
    try {
      await api.patch(`/goals/${id}`, updates);
      fetchGoals();
    } catch (err) { console.error(err); }
  }, [fetchGoals]);

  const deleteGoal = useCallback(async (id: string) => {
    try {
      await api.delete(`/goals/${id}`);
      fetchGoals();
    } catch (err) { console.error(err); }
  }, [fetchGoals]);

  const logProgress = useCallback(async (goalId: string, effortMinutes: number = 15, notes: string = '') => {
    try {
      await api.post(`/goals/${goalId}/log`, { effortMinutes, notes });
      fetchGoals();
    } catch (err) { console.error(err); }
  }, [fetchGoals]);

  return { goals, addGoal, updateGoal, deleteGoal, logProgress, refetch: fetchGoals };
};
