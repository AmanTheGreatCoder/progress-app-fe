import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Goal as UIGoal, Task as UITask, ManualLog } from '../types';
import type { Category, Priority } from '../types';
import { useGoals } from '../hooks/useGoals';
import type { Goal as HookGoal } from '../hooks/useGoals';
import { useTasks } from '../hooks/useTasks';
import { GOAL_ICON_MAP, DEFAULT_GOAL_ICON } from '../constants';
import api from '../services/api';

interface AppContextType {
  goals: UIGoal[];
  tasks: UITask[];
  toggleTask: (id: string) => void;
  addLog: (goalId: string, entry: ManualLog) => void;
  saveTask: (draft: UITask) => void;
  syncTickTick: () => void;
  isSyncing: boolean;
  syncError: string | null;
  updateGoal: (id: string, updates: Partial<HookGoal>) => void;
  addGoal: (input: Pick<HookGoal, 'title' | 'startDate' | 'deadline' | 'category' | 'targetFrequency' | 'priority' | 'linkedTaskIds'>) => void;
  deleteGoal: (id: string) => void;
  refetchGoals: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { goals, addGoal, updateGoal, deleteGoal, logProgress, refetch: refetchGoals } = useGoals();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const { tasks: rawTasks, refetch: refetchTasks } = useTasks();

  const toggleTask = async (id: string) => {
    const task = rawTasks.find(t => t.id === id);
    if (!task) return;
    try {
      await api.patch(`/tasks/${id}`, { completed: !task.completed });
      refetchTasks();
      refetchGoals();
    } catch (e) {
      console.error(e);
    }
  };

  const addLog = async (goalId: string, entry: ManualLog) => {
    await logProgress(goalId, entry.minutes, entry.note);
  };

  const saveTask = async (_draft: UITask) => {
    refetchTasks();
  };

  const syncTickTick = async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      await api.post('/sync');
      refetchTasks();
      refetchGoals();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Sync failed. Please try again.';
      setSyncError(msg);
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Map raw API goals (HookGoal shape) to UI Goal shape
  const mappedGoals: UIGoal[] = goals.map((g: HookGoal) => ({
    id: g.id,
    title: g.title,
    category: g.category as Category,
    priority: g.priority as Priority,
    start: g.startDate,
    end: g.deadline,
    icon: GOAL_ICON_MAP[g.category] ?? DEFAULT_GOAL_ICON,
    streak: 0,
    archived: g.archived,
    taskTotal: g.total ?? 0,
    taskDone: g.done ?? 0,
    manualLogs: (g.manualLogs as unknown as ManualLog[]) ?? [],
    linkedSeriesIds: (g as unknown as { linkedSeriesIds?: string[] }).linkedSeriesIds ?? [],
    linkedSeries: (g as unknown as { linkedSeries?: UIGoal['linkedSeries'] }).linkedSeries ?? [],
    linkedRecurringNames: (g as unknown as { linkedRecurringNames?: string[] }).linkedRecurringNames ?? [],
  }));

  // Map raw API tasks (RawTask shape) to UI Task shape
  const mappedTasks: UITask[] = rawTasks.map(t => ({
    id: t.id,
    title: t.name,
    goalId: '',
    due: t.date,
    tags: t.tags ?? [],
    done: t.completed,
    source: 'TickTick',
    isRecurring: t.isRecurring ?? false,
    repeatFlag: t.repeatFlag ?? '',
    points: t.points ?? 0,
    minVersion: t.minVersion ?? '',
    completedMin: t.completedMin ?? false,
  }));

  return (
    <AppContext.Provider value={{
      goals: mappedGoals,
      tasks: mappedTasks,
      toggleTask,
      addLog,
      saveTask,
      syncTickTick,
      isSyncing,
      syncError,
      updateGoal,
      addGoal,
      deleteGoal,
      refetchGoals,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};
