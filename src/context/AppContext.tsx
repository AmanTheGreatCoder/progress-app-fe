import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Goal, Task, ManualLog } from '../types';
import { initialGoals, initialTasks } from '../data';

interface AppContextType {
  goals: Goal[];
  tasks: Task[];
  toggleTask: (id: string) => void;
  addLog: (goalId: string, entry: ManualLog) => void;
  saveTask: (draft: Task) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const toggleTask = (id: string) => {
    setTasks(ts => ts.map(t => {
      if (t.id !== id) return t;
      const newDone = !t.done;
      // increment/decrement parent goal taskDone
      setGoals(gs => gs.map(g => g.id === t.goalId
        ? { ...g, taskDone: Math.max(0, Math.min(g.taskTotal, g.taskDone + (newDone ? 1 : -1))) }
        : g
      ));
      return { ...t, done: newDone };
    }));
  };

  const addLog = (goalId: string, entry: ManualLog) => {
    setGoals(gs => gs.map(g => g.id === goalId
      ? { ...g, manualLogs: [entry, ...g.manualLogs] }
      : g
    ));
  };

  const saveTask = (draft: Task) => {
    setTasks(ts => ts.map(t => t.id === draft.id ? draft : t));
  };

  return (
    <AppContext.Provider value={{ goals, tasks, toggleTask, addLog, saveTask }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
