import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TodayScreen from '@/TodayScreen';
import GoalsScreen from '@/GoalsScreen';
import GoalDetailScreen from '@/GoalDetailScreen';
import TasksScreen from '@/TasksScreen';
import AnalyticsScreen from '@/AnalyticsScreen';
import SettingsScreen from '@/SettingsScreen';
import LoginScreen from '@/LoginScreen';
import { Toaster } from 'sonner';
import { useAppStore } from '@/shared/store/useAppStore';

function App() {
  const { user, userLoading, fetchUser } = useAppStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Spinner while we check the session
  if (userLoading) {
    return (
      <div className="h-[100dvh] w-full flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not signed in — only show login
  if (!user) {
    return (
      <>
        <Toaster position="top-center" richColors />
        <LoginScreen />
      </>
    );
  }

  // Signed in — full app
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
