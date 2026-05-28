import React, { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Goal as UIGoal, Task as UITask, ManualLog } from '@shared/types';
import type { Category, Priority } from '@shared/types';
import { useGoals } from '@shared/hooks/useGoals';
import type { Goal as HookGoal } from '@shared/hooks/useGoals';
import { useTasks } from '@shared/hooks/useTasks';
import { GOAL_ICON_MAP, DEFAULT_GOAL_ICON } from '@shared/constants';
import api from '@shared/api';

interface AppContextType {
  goals: UIGoal[];
  tasks: UITask[];
  toggleTask: (id: string) => void;
  addLog: (goalId: string, entry: ManualLog) => void;
  syncTickTick: () => void;
  isSyncing: boolean;
  syncError: string | null;
  updateGoal: (id: string, updates: Partial<HookGoal>) => Promise<void>;
  addGoal: (input: Pick<HookGoal, 'title' | 'startDate' | 'deadline' | 'category' | 'targetFrequency' | 'priority' | 'linkedTaskIds'>) => Promise<void>;
  deleteGoal: (id: string) => void;
  refetchGoals: () => void;
  /** Incremented each time pull-to-refresh fires. Components can watch this to re-fetch local data. */
  refreshKey: number;
  /** Called by pull-to-refresh in Layout; re-fetches goals + tasks and bumps refreshKey. */
  triggerRefresh: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { goals, addGoal, updateGoal, deleteGoal, logProgress, refetch: refetchGoals } = useGoals();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
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

  const triggerRefresh = useCallback(async () => {
    await Promise.all([refetchGoals(), refetchTasks()]);
    setRefreshKey(k => k + 1);
  }, [refetchGoals, refetchTasks]);

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
      syncTickTick,
      isSyncing,
      syncError,
      updateGoal,
      addGoal,
      deleteGoal,
      refetchGoals,
      refreshKey,
      triggerRefresh,
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
