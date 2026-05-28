import { useState, useCallback, useEffect } from 'react';
import api from '@shared/api';

export interface GoalLog {
  date: string;
  effortMinutes: number;
  notes: string;
}

export interface Goal {
  id: string;
  title: string;
  startDate: string;
  deadline: string;
  category: string;
  targetFrequency: number;
  targetCount: number;
  priority: string;
  archived: boolean;
  linkedTaskIds: string[];
  linkedTaskNames: string[];
  manualLogs: (string | GoalLog)[];
  createdAt: string;
  done?: number;
  total?: number;
  pct?: number;
  logs?: GoalLog[];
  linkedSeriesIds?: string[];
  linkedSeries?: unknown[];
}


export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    setError(null);
    try {
      const res = await api.get('/goals');
      setGoals(res.data.map((g: Goal) => ({
        ...g,
        linkedTaskNames: g.linkedTaskNames || [],
        linkedRecurringNames: (g as unknown as Record<string, unknown>).linkedRecurringNames || [],
        targetCount: g.targetCount ?? 0,
        manualLogs: g.logs || [],
      })));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load goals.';
      console.error(err);
      setError(msg);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const addGoal = useCallback(async (input: Pick<Goal, 'title' | 'startDate' | 'deadline' | 'category' | 'targetFrequency' | 'priority' | 'linkedTaskIds'>) => {
    try {
      await api.post('/goals', input);
      fetchGoals();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create goal.';
      console.error(err);
      setError(msg);
    }
  }, [fetchGoals]);

  const updateGoal = useCallback(async (id: string, updates: Partial<Goal>) => {
    try {
      await api.patch(`/goals/${id}`, updates);
      fetchGoals();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update goal.';
      console.error(err);
      setError(msg);
    }
  }, [fetchGoals]);

  const deleteGoal = useCallback(async (id: string) => {
    try {
      await api.delete(`/goals/${id}`);
      fetchGoals();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete goal.';
      console.error(err);
      setError(msg);
    }
  }, [fetchGoals]);

  const logProgress = useCallback(async (goalId: string, effortMinutes: number = 15, notes: string = '') => {
    try {
      await api.post(`/goals/${goalId}/log`, { effortMinutes, notes });
      fetchGoals();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to log progress.';
      console.error(err);
      setError(msg);
    }
  }, [fetchGoals]);

  return { goals, error, addGoal, updateGoal, deleteGoal, logProgress, refetch: fetchGoals };
};
