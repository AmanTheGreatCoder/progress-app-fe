import AnalyticsScreen from '@/AnalyticsScreen';
import { setAuthToken } from '@/api';
import GoalDetailScreen from '@/GoalDetailScreen';
import GoalsScreen from '@/GoalsScreen';
import LoginScreen from '@/LoginScreen';
import SettingsScreen from '@/SettingsScreen';
import { useAppStore } from '@/shared/store/useAppStore';
import TasksScreen from '@/TasksScreen';
import TodayScreen from '@/TodayScreen';
import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';

function App() {
  const { user, userLoading, fetchUser } = useAppStore();

  useEffect(() => {
    // After Google OAuth redirect, the token arrives as ?token=...
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setAuthToken(token); // writes to both _token variable and localStorage atomically
      window.history.replaceState({}, '', window.location.pathname);
    }
    fetchUser();
  }, [fetchUser]);

  if (userLoading) {
    return (
      <div className="h-[100dvh] w-full flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Toaster position="top-center" richColors />
        <LoginScreen />
      </>
    );
  }

  return (
    <>
      <Toaster position="top-center" richColors />
      <Routes>
        <Route path="/" element={<Navigate to="/today" replace />} />
        <Route path="/today" element={<TodayScreen />} />
        <Route path="/goals" element={<GoalsScreen />} />
        <Route path="/goals/:goalId" element={<GoalDetailScreen />} />
        <Route path="/tasks" element={<TasksScreen />} />
        <Route path="/analytics" element={<AnalyticsScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
      </Routes>
    </>
  );
}

export default App;
