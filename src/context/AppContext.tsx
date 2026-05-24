import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Goal, Task, ManualLog } from '../types';
import { useGoals } from '../hooks/useGoals';
import { useTasks } from '../hooks/useTasks';
import api from '../services/api';

interface AppContextType {
  goals: Goal[];
  tasks: Task[];
  toggleTask: (id: string) => void;
  addLog: (goalId: string, entry: ManualLog) => void;
  saveTask: (draft: Task) => void;
  syncTickTick: () => void;
  updateGoal: (id: string, updates: any) => void;
  addGoal: (input: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { goals, addGoal, updateGoal, logProgress, refetch: refetchGoals } = useGoals();
  const { tasks, refetch: refetchTasks } = useTasks();

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    try {
      await api.patch(`/tasks/${id}`, { completed: !task.completed });
      refetchTasks();
      refetchGoals(); // progress might have changed
    } catch (e) {
      console.error(e);
    }
  };

  const addLog = async (goalId: string, entry: ManualLog) => {
    await logProgress(goalId, entry.minutes, entry.note);
  };

  const saveTask = async (_draft: Task) => {
    // Currently task edits are read-only except tags/due in UI. We can skip for now or implement full sync.
    // For now just refetch to reset.
    refetchTasks();
  };

  const syncTickTick = async () => {
    try {
      await api.post('/sync');
      refetchTasks();
      refetchGoals();
    } catch (e) {
      console.error(e);
    }
  };

  // Convert goals to UI expected format
  const mappedGoals: Goal[] = goals.map((g: any) => {
    let icon = '🎯';
    if (g.category === 'Health') icon = '👟';
    if (g.category === 'Career') icon = '🚀';
    if (g.category === 'Finance') icon = '💵';
    if (g.category === 'Learning') icon = '📚';
    if (g.category === 'Wellness') icon = '🧘';
    
    return {
      id: g.id,
      title: g.title,
      category: g.category as any,
      priority: g.priority as any,
      start: g.startDate,
      end: g.deadline,
      icon,
      streak: 0,
      archived: g.archived,
      taskTotal: g.total || 0,
      taskDone: g.done || 0,
      manualLogs: g.manualLogs || [],
      linkedRecurringNames: g.linkedRecurringNames || [],
    };
  });

  // Convert tasks to UI expected format
  const mappedTasks: Task[] = tasks.map((t: any) => ({
    id: t.id,
    title: t.name,
    goalId: '',
    due: t.date,
    tags: t.tags || [],
    done: t.completed || t.done, // Handle both raw backend and patched
    source: 'TickTick',
    isRecurring: t.isRecurring,
    repeatFlag: t.repeatFlag,
    points: t.points || 0,
    minVersion: t.minVersion || '',
    completedMin: t.completedMin || false,
  }));

  return (
    <AppContext.Provider value={{ goals: mappedGoals, tasks: mappedTasks, toggleTask, addLog, saveTask, syncTickTick, updateGoal, addGoal }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};
