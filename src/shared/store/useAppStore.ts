import { create } from 'zustand';
import { api, clearAuthToken } from '@/api';
import type { Task, Goal, User } from '@/shared/types';

export interface AppState {
  // Auth
  user: User | null;
  userLoading: boolean;
  fetchUser: () => Promise<void>;
  logout: () => void;

  // Data
  tasks: Task[];
  goals: Goal[];
  points: number;
  targetPoints: number;
  selectedDate: string;
  activeFilter: string;

  // Actions
  fetchTasks: (date: string) => Promise<void>;
  fetchGoals: () => Promise<void>;
  addGoal: (goal: Partial<Goal>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  fetchDashboard: () => Promise<void>;
  toggleTaskCompletion: (id: string) => Promise<void>;
  setSelectedDate: (date: string) => void;
  setActiveFilter: (filter: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Auth
  user: null,
  userLoading: true,

  fetchUser: async () => {
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data, userLoading: false });
    } catch {
      set({ user: null, userLoading: false });
    }
  },

  logout: () => {
    clearAuthToken();
    set({ user: null });
  },

  // Data
  tasks: [],
  goals: [],
  points: 0,
  targetPoints: 120,
  selectedDate: new Date().toISOString().split('T')[0],
  activeFilter: 'All',

  fetchTasks: async (date: string) => {
    try {
      const res = await api.get(`/tasks?date=${date}`);
      set({ tasks: res.data });
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    }
  },

  fetchGoals: async () => {
    try {
      const res = await api.get('/goals');
      set({ goals: res.data });
    } catch (err) {
      console.error('Failed to fetch goals', err);
    }
  },

  addGoal: async (goal) => {
    try {
      const res = await api.post('/goals', goal);
      set((state) => ({ goals: [...state.goals, res.data] }));
    } catch (err) {
      console.error('Failed to add goal', err);
    }
  },

  updateGoal: async (id, updates) => {
    try {
      const res = await api.patch(`/goals/${id}`, updates);
      set((state) => ({ goals: state.goals.map(g => g.id === id ? res.data : g) }));
    } catch (err) {
      console.error('Failed to update goal', err);
    }
  },

  deleteGoal: async (id) => {
    try {
      await api.delete(`/goals/${id}`);
      set((state) => ({ goals: state.goals.filter(g => g.id !== id) }));
    } catch (err) {
      console.error('Failed to delete goal', err);
    }
  },

  fetchDashboard: async () => {
    try {
      const res = await api.get('/dashboard');
      set({
        points: res.data.currentScore || 0,
        targetPoints: res.data.targetPoints || 120,
      });
    } catch (err) {
      console.error('Failed to fetch dashboard', err);
    }
  },

  toggleTaskCompletion: async (id: string) => {
    const { tasks } = get();
    const taskIdx = tasks.findIndex(t => t.id === id);
    if (taskIdx === -1) return;

    const isCompleting = !tasks[taskIdx].completed;

    set({ tasks: tasks.map(t => (t.id === id ? { ...t, completed: isCompleting } : t)) });

    try {
      await api.patch(`/tasks/${id}`, { completed: isCompleting });
      get().fetchDashboard();
    } catch (err) {
      console.error('Failed to toggle task', err);
      set({ tasks: tasks.map(t => (t.id === id ? { ...t, completed: !isCompleting } : t)) });
    }
  },

  setSelectedDate: (date: string) => set({ selectedDate: date }),
  setActiveFilter: (filter: string) => set({ activeFilter: filter }),
}));
